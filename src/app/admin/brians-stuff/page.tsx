import type { Metadata } from 'next';
import PlaybookClient from '@/app/landing-page-playbook/PlaybookClient';

export const metadata: Metadata = {
  title: "Brian's Stuff — Admin",
  robots: { index: false, follow: false },
};

/**
 * Admin-only landing page for Brian's reference docs.
 * Currently hosts the landing-page playbook so it's accessible from inside
 * the admin nav. Add additional reference docs/links here over time.
 */
export default function Page() {
  return (
    <div className="-m-6 md:-m-8 lg:-m-10">
      <PlaybookClient />
    </div>
  );
}
