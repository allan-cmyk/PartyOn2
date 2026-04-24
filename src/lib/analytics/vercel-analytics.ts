/**
 * Vercel Web Analytics + Web Vitals wrapper.
 *
 * Requires env vars (not yet set — populate before first cron run):
 *   - VERCEL_ANALYTICS_TOKEN: team-scoped token with Web Analytics read access
 *   - VERCEL_TEAM_ID
 *   - VERCEL_PROJECT_ID (for partyondelivery.com)
 *
 * Returns null when env is missing so the cron can still run and snapshot
 * other sources. Marketing Director treats null as "data unavailable."
 */

const API_BASE = 'https://api.vercel.com';

export interface VercelWebVitals {
  lcp: number | null; // ms, 75th percentile
  fcp: number | null;
  cls: number | null;
  inp: number | null; // ms
  fid: number | null;
  ttfb: number | null;
  samples: number;
}

export interface VercelTopPage {
  path: string;
  views: number;
  visitors: number;
}

function env(): { token: string; teamId: string; projectId: string } | null {
  const token = process.env.VERCEL_ANALYTICS_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!token || !teamId || !projectId) return null;
  return { token, teamId, projectId };
}

async function call<T>(path: string, params: Record<string, string>): Promise<T | null> {
  const cfg = env();
  if (!cfg) {
    console.warn('[vercel-analytics] missing env (VERCEL_ANALYTICS_TOKEN/VERCEL_TEAM_ID/VERCEL_PROJECT_ID) — skipping');
    return null;
  }
  const qs = new URLSearchParams({ teamId: cfg.teamId, projectId: cfg.projectId, ...params });
  try {
    const res = await fetch(`${API_BASE}${path}?${qs}`, {
      headers: { Authorization: `Bearer ${cfg.token}` },
    });
    if (!res.ok) {
      console.error(`[vercel-analytics] ${res.status} on ${path}:`, await res.text());
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error('[vercel-analytics] fetch failed:', err);
    return null;
  }
}

/**
 * TODO: replace with real Vercel Web Analytics API endpoint once credentials are set.
 * The public Vercel Web Analytics API surface is documented at
 * https://vercel.com/docs/analytics — endpoint names may change between v1/v2.
 * Current shape is a placeholder; adjust the `call<>` generic + result mapping
 * after confirming the actual response schema.
 */
export async function getWebVitals(
  startDate: Date,
  endDate: Date
): Promise<VercelWebVitals | null> {
  const raw = await call<{ lcp?: number; fcp?: number; cls?: number; inp?: number; fid?: number; ttfb?: number; samples?: number }>(
    '/v1/analytics/web-vitals',
    { from: startDate.toISOString(), to: endDate.toISOString() }
  );
  if (!raw) return null;
  return {
    lcp: raw.lcp ?? null,
    fcp: raw.fcp ?? null,
    cls: raw.cls ?? null,
    inp: raw.inp ?? null,
    fid: raw.fid ?? null,
    ttfb: raw.ttfb ?? null,
    samples: raw.samples ?? 0,
  };
}

export async function getVercelTopPages(
  startDate: Date,
  endDate: Date,
  limit = 20
): Promise<VercelTopPage[] | null> {
  const raw = await call<{ pages?: Array<{ path: string; views: number; visitors: number }> }>(
    '/v1/analytics/pages',
    { from: startDate.toISOString(), to: endDate.toISOString(), limit: String(limit) }
  );
  if (!raw) return null;
  return raw.pages ?? [];
}
