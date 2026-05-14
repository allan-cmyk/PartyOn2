/**
 * Event-invite app types.
 *
 * Customer-facing "Party Invite" feature — Eventbrite/Posh/Partyfly-style
 * event pages where guests RSVP and then optionally order their own BYOB
 * drinks from Party On Delivery (separate bill, same drop-off).
 *
 * THIS IS MOCKUP-PHASE: types live here so we can stand up the front-end
 * with hard-coded data. Backend persistence comes after Brian signs off on
 * the UX.
 */

export type EventTheme =
  | 'birthday'
  | 'bachelor'
  | 'bachelorette'
  | 'corporate'
  | 'wedding'
  | 'casual';

export type EventStatus = 'draft' | 'live' | 'past';

export type DrinkSelectionMode =
  | 'full-catalog' // invitees can order anything POD sells
  | 'curated' // organizer picked specific products
  | 'package-only'; // invitees pick from N pre-built packages

export type EventInvite = {
  slug: string;
  title: string;
  /** "Brian Hill" — shown as host on the public page. */
  hostName: string;
  /** Optional second line, e.g. "+ The Hill Crew" */
  hostTagline?: string;
  /** ISO date string in event-local timezone. */
  startsAt: string;
  /** ISO date string. Defaults to startsAt + 5h if omitted. */
  endsAt?: string;
  /** Display timezone, e.g. "America/Chicago". */
  timezone: string;
  /** Free-form venue name. */
  venue: string;
  /** Full address (street, city, state, zip). */
  address: string;
  /** City/state for the chip in the hero. */
  cityState: string;
  /** Marketing copy on the hero. */
  tagline: string;
  /** Long-form description shown below the hero. */
  description: string;
  /** Theme drives color palette. */
  theme: EventTheme;
  status: EventStatus;
  /** Hero image path under /public. */
  heroImage: string;
  /** Optional 4–6 gallery images shown in the Vibes strip. */
  gallery?: string[];
  /** Dress code, parking notes, special asks. */
  details: { label: string; value: string }[];
  /** Max RSVPs allowed. null = unlimited. */
  capacity?: number | null;
  /** When the RSVP cutoff hits. */
  rsvpDeadline?: string;
  /** Driver/concierge contact for the day-of. */
  dayOfContactName?: string;
  dayOfContactPhone?: string;
  /** Drink-ordering rules. */
  drinks: {
    enabled: boolean;
    mode: DrinkSelectionMode;
    /** Display blurb. */
    blurb: string;
    /** Per-person budget guidance shown on the BYOB modal. */
    perPersonHint?: string;
    /** Cutoff time for orders (defaults to 24h before startsAt). */
    cutoffAt?: string;
    /** Curated product handles when mode === 'curated'. */
    curatedHandles?: string[];
    /** Package slugs when mode === 'package-only'. */
    packageSlugs?: string[];
  };
  /** Optional sponsors / partner logos at the bottom. */
  sponsors?: { name: string; logo?: string; url?: string }[];
};

/**
 * In-memory RSVP record used in mockup mode. Real version will write to a
 * new Prisma model.
 */
export type RsvpRecord = {
  id: string;
  eventSlug: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  guestCount: number;
  message?: string;
  hasOrderedDrinks: boolean;
  orderedItems?: Array<{ handle: string; name: string; qty: number; unitPrice: number }>;
  rsvpedAt: string;
};
