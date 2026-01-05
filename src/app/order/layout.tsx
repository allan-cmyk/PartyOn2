/**
 * @fileoverview Layout for Order page with SEO metadata
 * @module app/order/layout
 */

import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Order | Party On Delivery - Austin Alcohol Delivery',
  description:
    'Fast and easy alcohol delivery ordering in Austin. One-tap add to cart, instant checkout. Beer, wine, spirits, and cocktail kits delivered to your door.',
  openGraph: {
    title: 'Order | Party On Delivery',
    description: 'Fast alcohol delivery ordering in Austin. One-tap add to cart.',
    type: 'website',
  },
};

export default function OrderLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return <>{children}</>;
}
