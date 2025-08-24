import { GraphQLClient } from 'graphql-request';

const domain = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN!;
const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

const endpoint = `https://${domain}/api/2024-01/graphql.json`;

export const shopifyClient = new GraphQLClient(endpoint, {
  headers: {
    'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
    'Content-Type': 'application/json',
  },
});

// Helper function for making queries
export async function shopifyFetch<T>({
  query,
  variables = {},
}: {
  query: string;
  variables?: Record<string, unknown>;
}): Promise<T> {
  try {
    console.log('Shopify Request Variables:', JSON.stringify(variables, null, 2));
    return await shopifyClient.request<T>(query, variables);
  } catch (error) {
    console.error('Shopify API Error:', error);
    console.error('Failed with variables:', JSON.stringify(variables, null, 2));
    throw error;
  }
}