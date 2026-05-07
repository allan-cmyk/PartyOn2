import type { Metadata } from 'next';
import LandingPagesDirectory from './LandingPagesDirectory';

export const metadata: Metadata = {
  title: 'Party On Delivery — Landing Pages Directory',
  description:
    'Internal preview directory of all Party On Delivery event landing pages: bachelor, bachelorette, corporate, and wedding.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <LandingPagesDirectory />;
}
