import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { shopifyFetch } from '@/lib/shopify/client';
import { PRODUCT_BY_HANDLE_QUERY } from '@/lib/shopify/queries/products';
import { ShopifyProduct } from '@/lib/shopify/types';
import ProductDetailClient from '@/components/products/ProductDetailClient';
import SneebergFAQ from '@/components/products/SneebergFAQ';
import ProductBreadcrumbs from '@/components/products/ProductBreadcrumbs';
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

  // Check if this is Schneeberg product for custom SEO optimization
  const isSchneebergProduct = handle.toLowerCase().includes('schneeberg') ||
                               handle.toLowerCase().includes('poschl') ||
                               handle.toLowerCase().includes('weiss');

  // Schneeberg-specific optimized metadata
  if (isSchneebergProduct) {
    return {
      title: 'Pöschl Schneeberg Snuff Austin | Tobacco-Free | Fast Delivery',
      description: 'Buy Pöschl Schneeberg Weiss tobacco-free herbal snuff in Austin. Refreshing peppermint nasal snuff, no tobacco or nicotine. Same-day delivery available. Order now!',
      keywords: 'schneeberg snuff, schneeberg powder, poschl schneeberg, schneeberg austin, tobacco free snuff, nicotine free snuff, herbal snuff austin, peppermint snuff, bavarian nasal mint powder, schneeberg snuff where to buy, schneeberg weiss',
      openGraph: {
        title: 'Pöschl Schneeberg Weiss - Tobacco-Free Herbal Snuff | Austin Delivery',
        description: 'Premium tobacco-free, nicotine-free peppermint snuff delivered in Austin. Authentic Pöschl Schneeberg Weiss with same-day delivery.',
        type: 'website',
        url: `https://partyondelivery.com/products/${handle}`,
        images: [
          {
            url: image,
            width: 1200,
            height: 1200,
            alt: 'Pöschl Schneeberg Weiss tobacco-free herbal snuff tin',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Pöschl Schneeberg Snuff - Tobacco-Free Herbal Snuff',
        description: 'Refreshing peppermint herbal snuff. No tobacco, no nicotine. Fast Austin delivery.',
        images: [image],
      },
      alternates: {
        canonical: `/products/${handle}`,
      },
    };
  }

  // Default metadata for all other products
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

// Generate static params for top products to pre-render at build time
export async function generateStaticParams() {
  try {
    // Fetch top 50 most popular products to pre-render
    // This significantly improves SEO as Google can crawl pre-rendered HTML
    const response = await shopifyFetch<{
      products: {
        edges: Array<{ node: { handle: string } }>;
      };
    }>({
      query: `
        query getTopProducts {
          products(first: 50, sortKey: BEST_SELLING) {
            edges {
              node {
                handle
              }
            }
          }
        }
      `,
    });

    return response.products.edges.map(({ node }) => ({
      handle: node.handle,
    }));
  } catch (error) {
    console.error('Error fetching products for static generation:', error);
    // Return empty array if fetch fails - pages will render on-demand
    return [];
  }
}

// Main Server Component
export default async function ProductDetailPage({ params }: Props) {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) {
    notFound();
  }

  // Check if this is a Schneeberg product
  const isSchneebergProduct = handle.toLowerCase().includes('schneeberg') ||
                               handle.toLowerCase().includes('poschl') ||
                               handle.toLowerCase().includes('weiss');

  // Generate Product Schema.org structured data
  const baseStructuredData = {
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
      areaServed: {
        '@type': 'City',
        name: 'Austin',
        '@id': 'https://en.wikipedia.org/wiki/Austin,_Texas'
      }
    },
    brand: {
      '@type': 'Brand',
      name: product.vendor || 'Party On Delivery',
    },
    category: product.productType || 'Beverage',
  };

  // Enhanced structured data for Schneeberg with additional properties
  const structuredData = isSchneebergProduct ? {
    ...baseStructuredData,
    name: 'Pöschl Schneeberg Weiss Tobacco-Free Herbal Snuff',
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Tobacco Content',
        value: 'Tobacco-Free'
      },
      {
        '@type': 'PropertyValue',
        name: 'Nicotine Content',
        value: 'Nicotine-Free'
      },
      {
        '@type': 'PropertyValue',
        name: 'Flavor',
        value: 'Peppermint'
      },
      {
        '@type': 'PropertyValue',
        name: 'Type',
        value: 'Herbal Snuff'
      },
      {
        '@type': 'PropertyValue',
        name: 'Origin',
        value: 'Germany'
      }
    ]
  } : baseStructuredData;

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Breadcrumb Navigation */}
      <ProductBreadcrumbs
        productName={product.title}
        productHandle={handle}
        category={product.productType}
      />

      {/* Client Component for Interactive Features */}
      <ProductDetailClient product={product} />

      {/* Schneeberg-specific SEO content */}
      {isSchneebergProduct && (
        <>
          <SneebergFAQ />
        </>
      )}
    </>
  );
}
