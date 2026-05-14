import type { Metadata } from 'next';
import PlaybookClient from '@/app/landing-page-playbook/PlaybookClient';
import UpsellTrackerView from '@/components/admin/UpsellTrackerView';
import BriansStuffTabs from './BriansStuffTabs';

export const metadata: Metadata = {
  title: "Brian's Stuff — Admin",
  robots: { index: false, follow: false },
};

// Renders the upsell tracker server-side so the DB query happens on the
// initial page load, then hands both panels to the tabbed client shell.
export const dynamic = 'force-dynamic';

type SP = Promise<{ tab?: string }>;

/**
 * Admin-only landing page for Brian's reference docs + tools.
 * Tabs:
 *   1. Landing Page Playbook
 *   2. Upsell A/B Tracker
 */
export default async function Page({ searchParams }: { searchParams: SP }) {
  const params = await searchParams;
  const initialTab = params.tab === 'upsell' ? 'upsell' : 'playbook';

  return (
    <BriansStuffTabs
      initialTab={initialTab}
      playbook={<PlaybookClient />}
      tracker={<UpsellTrackerView />}
    />
  );
}
