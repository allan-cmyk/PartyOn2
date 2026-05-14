import type { Metadata } from 'next';
import FlyerContent from '@/components/flyer/FlyerContent';

export const metadata: Metadata = {
  title: 'Party On Delivery — The Playbook | Austin Premier Event Services',
  description:
    'Alcohol delivery, party rentals, full bar setup, Fresh Victor cocktail kits, and white-glove concierge. Every service we offer in one luxury flyer.',
  openGraph: {
    title: 'Party On Delivery — The Playbook',
    description:
      'Alcohol delivery, party rentals, full bar setup, Fresh Victor cocktail kits, and white-glove concierge.',
    images: [{ url: '/images/services/bach-parties/bachelor-party-epic.webp' }],
    url: 'https://partyondelivery.com/flyer',
  },
  // Keep the flyer indexable — it's a real marketing asset.
  robots: { index: true, follow: true },
};

export const dynamic = 'force-static';

export default function FlyerPage() {
  return <FlyerContent />;
}
