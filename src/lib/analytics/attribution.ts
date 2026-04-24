/**
 * First-touch attribution capture.
 *
 * Captures the landing page + UTM params + document referrer on the visitor's
 * first page load and persists them to localStorage. Subsequent visits / cart
 * events don't overwrite — first-touch wins. Checkout reads these values via
 * `getAttribution()` and passes them into Stripe session metadata, where the
 * webhook reads them when creating the Order.
 */

const STORAGE_KEY = 'pod_attribution_v1';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;

export interface AttributionPayload {
  landingPage: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  referrer: string | null;
  capturedAt: string;
}

function isClient(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

/**
 * Run once per browser on initial page load. No-op if attribution already captured.
 */
export function captureFirstTouch(): void {
  if (!isClient()) return;
  try {
    if (localStorage.getItem(STORAGE_KEY)) return;

    const url = new URL(window.location.href);
    const utm: Record<string, string | null> = {};
    for (const key of UTM_KEYS) {
      utm[key] = url.searchParams.get(key);
    }

    const referrer = document.referrer || null;
    const internalReferrer = referrer && referrer.includes(window.location.hostname);

    const payload: AttributionPayload = {
      landingPage: url.pathname + (url.search || ''),
      utmSource: utm.utm_source,
      utmMedium: utm.utm_medium,
      utmCampaign: utm.utm_campaign,
      utmTerm: utm.utm_term,
      utmContent: utm.utm_content,
      referrer: internalReferrer ? null : referrer,
      capturedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage may be unavailable (private mode, quota); silently skip.
  }
}

export function getAttribution(): AttributionPayload | null {
  if (!isClient()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AttributionPayload;
  } catch {
    return null;
  }
}

/**
 * Flatten attribution into Stripe metadata (string-only, filter empties).
 * Stripe metadata has a 500-char-per-value limit and ~50 keys total — we're well under.
 */
export function attributionToMetadata(
  a: AttributionPayload | null
): Record<string, string> {
  if (!a) return {};
  const out: Record<string, string> = {};
  if (a.landingPage) out.landingPage = a.landingPage.slice(0, 500);
  if (a.utmSource) out.utmSource = a.utmSource.slice(0, 500);
  if (a.utmMedium) out.utmMedium = a.utmMedium.slice(0, 500);
  if (a.utmCampaign) out.utmCampaign = a.utmCampaign.slice(0, 500);
  if (a.utmTerm) out.utmTerm = a.utmTerm.slice(0, 500);
  if (a.utmContent) out.utmContent = a.utmContent.slice(0, 500);
  if (a.referrer) out.referrer = a.referrer.slice(0, 500);
  return out;
}
