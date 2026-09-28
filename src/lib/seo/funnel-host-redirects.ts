/**
 * Redirects for the retired GoHighLevel funnel hosts, plus two dead links
 * that customers were sent on the main domain.
 *
 * 2026-09-14 — 123.partyondelivery.com was a GoHighLevel funnel domain. GHL
 * was cancelled 2026-09-22. The host now points at Vercel and this app serves
 * the redirects itself, so every historic link (flyers, follow-up emails, CRM
 * drip texts, lander CTAs, the Instagram bio) keeps working. Site references
 * deliberately KEEP pointing at 123.partyondelivery.com/<path>: it is the one
 * indirection layer, so a booking page can move without touching any copy.
 *
 * 2026-09-15 — the three call paths are permanent (308) redirects to Allan's
 * Google Calendar appointment schedules on allan@partyondelivery.com:
 * Boat Call 10 min (phone), Party Consultation 15 min (phone), Partnership
 * Call 30 min (Google Meet). Editing a schedule's settings never changes its
 * URL; only deleting and recreating one does, so update BOOKING_PAGES here if
 * a schedule is ever recreated. `funnel-host-redirects.test.ts` pins the
 * exact URLs, so a mistyped schedule ID fails CI.
 *
 * 2026-09-28 — booking-calendar audit additions: /free-quote (Instagram "Get
 * A Free Quote" bio link), trailing-period variants that went out in 99 boat
 * texts and 274 review texts, two tiny 2024–25 GHL funnel pages, the
 * info.partyondelivery.com widget host, and main-domain /review + /cart.
 *
 * Every host-scoped rule must run BEFORE any other redirect (next.config.ts
 * spreads these first) and each host's `/:path*` catch-all must be the last
 * rule for that host.
 */

/** Short-link host that used to be the GHL funnel domain. */
export const FUNNEL_HOST = '123.partyondelivery.com';

/** Old GHL white-label host that served the booking widgets. */
export const INFO_HOST = 'info.partyondelivery.com';

/** Google "write a review" form for the Party On Delivery listing. */
export const GOOGLE_REVIEW_FORM_URL = 'https://g.page/r/CWO9-KA4uBqaEAE/review';

/** Public Google Calendar appointment-schedule pages. */
export const BOOKING_PAGES = {
  /** Boat Call — 10 min, phone. */
  boatCall:
    'https://calendar.google.com/calendar/appointments/schedules/AcZssZ0A5IpzCavw3gYFKYBSqqdRr1DyaiX4ietgCDLgg20EKhpPu7gdrsrJM5P5zlC8Z6-9JQq5g-Fb',
  /** Party Consultation — 15 min, phone. */
  planningCall:
    'https://calendar.google.com/calendar/appointments/schedules/AcZssZ1LJme7vhebZTdmWQ0dvKFd7CUquhr8bmXkgH7KMRDuKeY8PDETRMJx4utUhg6zBIt0SguTVRrW',
  /** Partnership Call — 30 min, Google Meet. */
  partnershipCall:
    'https://calendar.google.com/calendar/appointments/schedules/AcZssZ0pjDaVscvHzyhes4RkjsBbx6fn5EjFmCzJypDCBU_qRv2vgC4uuYuLcRdDzap9zeGhAbldL8iE',
} as const;

/** Shape Next.js accepts from `redirects()` (host-scoped subset). */
export interface HostRedirect {
  source: string;
  has?: Array<{ type: 'host'; value: string }>;
  destination: string;
  permanent: boolean;
}

const HOME = 'https://partyondelivery.com/';

function onHost(host: string, rules: Array<Omit<HostRedirect, 'has'>>): HostRedirect[] {
  return rules.map((rule) => ({ ...rule, has: [{ type: 'host', value: host }] }));
}

/** 123.partyondelivery.com — booking short links, review link, old funnel paths. */
export const FUNNEL_HOST_REDIRECTS: HostRedirect[] = onHost(FUNNEL_HOST, [
  { source: '/reviews', destination: GOOGLE_REVIEW_FORM_URL, permanent: true },
  // A period fused to the link in older texts ("…/reviews." / "…/boat-call.").
  { source: '/reviews.', destination: GOOGLE_REVIEW_FORM_URL, permanent: true },
  { source: '/boat-call', destination: BOOKING_PAGES.boatCall, permanent: true },
  { source: '/boat-call.', destination: BOOKING_PAGES.boatCall, permanent: true },
  { source: '/planning-call', destination: BOOKING_PAGES.planningCall, permanent: true },
  { source: '/partnership-call', destination: BOOKING_PAGES.partnershipCall, permanent: true },
  // Instagram bio "Get A Free Quote". Temporary so the target can change.
  { source: '/free-quote', destination: 'https://partyondelivery.com/plan-event', permanent: false },
  // Old GHL pages: an "info + book a call" page texted in early 2025, and a
  // Dec-2024 holiday cocktail promo.
  { source: '/general-info-page-page', destination: BOOKING_PAGES.planningCall, permanent: false },
  { source: '/holiday-cocktails', destination: 'https://partyondelivery.com/cocktail-kits', permanent: false },
  // Any other old funnel path → homepage. MUST stay last for this host.
  { source: '/:path*', destination: HOME, permanent: false },
]);

/**
 * info.partyondelivery.com — the old GHL booking widgets (still linked from
 * 2025–26 emails/texts and old calendar invites) → the new schedules.
 * Inert until the host's DNS points at Vercel.
 */
export const INFO_HOST_REDIRECTS: HostRedirect[] = onHost(INFO_HOST, [
  { source: '/widget/bookings/pod-partnerships', destination: BOOKING_PAGES.partnershipCall, permanent: true },
  { source: '/widget/booking/Ney4qFhSbziV2uOz9O6S', destination: BOOKING_PAGES.partnershipCall, permanent: true },
  { source: '/widget/bookings/pod-boat-cruise-call', destination: BOOKING_PAGES.boatCall, permanent: true },
  { source: '/widget/booking/yQkEdXRNRmYnA6yD2LFs', destination: BOOKING_PAGES.boatCall, permanent: true },
  // Old /l/ promo links, GHL media and everything else → homepage. MUST stay last.
  { source: '/:path*', destination: HOME, permanent: false },
]);

/**
 * Main-domain dead links that went out to customers:
 * - /review — the CRM review-request text linked it (404) until 2026-09-28.
 * - /cart — the Instagram bio links it; there is no /cart page (the cart is a
 *   drawer), so send shoppers to the storefront. Temporary on purpose.
 */
export const DEAD_LINK_REDIRECTS: HostRedirect[] = [
  { source: '/review', destination: GOOGLE_REVIEW_FORM_URL, permanent: true },
  { source: '/cart', destination: '/products', permanent: false },
];
