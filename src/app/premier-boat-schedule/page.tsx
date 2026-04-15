import { cookies, headers } from 'next/headers';
import { notFound } from 'next/navigation';
import PublicBoatScheduleClient from './PublicBoatScheduleClient';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Boat Schedule',
  robots: { index: false, follow: false, noindex: true, nofollow: true },
};

/**
 * Server component: validates the shared token before rendering the page.
 * Returns 404 (not 401) if missing/wrong so the URL's existence isn't leaked.
 *
 * The token can come from:
 *   - ?key=... query string (captain's first visit via shared link)
 *   - pbs_key cookie (set after first successful visit for 180 days)
 */
export default async function PremierBoatSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const expected = process.env.PREMIER_SCHEDULE_PUBLIC_KEY;
  if (!expected) notFound();

  const params = await searchParams;
  const cookieStore = await cookies();
  const cookieKey = cookieStore.get('pbs_key')?.value;
  const queryKey = params.key;

  const authorized = queryKey === expected || cookieKey === expected;
  if (!authorized) notFound();

  // If the key came from ?key= (first visit), set a long-lived cookie
  // so future visits don't need the query string. Next.js doesn't allow
  // setting cookies from server components, so we pass a flag and let
  // the client set document.cookie on mount.
  const shouldSetCookie = queryKey === expected && cookieKey !== expected;

  await headers(); // marks the page as dynamic

  return <PublicBoatScheduleClient sharedKey={expected} setCookie={shouldSetCookie} />;
}
