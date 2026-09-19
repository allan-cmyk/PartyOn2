/**
 * /partners/<slug> pages that are NOT affiliates: generic category landers and
 * sales pages with no Affiliate row. The middleware must not write a ref_code
 * cookie for them (it would overwrite a real partner's 30-day attribution with
 * a value that resolves to nothing), and the affiliate service must refuse to
 * create an Affiliate whose partnerSlug collides with one (path attribution
 * for that partner would be silently dead).
 *
 * If one of these pages becomes a real partner: create the Affiliate with a
 * DIFFERENT partnerSlug, or remove the entry here first — the write-time guard
 * in affiliate-service.ts points operators at this file.
 *
 * Edge-safe on purpose: no imports. This module is loaded by src/middleware.ts.
 */
export const NON_AFFILIATE_PARTNER_PAGES: ReadonlySet<string> = new Set([
  'pitch',
  'anderson-mill-marina-boat-club',
  'austin-wedding-dj',
  'boat-babes',
  'hotels-resorts',
  'mobile-bartenders',
  'property-management',
  'vacation-rentals',
]);
