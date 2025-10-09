import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getCart } from '@/lib/cart/shortUrlStorage';
import { generateShareUrl } from '@/lib/cart/shareCart';

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Shared Cart | Party On Delivery',
  description: 'View and add shared cart items to your cart',
};

export default async function ShortCartPage({ params }: Props) {
  const { id } = await params;

  // Retrieve cart data from storage
  const cartData = getCart(id);

  if (!cartData) {
    // Cart not found or expired
    notFound();
  }

  // Generate the full URL with parameters for the actual cart page
  const fullUrl = generateShareUrl(cartData);

  // Extract just the query parameters
  const url = new URL(fullUrl);
  const queryString = url.search;

  // Redirect to the full cart shared page with parameters
  redirect(`/cart/shared${queryString}`);
}
