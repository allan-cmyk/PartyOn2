import { MetadataRoute } from 'next'
import blogPosts from '@/data/blog-posts/posts.json'
import { shopifyFetch } from '@/lib/shopify/client'
import { gql } from 'graphql-request'

interface BlogPost {
  slug: string;
  publishedAt: string;
}

// Query to get all product handles for sitemap
const ALL_PRODUCTS_HANDLES_QUERY = gql`
  query getAllProductHandles {
    products(first: 250) {
      edges {
        node {
          handle
          updatedAt
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

// Query to get all collection handles
const ALL_COLLECTIONS_HANDLES_QUERY = gql`
  query getAllCollectionHandles {
    collections(first: 50) {
      edges {
        node {
          handle
          updatedAt
        }
      }
    }
  }
`;

interface ProductNode {
  handle: string;
  updatedAt: string;
}

interface CollectionNode {
  handle: string;
  updatedAt: string;
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
            products(first: 250, after: $after) {
              edges {
                node {
                  handle
                  updatedAt
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

    return allProducts;
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
    return [];
  }
}

// Fetch collections from Shopify
async function getCollections(): Promise<CollectionNode[]> {
  try {
    const response = await shopifyFetch<{
      collections: {
        edges: Array<{ node: CollectionNode }>;
      };
    }>({
      query: ALL_COLLECTIONS_HANDLES_QUERY,
    });

    return response.collections.edges.map(edge => edge.node);
  } catch (error) {
    console.error('Error fetching collections for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://partyondelivery.com'

  // Fetch dynamic data
  const products = await getProducts();
  const collections = await getCollections();

  // Static pages
  const staticPages = [
    '',
    '/about',
    '/contact',
    '/order',
    '/products',
    '/collections',
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
    '/account',
    '/account/orders',
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

  // Collection pages (dynamic)
  const collectionPages = collections.map(collection => ({
    url: `${baseUrl}/collections/${collection.handle}`,
    lastModified: new Date(collection.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7
  }))

  // Location pages for SEO
  const locationPages = [
    '/delivery/downtown-austin',
    '/delivery/lake-travis',
    '/delivery/west-austin',
    '/delivery/south-austin',
    '/delivery/east-austin',
    '/delivery/north-austin'
  ].map(route => ({
    url: `${baseUrl}${route}`,
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

  // Blog categories (keeping for backward compatibility)
  const blogCategories = [
    '/blog/category/event-planning',
    '/blog/category/cocktail-recipes',
    '/blog/category/local-guides',
    '/blog/category/business-tips'
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5
  }))

  return [
    ...staticPages,
    ...productPages,
    ...collectionPages,
    ...locationPages,
    ...migratedBlogPosts,
    ...blogCategories
  ]
}
