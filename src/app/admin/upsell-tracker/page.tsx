import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * The Upsell A/B tracker now lives inside the Brian's Stuff admin tab.
 * Redirect any deep links / old bookmarks to the new location.
 */
export default function Page() {
  redirect('/admin/brians-stuff?tab=upsell');
}
