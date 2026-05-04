/**
 * Marketing Director — weekly briefing email template.
 *
 * Editorial-dossier aesthetic (cream paper, hairline rules, gold accents). Inline SVG charts
 * render in Apple Mail / Gmail web / Outlook 2019+. All CSS inline; no <style> blocks.
 *
 * Render pipeline:
 *   buildBriefingPayloadFromSnapshot(snapshot) → BriefingEmailData → renderBriefingEmail(data) → HTML string
 *
 * The deterministic markdown that gets committed to docs/marketing/weekly/ is unchanged;
 * this module owns ONLY the HTML email rendering.
 */

export type RiskTier = 'autonomous' | 'recommend' | 'hard_stop';
export type EffortTier = 'S' | 'M' | 'L';
export type Tone = 'neutral' | 'good' | 'caution' | 'urgent';

export interface BriefingEmailData {
  weekLabel: string;            // "2026-W18"
  issueNumber: number;          // 18
  year: number;                 // 2026
  generatedDate: string;        // "Friday, May 1"

  topAction: {
    headline: string;
    body: string;
    impactPill: string;
  } | null;

  stats: Array<{
    label: string;
    value: string;
    tone?: Tone;
    spark?: number[];           // ~8 weekly values; renderer scales
  }>;

  analystNote: string | null;

  actions: Array<{
    rank: string;               // "01", "02"
    title: string;
    whyNow: string;
    effort: EffortTier;
    risk: RiskTier;
    impact: string;
  }>;

  charts: {
    revenueTrend: {
      labels: string[];
      values: number[];
      latestDeltaPct: number;
    } | null;
    channelMix: Array<{
      label: string;
      value: number;
      deltaPct: number | null;
      tone: Tone;
    }> | null;
    affiliateRoi: Array<{ partner: string; roiPct: number }> | null;
    marginByProduct: Array<{ product: string; marginPct: number }> | null;
    marginCoverageTrend: {
      labels: string[];
      values: number[];
      goalPct: number;
    } | null;
  };

  whatsLacking: string[];

  links: {
    archive: string;
    queue: string;
  };

  generatedAtIso: string;
  marginCoveragePct: number;    // for the footer caveat
}

