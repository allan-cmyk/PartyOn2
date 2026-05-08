import type { Metadata } from 'next';
import PlaybookClient from './PlaybookClient';

export const metadata: Metadata = {
  title: 'High-Converting Landing Page Playbook',
  description:
    'Internal methodology document for replicating the Party On Delivery landing-page system on a different brand.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <PlaybookClient />;
}
