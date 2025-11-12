/**
 * Sitemap generation for PartyOn Delivery
 *
 * Generates dynamic sitemap including:
 * - Static pages (excluding /account blocked by robots.txt)
 * - Shopify products (auto-paginated)
 * - Dynamic delivery location pages
 * - Migrated blog posts from Shopify
 * - Dynamic blog category pages
 *
 * Last updated: Nov 2024 - Fixed Google Search Console warnings
 */

import { MetadataRoute } from 'next'
import blogPosts from '@/data/blog-posts/posts.json'
import { shopifyFetch } from '@/lib/shopify/client'
import { gql } from 'graphql-request'

interface BlogPost {
  slug: string;
  publishedAt: string;
}

// Query to get all product handles for sitemap
// Only includes active, available products to prevent 404s
const ALL_PRODUCTS_HANDLES_QUERY = gql`
  query getAllProductHandles {
    products(first: 250, query: "status:active") {
      edges {
        node {
          handle
          updatedAt
          availableForSale
          status
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

interface ProductNode {
  handle: string;
  updatedAt: string;
  availableForSale: boolean;
  status: string;
}

// Fetch products from Shopify
async function getProducts(): Promise<ProductNode[]> {
  try {
    const response = await shopifyFetch<{
      products: {
        edges: Array<{ node: ProductNode }>;
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    }>({
      query: ALL_PRODUCTS_HANDLES_QUERY,
    });

    let allProducts = response.products.edges.map(edge => edge.node);

    // If there are more products, fetch them (pagination)
    let hasNextPage = response.products.pageInfo.hasNextPage;
    let endCursor = response.products.pageInfo.endCursor;

    while (hasNextPage && endCursor) {
      const nextResponse = await shopifyFetch<{
        products: {
          edges: Array<{ node: ProductNode }>;
          pageInfo: { hasNextPage: boolean; endCursor: string | null };
        };
      }>({
        query: gql`
          query getAllProductHandles($after: String) {
            products(first: 250, after: $after, query: "status:active") {
              edges {
                node {
                  handle
                  updatedAt
                  availableForSale
                  status
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        `,
        variables: { after: endCursor },
      });

      allProducts = [...allProducts, ...nextResponse.products.edges.map(edge => edge.node)];
      hasNextPage = nextResponse.products.pageInfo.hasNextPage;
      endCursor = nextResponse.products.pageInfo.endCursor;
    }

    // Filter to only include products that are available for sale
    // This prevents 404s and warnings in Google Search Console
    const availableProducts = allProducts.filter(product => product.availableForSale);

    console.log(`Sitemap: Fetched ${allProducts.length} products, ${availableProducts.length} available for sale`);

    return availableProducts;
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://partyondelivery.com'

  // Fetch dynamic data
  const products = await getProducts();

  // Static pages (excluding /account pages blocked by robots.txt)
  const staticPages = [
    '',
    '/about',
    '/contact',
    '/order',
    '/products',
    '/blog',
    '/blogs/news',
    '/weddings',
    '/boat-parties',
    '/bach-parties',
    '/corporate',
    '/delivery-areas',
    '/terms',
    '/privacy',
    '/faqs',
    '/partners'
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : route === '/products' ? 0.9 : 0.8
  }))

  // Product pages (dynamic)
  const productPages = products.map(product => ({
    url: `${baseUrl}/products/${product.handle}`,
    lastModified: new Date(product.updatedAt),
    changeFrequency: 'daily' as const,
    priority: 0.8
  }))

  // Location pages for SEO (dynamic routes)
  const locationSlugs = [
    'downtown-austin',
    'lake-travis',
    'west-austin',
    'south-austin',
    'east-austin',
    'north-austin'
  ];

  const locationPages = locationSlugs.map(slug => ({
    url: `${baseUrl}/delivery/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7
  }))

  // Migrated blog posts from Shopify (preserving exact URLs for SEO)
  const migratedBlogPosts = (blogPosts as BlogPost[]).map(post => ({
    url: `${baseUrl}/blogs/news/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6
  }))

  // Blog categories (dynamic routes - using actual category slugs)
  const categorySlugs = [
    'event-planning',
    'cocktail-recipes',
    'local-guides',
    'business-tips'
  ];

  const blogCategories = categorySlugs.map(slug => ({
    url: `${baseUrl}/blog/category/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5
  }))

  return [
    ...staticPages,
    ...productPages,
    ...locationPages,
    ...migratedBlogPosts,
    ...blogCategories
  ]
}