const COLORS = {
  paper: '#FBFAF5',
  ink: '#0a0a0a',
  inkBody: '#1a1a1a',
  inkMute: '#3a3a3a',
  hairline: '#e7e3d6',
  cellHairline: '#f0ebd8',
  ivoryAlt: '#FBF6E0',
  goldAccent: '#7a6a1f',
  gold: '#D4AF37',
  yellow: '#F2D34F',
  blue: '#0B74B8',
  good: '#15803d',
  caution: '#d97706',
  urgent: '#dc2626',
  mute: '#8a8576',
  muteText: '#6b6b6b',
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toneColor(t: Tone | undefined): string {
  if (t === 'good') return COLORS.good;
  if (t === 'caution') return COLORS.caution;
  if (t === 'urgent') return COLORS.urgent;
  return COLORS.ink;
}

function fmtMoney(n: number): string {
  return n >= 1000
    ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`
    : `$${n.toLocaleString()}`;
}

function fmtMoneyExact(n: number): string {
  return `$${n.toLocaleString()}`;
}

function fmtSignedPct(n: number): string {
  if (n === 0) return '— flat';
  const arrow = n > 0 ? '↑' : '↓';
  return `${arrow} ${Math.abs(n).toFixed(0)}%`;
}

/* -------------------- SVG chart renderers -------------------- */

function renderSparkline(values: number[], color: string): string {
  if (!values || values.length === 0) return '';
  const W = 120;
  const H = 28;
  const PAD = 2;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const xs = values.map((_, i) => PAD + (i * (W - 2 * PAD)) / (values.length - 1 || 1));
  const ys = values.map((v) => H - PAD - 4 - ((v - min) / range) * (H - 2 * PAD - 8));
  const points = xs.map((x, i) => `${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  const lastX = xs[xs.length - 1];
  const lastY = ys[ys.length - 1];
  return `
    <svg width="120" height="28" viewBox="0 0 120 28" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto;">
      <polyline fill="none" stroke="${color}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" points="${points}"/>
      <circle cx="${lastX.toFixed(1)}" cy="${lastY.toFixed(1)}" r="2.4" fill="${COLORS.gold}"/>
    </svg>
  `;
}

function renderRevenueTrend(c: NonNullable<BriefingEmailData['charts']['revenueTrend']>): string {
  const W = 580;
  const H = 220;
  const X0 = 80;
  const X1 = 570;
  const Y_TOP = 20;
  const Y_BOT = 180;
  const max = Math.max(...c.values, 1);
  const min = 0;
  const xStep = c.values.length > 1 ? (X1 - X0) / (c.values.length - 1) : 0;
  const yFor = (v: number) => Y_BOT - ((v - min) / (max - min)) * (Y_BOT - Y_TOP);
  const pts = c.values.map((v, i) => `${(X0 + i * xStep).toFixed(1)},${yFor(v).toFixed(1)}`);
  const linePts = pts.join(' ');
  const areaPath = `M ${pts[0]} L ${pts.slice(1).join(' L ')} L ${X1.toFixed(1)},${Y_BOT} L ${X0.toFixed(1)},${Y_BOT} Z`;

  const lastVal = c.values[c.values.length - 1];
  const lastX = X0 + (c.values.length - 1) * xStep;
  const lastY = yFor(lastVal);
  const lastTone = c.latestDeltaPct < 0 ? COLORS.urgent : c.latestDeltaPct > 0 ? COLORS.good : COLORS.muteText;

  // y-axis grid (5 lines)
  const gridYs = [0, 0.25, 0.5, 0.75, 1].map((p) => Y_TOP + p * (Y_BOT - Y_TOP));
  const yLabels = [1, 0.75, 0.5, 0.25, 0].map((p) => fmtMoney(min + p * (max - min)));
  const grid = gridYs
    .map((y, i) => {
      const stroke = i === gridYs.length - 1 ? COLORS.ink : COLORS.cellHairline;
      return `<line x1="46" y1="${y}" x2="565" y2="${y}" stroke="${stroke}" stroke-width="1"/>
        <text x="40" y="${y + 4}" font-family="Inter,sans-serif" font-size="9" fill="${COLORS.mute}" text-anchor="end" letter-spacing="1">${yLabels[i]}</text>`;
    })
    .join('');

  const xLabels = c.labels
    .map((label, i) => {
      const x = X0 + i * xStep;
      const isLast = i === c.labels.length - 1;
      return `<text x="${x.toFixed(1)}" y="200" font-family="Inter,sans-serif" font-size="9" fill="${
        isLast ? COLORS.ink : COLORS.mute
      }" text-anchor="middle" letter-spacing="1" ${isLast ? 'font-weight="700"' : ''}>${escapeHtml(label)}</text>`;
    })
    .join('');

  return `
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:auto;max-width:${W}px;">
      ${grid}
      <path d="${areaPath}" fill="${COLORS.gold}" fill-opacity="0.14"/>
      <polyline fill="none" stroke="${COLORS.ink}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${linePts}"/>
      <circle cx="${lastX.toFixed(1)}" cy="${lastY.toFixed(1)}" r="4.5" fill="${lastTone}"/>
      <line x1="${lastX.toFixed(1)}" y1="${lastY.toFixed(1)}" x2="${lastX.toFixed(1)}" y2="${Y_TOP - 6}" stroke="${lastTone}" stroke-width="1" stroke-dasharray="2,3" opacity="0.5"/>
      <text x="${lastX.toFixed(1)}" y="14" font-family="Inter,sans-serif" font-size="10" fill="${lastTone}" text-anchor="end" font-weight="700" letter-spacing="0.5">${fmtMoneyExact(lastVal)} · ${fmtSignedPct(c.latestDeltaPct)}</text>
      ${xLabels}
    </svg>
  `;
}

function renderChannelMix(c: NonNullable<BriefingEmailData['charts']['channelMix']>): string {
  const W = 580;
  const ROW_H = 56;
  const BAR_X = 120;
  const BAR_W_MAX = 406;
  const max = Math.max(...c.map((r) => r.value), 1);
  const H = c.length * ROW_H + 16;

  const rows = c
    .map((r, i) => {
      const y = i * ROW_H + 10;
      const w = (r.value / max) * BAR_W_MAX;
      const fill = i === 0 ? COLORS.ink : i === 1 ? COLORS.gold : '#9a9685';
      const deltaColor =
        r.deltaPct == null ? COLORS.muteText : r.deltaPct < 0 ? COLORS.urgent : r.deltaPct > 0 ? COLORS.good : COLORS.muteText;
      const deltaLabel = r.deltaPct == null ? '— flat' : `${fmtSignedPct(r.deltaPct)} WoW`;
      return `
        <text x="0" y="${y + 12}" font-family="Inter,sans-serif" font-size="11" fill="${COLORS.ink}" font-weight="600">${escapeHtml(r.label)}</text>
        <rect x="${BAR_X}" y="${y}" width="${w.toFixed(1)}" height="22" fill="${fill}"/>
        <text x="${(BAR_X + w + 8).toFixed(1)}" y="${y + 16}" font-family="SFMono-Regular,Menlo,monospace" font-size="11" fill="${COLORS.ink}">${fmtMoneyExact(r.value)}</text>
        <text x="${BAR_X}" y="${y + 36}" font-family="Inter,sans-serif" font-size="9" fill="${deltaColor}" letter-spacing="0.5" font-weight="600">${escapeHtml(deltaLabel)}</text>
      `;
    })
    .join('');

  return `
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:auto;max-width:${W}px;">
      ${rows}
    </svg>
  `;
}

function renderAffiliateRoi(c: NonNullable<BriefingEmailData['charts']['affiliateRoi']>): string {
  const W = 580;
  const ROW_H = 38;
  const X0 = 140;
  const X_END = 540;
  const SCALE_MAX = Math.max(300, ...c.map((r) => r.roiPct + 20));
  const xFor = (pct: number) => X0 + (Math.max(0, pct) / SCALE_MAX) * (X_END - X0);
  const xBreak = xFor(100);
  const H = c.length * ROW_H + 50;
  const baselineY = c.length * ROW_H + 18;

  const breakLine = `
    <line x1="${xBreak.toFixed(1)}" y1="6" x2="${xBreak.toFixed(1)}" y2="${baselineY - 14}" stroke="${COLORS.ink}" stroke-width="1" stroke-dasharray="3,3" opacity="0.45"/>
    <text x="${xBreak.toFixed(1)}" y="${baselineY + 16}" font-family="Inter,sans-serif" font-size="9" fill="${COLORS.ink}" text-anchor="middle" letter-spacing="1" font-weight="600">BREAK-EVEN · 100%</text>
  `;

  const rows = c
    .map((r, i) => {
      const y = i * ROW_H + 10;
      const w = xFor(r.roiPct) - X0;
      const fill = r.roiPct >= 150 ? COLORS.good : r.roiPct >= 100 ? COLORS.caution : COLORS.urgent;
      return `
        <text x="0" y="${y + 12}" font-family="Inter,sans-serif" font-size="11" fill="${COLORS.ink}" font-weight="600">${escapeHtml(r.partner)}</text>
        <rect x="${X0}" y="${y}" width="${Math.max(0, w).toFixed(1)}" height="20" fill="${fill}"/>
        <text x="${(X0 + w + 6).toFixed(1)}" y="${y + 15}" font-family="SFMono-Regular,Menlo,monospace" font-size="11" fill="${COLORS.ink}" font-weight="700">${r.roiPct}%</text>
      `;
    })
    .join('');

  return `
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:auto;max-width:${W}px;">
      ${breakLine}
      ${rows}
      <line x1="${X0}" y1="${baselineY - 4}" x2="${X_END}" y2="${baselineY - 4}" stroke="${COLORS.ink}" stroke-width="1"/>
      <text x="${X0}" y="${baselineY + 16}" font-family="Inter,sans-serif" font-size="9" fill="${COLORS.mute}" text-anchor="middle" letter-spacing="1">0%</text>
      <text x="${(X0 + (X_END - X0) * (200 / SCALE_MAX)).toFixed(1)}" y="${baselineY + 16}" font-family="Inter,sans-serif" font-size="9" fill="${COLORS.mute}" text-anchor="middle" letter-spacing="1">200%</text>
      <text x="${X_END}" y="${baselineY + 16}" font-family="Inter,sans-serif" font-size="9" fill="${COLORS.mute}" text-anchor="middle" letter-spacing="1">${SCALE_MAX}%</text>
    </svg>
  `;
}

function renderMarginByProduct(c: NonNullable<BriefingEmailData['charts']['marginByProduct']>): string {
  const W = 580;
  const ROW_H = 30;
  const X0 = 180;
  const X_END = 540;
  const SCALE = 50;
  const xFor = (pct: number) => X0 + (Math.max(0, pct) / SCALE) * (X_END - X0);
  const xFloor = xFor(27);
  const H = c.length * ROW_H + 50;
  const baselineY = c.length * ROW_H + 14;

  const rows = c
    .map((r, i) => {
      const y = i * ROW_H + 10;
      const w = xFor(r.marginPct) - X0;
      const fill = r.marginPct >= 27 ? COLORS.good : r.marginPct >= 20 ? COLORS.caution : COLORS.urgent;
      return `
        <text x="0" y="${y + 10}" font-family="Inter,sans-serif" font-size="11" fill="${COLORS.ink}" font-weight="600">${escapeHtml(r.product)}</text>
        <rect x="${X0}" y="${y}" width="${Math.max(0, w).toFixed(1)}" height="18" fill="${fill}"/>
        <text x="${(X0 + w + 6).toFixed(1)}" y="${y + 13}" font-family="SFMono-Regular,Menlo,monospace" font-size="11" fill="${COLORS.ink}" font-weight="700">${r.marginPct}%</text>
      `;
    })
    .join('');

  return `
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:auto;max-width:${W}px;">
      <line x1="${xFloor.toFixed(1)}" y1="6" x2="${xFloor.toFixed(1)}" y2="${baselineY}" stroke="${COLORS.ink}" stroke-width="1" stroke-dasharray="3,3" opacity="0.45"/>
      <text x="${xFloor.toFixed(1)}" y="${baselineY + 18}" font-family="Inter,sans-serif" font-size="9" fill="${COLORS.ink}" text-anchor="middle" letter-spacing="1" font-weight="600">FLOOR · 27%</text>
      ${rows}
      <line x1="${X0}" y1="${baselineY - 6}" x2="${X_END}" y2="${baselineY - 6}" stroke="${COLORS.ink}" stroke-width="1"/>
      <text x="${X0}" y="${baselineY + 8}" font-family="Inter,sans-serif" font-size="9" fill="${COLORS.mute}" text-anchor="middle" letter-spacing="1">0%</text>
      <text x="${X_END}" y="${baselineY + 8}" font-family="Inter,sans-serif" font-size="9" fill="${COLORS.mute}" text-anchor="middle" letter-spacing="1">${SCALE}%</text>
    </svg>
  `;
}

function renderCoverageTrend(c: NonNullable<BriefingEmailData['charts']['marginCoverageTrend']>): string {
  const W = 580;
  const H = 200;
  const X0 = 80;
  const X1 = 570;
  const Y_TOP = 20;
  const Y_BOT = 160;
  const xStep = c.values.length > 1 ? (X1 - X0) / (c.values.length - 1) : 0;
  const yFor = (v: number) => Y_BOT - (v / 100) * (Y_BOT - Y_TOP);
  const pts = c.values.map((v, i) => `${(X0 + i * xStep).toFixed(1)},${yFor(v).toFixed(1)}`).join(' ');
  const lastVal = c.values[c.values.length - 1];
  const lastX = X0 + (c.values.length - 1) * xStep;
  const lastY = yFor(lastVal);
  const goalY = yFor(c.goalPct);

  return `
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:auto;max-width:${W}px;">
      <line x1="46" y1="20" x2="565" y2="20" stroke="${COLORS.cellHairline}" stroke-width="1"/>
      <line x1="46" y1="60" x2="565" y2="60" stroke="${COLORS.cellHairline}" stroke-width="1"/>
      <line x1="46" y1="100" x2="565" y2="100" stroke="${COLORS.cellHairline}" stroke-width="1"/>
      <line x1="46" y1="140" x2="565" y2="140" stroke="${COLORS.cellHairline}" stroke-width="1"/>
      <line x1="46" y1="160" x2="565" y2="160" stroke="${COLORS.ink}" stroke-width="1"/>
      <text x="40" y="24" font-family="Inter,sans-serif" font-size="9" fill="${COLORS.mute}" text-anchor="end" letter-spacing="1">100%</text>
      <text x="40" y="64" font-family="Inter,sans-serif" font-size="9" fill="${COLORS.mute}" text-anchor="end" letter-spacing="1">75%</text>
      <text x="40" y="104" font-family="Inter,sans-serif" font-size="9" fill="${COLORS.mute}" text-anchor="end" letter-spacing="1">50%</text>
      <text x="40" y="144" font-family="Inter,sans-serif" font-size="9" fill="${COLORS.mute}" text-anchor="end" letter-spacing="1">25%</text>
      <text x="40" y="164" font-family="Inter,sans-serif" font-size="9" fill="${COLORS.mute}" text-anchor="end" letter-spacing="1">0%</text>
      <line x1="46" y1="${goalY.toFixed(1)}" x2="565" y2="${goalY.toFixed(1)}" stroke="${COLORS.good}" stroke-width="1.2" stroke-dasharray="4,3"/>
      <text x="565" y="${(goalY - 6).toFixed(1)}" font-family="Inter,sans-serif" font-size="9" fill="${COLORS.good}" text-anchor="end" letter-spacing="1" font-weight="700">GOAL · ${c.goalPct}%</text>
      <polyline fill="none" stroke="${COLORS.ink}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${pts}"/>
      <circle cx="${lastX.toFixed(1)}" cy="${lastY.toFixed(1)}" r="4.5" fill="${COLORS.gold}"/>
      <text x="${lastX.toFixed(1)}" y="${(lastY - 8).toFixed(1)}" font-family="Inter,sans-serif" font-size="10" fill="${COLORS.ink}" text-anchor="end" font-weight="700" letter-spacing="0.5">${lastVal}% · ↑ this week</text>
    </svg>
  `;
}

/* -------------------- Main render -------------------- */

export function renderBriefingEmail(d: BriefingEmailData): string {
  // ---- masthead
  const masthead = `
    <tr>
      <td style="padding:8px 0 24px;text-align:center;">
        <div style="font-family:'Inter',sans-serif;font-size:10px;letter-spacing:3px;color:${COLORS.muteText};text-transform:uppercase;margin-bottom:18px;">Party On Delivery &nbsp;·&nbsp; Austin, Texas</div>
        <div style="font-family:'Barlow Condensed','Helvetica Neue','Arial Narrow',sans-serif;font-size:38px;font-weight:700;letter-spacing:4px;color:${COLORS.ink};text-transform:uppercase;line-height:1;">Marketing<br>Weekly Briefing</div>
        <div style="margin-top:18px;font-family:'Inter',sans-serif;font-size:11px;letter-spacing:2px;color:${COLORS.muteText};text-transform:uppercase;">Issue ${d.issueNumber} &nbsp;·&nbsp; ${d.year} &nbsp;·&nbsp; ${escapeHtml(d.generatedDate)}</div>
        <div style="height:2px;background:${COLORS.gold};width:48px;margin:26px auto 0;line-height:2px;font-size:0;">&nbsp;</div>
      </td>
    </tr>
  `;

  // ---- top action
  const topAction = d.topAction
    ? `
    <tr>
      <td style="padding:8px 0 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${COLORS.ink}" style="background:${COLORS.ink};border-radius:2px;">
          <tr>
            <td width="4" bgcolor="${COLORS.gold}" style="background:${COLORS.gold};width:4px;line-height:1px;font-size:0;">&nbsp;</td>
            <td style="padding:34px 36px 36px;">
              <div style="font-family:'Inter',sans-serif;font-size:10px;letter-spacing:3px;color:${COLORS.gold};text-transform:uppercase;font-weight:600;margin-bottom:14px;">The Action — This Week</div>
              <div style="font-family:'Barlow Condensed','Helvetica Neue','Arial Narrow',sans-serif;font-size:30px;font-weight:600;line-height:1.15;color:#ffffff;letter-spacing:0.5px;">${escapeHtml(d.topAction.headline)}</div>
              <div style="margin-top:18px;font-family:'Inter',sans-serif;font-size:15px;line-height:1.6;color:#d8d8d8;">${escapeHtml(d.topAction.body)}</div>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:22px;">
                <tr>
                  <td bgcolor="${COLORS.yellow}" style="background:${COLORS.yellow};padding:8px 14px;border-radius:2px;">
                    <span style="font-family:'Inter',sans-serif;font-size:12px;font-weight:700;letter-spacing:1.5px;color:${COLORS.ink};text-transform:uppercase;">${escapeHtml(d.topAction.impactPill)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `
    : '';

  // ---- stat strip
  const statCells = d.stats
    .map((s, i) => {
      const isLast = i === d.stats.length - 1;
      const valColor = toneColor(s.tone);
      const sparkColor = s.tone === 'urgent' ? COLORS.urgent : s.tone === 'caution' ? COLORS.caution : COLORS.ink;
      const spark = s.spark ? renderSparkline(s.spark, sparkColor) : '';
      return `
        <td width="${100 / d.stats.length}%" valign="top" style="padding:22px 10px 18px;text-align:center;${isLast ? '' : `border-right:1px solid ${COLORS.hairline};`}">
          <div style="font-family:'Inter',sans-serif;font-size:9px;letter-spacing:2px;color:${COLORS.mute};text-transform:uppercase;margin-bottom:8px;">${escapeHtml(s.label)}</div>
          <div style="font-family:'Barlow Condensed','Helvetica Neue',sans-serif;font-size:34px;font-weight:600;color:${valColor};line-height:1;">${escapeHtml(s.value)}</div>
          ${spark ? `<div style="margin-top:10px;line-height:0;">${spark}</div>` : ''}
        </td>
      `;
    })
    .join('');
  const statStrip = `
    <tr>
      <td style="padding:36px 0 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid ${COLORS.hairline};border-bottom:1px solid ${COLORS.hairline};">
          <tr>${statCells}</tr>
        </table>
      </td>
    </tr>
  `;

  // ---- analyst note
  const analystNote = d.analystNote
    ? `
    <tr>
      <td style="padding:36px 0 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${COLORS.ivoryAlt}" style="background:${COLORS.ivoryAlt};">
          <tr>
            <td width="4" bgcolor="${COLORS.yellow}" style="background:${COLORS.yellow};width:4px;line-height:1px;font-size:0;">&nbsp;</td>
            <td style="padding:24px 28px;">
              <div style="font-family:'Inter',sans-serif;font-size:10px;letter-spacing:3px;color:${COLORS.goldAccent};text-transform:uppercase;font-weight:600;margin-bottom:10px;">Analyst's Note</div>
              <div style="font-family:'Inter',sans-serif;font-size:14px;line-height:1.65;color:${COLORS.inkBody};">${d.analystNote}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `
    : '';

  // ---- prioritized actions
  const actionsHeader = d.actions.length
    ? `
    <tr>
      <td style="padding:48px 0 0;">
        <div style="font-family:'Inter',sans-serif;font-size:10px;letter-spacing:3px;color:${COLORS.muteText};text-transform:uppercase;font-weight:600;text-align:center;margin-bottom:8px;">Prioritized Actions</div>
        <div style="font-family:'Barlow Condensed','Helvetica Neue',sans-serif;font-size:24px;font-weight:600;color:${COLORS.ink};text-align:center;letter-spacing:1px;text-transform:uppercase;">What to ship this week</div>
        <div style="height:1px;background:${COLORS.hairline};margin:24px auto 0;line-height:1px;font-size:0;">&nbsp;</div>
      </td>
    </tr>
  `
    : '';

  const riskBadgeBg: Record<RiskTier, string> = {
    autonomous: '#dde8f5',
    recommend: '#f0ebd8',
    hard_stop: '#fbe5e5',
  };
  const riskLabel: Record<RiskTier, string> = {
    autonomous: 'Autonomous',
    recommend: 'Recommend',
    hard_stop: 'Hard stop',
  };

  const actionRows = d.actions
    .map(
      (a) => `
    <tr><td>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td valign="top" width="80" style="padding:28px 0 28px 4px;">
            <div style="font-family:'Barlow Condensed','Helvetica Neue',sans-serif;font-size:64px;font-weight:300;color:${COLORS.gold};line-height:1;letter-spacing:-2px;">${escapeHtml(a.rank)}</div>
          </td>
          <td valign="top" style="padding:32px 8px 28px 16px;border-bottom:1px solid ${COLORS.hairline};">
            <div style="font-family:'Barlow Condensed','Helvetica Neue',sans-serif;font-size:22px;font-weight:600;color:${COLORS.ink};line-height:1.25;letter-spacing:0.5px;">${escapeHtml(a.title)}</div>
            <div style="margin-top:10px;font-family:'Inter',sans-serif;font-size:14px;line-height:1.65;color:${COLORS.inkMute};">${escapeHtml(a.whyNow)}</div>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;">
              <tr>
                <td style="padding-right:6px;"><span style="display:inline-block;font-family:'Inter',sans-serif;font-size:10px;letter-spacing:1.5px;color:${COLORS.ink};text-transform:uppercase;font-weight:600;background:#f0ebd8;padding:5px 9px;border-radius:2px;">Effort&nbsp;·&nbsp;${a.effort}</span></td>
                <td style="padding-right:6px;"><span style="display:inline-block;font-family:'Inter',sans-serif;font-size:10px;letter-spacing:1.5px;color:${COLORS.ink};text-transform:uppercase;font-weight:600;background:${riskBadgeBg[a.risk]};padding:5px 9px;border-radius:2px;">Risk&nbsp;·&nbsp;${riskLabel[a.risk]}</span></td>
                <td><span style="display:inline-block;font-family:'Inter',sans-serif;font-size:10px;letter-spacing:1.5px;color:${COLORS.good};text-transform:uppercase;font-weight:700;background:#e7f4ec;padding:5px 9px;border-radius:2px;">${escapeHtml(a.impact)}</span></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td></tr>
  `
    )
    .join('');

  // ---- charts
  const chartsHeader = `
    <tr>
      <td style="padding:56px 0 0;">
        <div style="font-family:'Inter',sans-serif;font-size:10px;letter-spacing:3px;color:${COLORS.muteText};text-transform:uppercase;font-weight:600;text-align:center;margin-bottom:8px;">The Data</div>
        <div style="font-family:'Barlow Condensed','Helvetica Neue',sans-serif;font-size:24px;font-weight:600;color:${COLORS.ink};text-align:center;letter-spacing:1px;text-transform:uppercase;">Charts &amp; movement</div>
        <div style="height:1px;background:${COLORS.hairline};margin:24px auto 0;line-height:1px;font-size:0;">&nbsp;</div>
      </td>
    </tr>
  `;

  const chartCard = (n: string, title: string, sub: string, body: string): string => `
    <tr>
      <td style="padding:36px 0 0;">
        <div style="font-family:'Inter',sans-serif;font-size:10px;letter-spacing:2.5px;color:${COLORS.gold};text-transform:uppercase;font-weight:700;margin-bottom:6px;">Chart ${n}</div>
        <div style="font-family:'Barlow Condensed','Helvetica Neue',sans-serif;font-size:18px;font-weight:600;color:${COLORS.ink};letter-spacing:0.5px;text-transform:uppercase;">${escapeHtml(title)}</div>
        <div style="font-family:'Inter',sans-serif;font-size:12px;color:${COLORS.muteText};margin-top:4px;margin-bottom:14px;">${escapeHtml(sub)}</div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#ffffff" style="background:#ffffff;border:1px solid ${COLORS.hairline};">
          <tr><td style="padding:18px 18px 10px;">${body}</td></tr>
        </table>
      </td>
    </tr>
  `;

  const charts: string[] = [];
  let chartIdx = 1;
  const pad = (n: number) => n.toString().padStart(2, '0');

  if (d.charts.revenueTrend) {
    charts.push(
      chartCard(
        pad(chartIdx++),
        'Total revenue · last 8 weeks',
        `Weekly paid revenue. Latest: ${fmtSignedPct(d.charts.revenueTrend.latestDeltaPct)} WoW.`,
        renderRevenueTrend(d.charts.revenueTrend)
      )
    );
  }
  if (d.charts.channelMix) {
    charts.push(
      chartCard(
        pad(chartIdx++),
        'Channel mix · this week',
        'Where this week’s revenue came from.',
        renderChannelMix(d.charts.channelMix)
      )
    );
  }
  if (d.charts.affiliateRoi) {
    charts.push(
      chartCard(
        pad(chartIdx++),
        'Affiliate ROI · 30-day',
        'Bars left of break-even (100%) are losing money.',
        renderAffiliateRoi(d.charts.affiliateRoi)
      )
    );
  }
  if (d.charts.marginByProduct) {
    charts.push(
      chartCard(
        pad(chartIdx++),
        'Margin · top revenue products',
        'Vertical line = 27% floor. Bars below are bundle candidates.',
        renderMarginByProduct(d.charts.marginByProduct)
      )
    );
  }
  if (d.charts.marginCoverageTrend) {
    charts.push(
      chartCard(
        pad(chartIdx++),
        'Margin coverage · climb to goal',
        '% of revenue with known cost. Margin recommendations gate at the goal line.',
        renderCoverageTrend(d.charts.marginCoverageTrend)
      )
    );
  }

  const chartsBlock = charts.length ? chartsHeader + charts.join('') : '';

  // ---- what's lacking
  const whatsLacking = d.whatsLacking.length
    ? `
    <tr>
      <td style="padding:48px 0 0;">
        <div style="font-family:'Inter',sans-serif;font-size:10px;letter-spacing:3px;color:${COLORS.muteText};text-transform:uppercase;font-weight:600;margin-bottom:10px;">What this brief lacks</div>
        <ul style="margin:0;padding:0 0 0 18px;font-family:'Inter',sans-serif;font-size:14px;line-height:1.7;color:${COLORS.inkMute};">
          ${d.whatsLacking.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}
        </ul>
      </td>
    </tr>
  `
    : '';

  // ---- buttons
  const buttons = `
    <tr>
      <td style="padding:48px 0 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td align="center" style="padding:0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:0 6px;"><a href="${escapeHtml(d.links.archive)}" style="display:inline-block;padding:13px 22px;background:${COLORS.blue};color:#ffffff;text-decoration:none;font-family:'Inter',sans-serif;font-size:12px;letter-spacing:1.5px;font-weight:600;text-transform:uppercase;border-radius:2px;">Open Archive</a></td>
                  <td style="padding:0 6px;"><a href="${escapeHtml(d.links.queue)}" style="display:inline-block;padding:13px 22px;background:#ffffff;color:${COLORS.ink};text-decoration:none;font-family:'Inter',sans-serif;font-size:12px;letter-spacing:1.5px;font-weight:600;text-transform:uppercase;border:1px solid ${COLORS.ink};border-radius:2px;">Triage Queue</a></td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  // ---- footer
  const footer = `
    <tr>
      <td style="padding:56px 0 24px;">
        <div style="height:1px;background:${COLORS.ink};width:48px;margin:0 auto 22px;line-height:1px;font-size:0;">&nbsp;</div>
        <div style="text-align:center;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:14px;color:${COLORS.inkMute};line-height:1.5;">Filed by the Marketing Director</div>
        <div style="text-align:center;margin-top:6px;font-family:'Inter',sans-serif;font-size:11px;letter-spacing:2px;color:${COLORS.mute};text-transform:uppercase;">Party On Delivery · Austin</div>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 0 0;border-top:1px solid ${COLORS.hairline};">
        <div style="font-family:'Inter',sans-serif;font-size:11px;line-height:1.6;color:${COLORS.mute};text-align:center;">
          Generated ${escapeHtml(d.generatedAtIso.slice(0, 10))} · Auto-archived to <span style="font-family:'SFMono-Regular','Menlo',monospace;color:${COLORS.muteText};">docs/marketing/weekly/${escapeHtml(d.weekLabel)}-director.md</span><br>
          ${
            d.marginCoveragePct < 70
              ? `Treat margin recommendations with caution while coverage &lt; 70% (currently ${d.marginCoveragePct}%).`
              : 'Margin coverage above 70% gate — recommendations fully reliable.'
          }
        </div>
      </td>
    </tr>
  `;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>Marketing Weekly Briefing — ${escapeHtml(d.weekLabel)}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.paper};font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${COLORS.ink};-webkit-font-smoothing:antialiased;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${COLORS.paper}" style="background:${COLORS.paper};">
  <tr>
    <td align="center" style="padding:40px 16px 56px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="640" style="width:100%;max-width:640px;">
        ${masthead}
        ${topAction}
        ${statStrip}
        ${analystNote}
        ${actionsHeader}
        ${actionRows}
        ${chartsBlock}
        ${whatsLacking}
        ${buttons}
        ${footer}
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}
