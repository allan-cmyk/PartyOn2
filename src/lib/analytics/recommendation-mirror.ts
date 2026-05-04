/**
 * Recommendation mirror — renders a RecommendationItem as Obsidian-shaped markdown
 * (frontmatter + body + Updates log) and commits to GitHub at
 * docs/marketing/recommendations/<slug>.md.
 *
 * Triggered on every status change via the API POST handler. Fails soft so an
 * unconfigured GITHUB_REPO_TOKEN doesn't block the DB update.
 */

import type { RecommendationItem } from '@prisma/client';
import { putFileToRepo } from '@/lib/github/put-file';

export interface MirrorResult {
  mirrored: boolean;
  path?: string;
  url?: string;
  error?: string;
}

/**
 * Status change event we want to record in the Updates log.
 */
export interface StatusChangeEvent {
  date: string;            // YYYY-MM-DD
  fromStatus: string | null;
  toStatus: string;
  notes?: string;
  actor?: string;          // 'operator' | 'agent' | etc.
}

/**
 * Render a recommendation as the canonical markdown doc, optionally appending a new
 * status-change event to the Updates log. The renderer reconstructs the full doc
 * from the DB record + the new event each time — there's no stateful append on disk.
 *
 * Existing Updates entries are reconstructed from the rec's createdAt + status history
 * we keep in DB columns where possible. Where we don't have history, we synthesize a
 * single creation entry. The result is "good enough" — the GitHub commit history is
 * the audit log of record.
 */
export function renderRecommendationMarkdown(
  rec: RecommendationItem,
  newEvent?: StatusChangeEvent
): string {
  const slug = slugifyTitle(rec.title);
  const period = isoWeekFromDate(rec.generatedAt);
  const datesAccepted = rec.status === 'approved' || rec.status === 'shipped' ? rec.generatedAt : null;
  const dateExecuted = rec.status === 'shipped' ? rec.shippedAt : null;

  const fm: Array<[string, string | number | null | string[]]> = [
    ['title', JSON.stringify(rec.title)],
    ['period_proposed', period],
    ['date_proposed', rec.generatedAt.toISOString().slice(0, 10)],
    ['date_accepted', datesAccepted ? datesAccepted.toISOString().slice(0, 10) : 'null'],
    ['date_executed', dateExecuted ? dateExecuted.toISOString().slice(0, 10) : 'null'],
    ['date_measured', 'null'],
    ['status', mapDbStatusToObsidian(rec.status)],
    ['risk_tier', rec.riskTier],
    ['effort', rec.effortTier ? rec.effortTier.toUpperCase() : 'M'],
    ['impact_dollars_monthly', rec.impactDollarsMonthly ?? 'null'],
    ['segment', rec.segment ?? 'all'],
    ['source', rec.source === 'auto-snapshot' ? 'snapshot-heuristic' : rec.source],
    ['related_briefing', period],
    ['db_id', rec.id],
    ['tags', '[recommendation]'],
  ];

  const fmBlock = fm.map(([k, v]) => `${k}: ${v}`).join('\n');

  const body = (rec.body ?? '').trim() || '_(no body provided)_';
  const notes = (rec.notes ?? '').trim();

  // Build Updates log: synthesize creation entry, plus any new event.
  const updates: string[] = [];
  updates.push(`- ${rec.generatedAt.toISOString().slice(0, 10)} — Created with status \`${mapDbStatusToObsidian(rec.status)}\` from source \`${rec.source}\`.`);
  if (newEvent) {
    const noteSuffix = newEvent.notes ? ` Notes: ${newEvent.notes}` : '';
    const actor = newEvent.actor ?? 'operator';
    const transition = newEvent.fromStatus
      ? `${newEvent.fromStatus} → ${newEvent.toStatus}`
      : `set to ${newEvent.toStatus}`;
    updates.push(`- ${newEvent.date} — Status ${transition} (${actor}).${noteSuffix}`);
  }

  const measurementSection = (rec.resultMetricBefore || rec.resultMetricAfter)
    ? `\n## Measurement\n\n${renderMeasurementBlock(rec)}\n`
    : '';

  return `---
${fmBlock}
---

# ${rec.title}

## What

${body}

${notes ? `## Notes\n\n${notes}\n\n` : ''}${measurementSection}## Updates

${updates.join('\n')}

---
_Mirror file. Edited automatically by the triage queue when status changes. Source of truth is the database (id: \`${rec.id}\`). Slug: \`${slug}\`._
`;
}

function renderMeasurementBlock(rec: RecommendationItem): string {
  const before = rec.resultMetricBefore ? `\n\`\`\`json\n${JSON.stringify(rec.resultMetricBefore, null, 2)}\n\`\`\`` : '_(not captured)_';
  const after = rec.resultMetricAfter ? `\n\`\`\`json\n${JSON.stringify(rec.resultMetricAfter, null, 2)}\n\`\`\`` : '_(not yet captured — typically 14 days after shipping)_';
  return `### Before (snapshot at time of shipping)\n${before}\n\n### After\n${after}`;
}

function mapDbStatusToObsidian(s: string): string {
  // DB statuses: open | approved | shipped | rejected | invalidated
  // Obsidian conventional statuses: proposed | accepted | executed | measured | dismissed | superseded
  // Map db → obsidian to match the README schema.
  switch (s) {
    case 'open':
      return 'proposed';
    case 'approved':
      return 'accepted';
    case 'shipped':
      return 'executed';
    case 'rejected':
      return 'dismissed';
    case 'invalidated':
      return 'superseded';
    default:
      return s;
  }
}

export function slugifyTitle(t: string): string {
  return t
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function isoWeekFromDate(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

/**
 * Commit the recommendation mirror to GitHub. Path: docs/marketing/recommendations/<period>-<slug>.md
 * Returns soft-fail result; never throws.
 */
export async function mirrorRecommendation(
  rec: RecommendationItem,
  event?: StatusChangeEvent
): Promise<MirrorResult> {
  try {
    const slug = slugifyTitle(rec.title);
    const period = isoWeekFromDate(rec.generatedAt);
    const path = `docs/marketing/recommendations/${period}-${slug}.md`;
    const message = event
      ? `chore(marketing): rec "${rec.title.slice(0, 50)}" → ${event.toStatus}`
      : `chore(marketing): mirror rec "${rec.title.slice(0, 50)}"`;
    const content = renderRecommendationMarkdown(rec, event);
    const result = await putFileToRepo({ path, content, message });
    return {
      mirrored: result.committed,
      path,
      url: result.htmlUrl,
      error: result.error,
    };
  } catch (err) {
    return { mirrored: false, error: err instanceof Error ? err.message : String(err) };
  }
}
