import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { shopifyFetch } from '@/lib/shopify/client';
import { PRODUCT_BY_HANDLE_QUERY } from '@/lib/shopify/queries/products';
import { ShopifyProduct } from '@/lib/shopify/types';
import ProductDetailClient from '@/components/products/ProductDetailClient';
import { formatPrice } from '@/lib/shopify/utils';

interface Props {
  params: Promise<{ handle: string }>;
}

// Fetch product server-side
async function getProduct(handle: string): Promise<ShopifyProduct | null> {
  try {
    const response = await shopifyFetch<{ productByHandle: ShopifyProduct | null }>({
      query: PRODUCT_BY_HANDLE_QUERY,
      variables: { handle },
    });
    return response.productByHandle;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const price = formatPrice(
    product.priceRange.minVariantPrice.amount,
    product.priceRange.minVariantPrice.currencyCode
  );

  const image = product.images.edges[0]?.node.url || '/images/logo.png';

  // Strip HTML from description for meta tag
  const plainDescription = product.description?.replace(/<[^>]*>/g, '') || '';
  const truncatedDescription = plainDescription.length > 160
    ? plainDescription.substring(0, 157) + '...'
    : plainDescription;

  return {
    title: `${product.title} - ${price} | Party On Delivery Austin`,
    description: truncatedDescription || `Buy ${product.title} for delivery in Austin. Premium alcohol delivery for weddings, parties, and events.`,
    keywords: `${product.title}, austin alcohol delivery, ${product.productType}, party supplies austin`,
    openGraph: {
      title: product.title,
      description: truncatedDescription || `Premium ${product.title} delivered in Austin`,
      type: 'website',
      url: `https://partyondelivery.com/products/${handle}`,
      images: [
        {
          url: image,
          width: 1200,
          height: 1200,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: truncatedDescription,
      images: [image],
    },
    alternates: {
      canonical: `/products/${handle}`,
    },
  };
}

// Generate static params for popular products (optional but recommended)
export async function generateStaticParams() {
  // For now, return empty array - can be populated with top products later
  // This allows dynamic rendering for all products while still being SEO-friendly
  return [];
}

// Main Server Component
export default async function ProductDetailPage({ params }: Props) {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) {
    notFound();
  }

  // Generate Product Schema.org structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description?.replace(/<[^>]*>/g, '') || '',
    image: product.images.edges.map(edge => edge.node.url),
    offers: {
      '@type': 'Offer',
      url: `https://partyondelivery.com/products/${handle}`,
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      price: product.priceRange.minVariantPrice.amount,
      availability: product.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Party On Delivery',
      },
    },
    brand: {
      '@type': 'Brand',
      name: product.vendor || 'Party On Delivery',
    },
    category: product.productType || 'Beverage',
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Client Component for Interactive Features */}
      <ProductDetailClient product={product} />
    </>
  );
}
