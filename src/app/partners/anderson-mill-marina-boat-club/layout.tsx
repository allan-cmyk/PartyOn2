import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Anderson Mill Marina Boat Club - Free Alcohol Delivery | Party On Delivery',
  description:
    'Get free alcohol delivery to Anderson Mill Marina on Lake Travis. We deliver beer, wine, spirits, and mixers directly to your boat slip. Easy group ordering for boat owners.',
  openGraph: {
    title: 'Anderson Mill Marina Boat Club - Free Alcohol Delivery',
    description:
      "Free alcohol delivery to your slip at Anderson Mill Marina on Lake Travis. Easy group ordering, ice, cups, and split payments included.",
    images: ['/images/partners/anderson-mill-marina-hero.png'],
  },
  keywords: [
    'anderson mill marina alcohol delivery',
    'lake travis marina drinks',
    'boat slip delivery',
    'Anderson Mill Marina boat club',
    'beer delivery Lake Travis marina',
  ],
};

interface LayoutProps {
  children: ReactNode;
}

export default function AndersonMillMarinaLayout({
  children,
}: LayoutProps): ReactElement {
  return <>{children}</>;
}
