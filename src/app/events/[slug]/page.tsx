import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDemoEvent } from '@/lib/events/demoEvents';
import { getEventDrinkOptions } from '@/lib/events/getEventDrinkOptions';
import EventInvitePage from '@/components/events/EventInvitePage';

/**
 * Public event invite page.
 *
 * /events/<slug> — invitee-facing. Looks up the event from the demo
 * registry (mockup phase) and renders the full RSVP + BYOB-order flow.
 *
 * When backend persistence lands, this resolver will swap to a Prisma
 * lookup with no other changes to the page itself.
 */
export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const ev = getDemoEvent(slug);
  if (!ev) return { title: 'Event invite — Party On Delivery' };
  return {
    title: `${ev.title} — RSVP`,
    description: ev.tagline,
    openGraph: {
      title: ev.title,
      description: ev.tagline,
      images: [{ url: ev.heroImage }],
      url: `https://partyondelivery.com/events/${ev.slug}`,
    },
    robots: { index: false, follow: false }, // demo phase
  };
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  const event = getDemoEvent(slug);
  if (!event) notFound();
  const drinkOptions = await getEventDrinkOptions(event);
  return <EventInvitePage event={event} drinkOptions={drinkOptions} />;
}
