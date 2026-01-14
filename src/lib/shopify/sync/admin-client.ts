/**
 * Shopify Admin API Client
 * For sync operations and admin-level queries
 */

const domain = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;

export interface AdminGraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
  extensions?: {
    cost: {
      requestedQueryCost: number;
      actualQueryCost: number;
      throttleStatus: {
        maximumAvailable: number;
        currentlyAvailable: number;
        restoreRate: number;
      };
    };
  };
}

/**
 * Execute Admin API GraphQL query
 */
export async function adminGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || process.env.SHOPIFY_ADMIN_API_TOKEN;

  if (!adminToken || !domain) {
    throw new Error('Shopify Admin API credentials not configured');
  }

  const response = await fetch(
    `https://${domain}/admin/api/2024-01/graphql.json`,
    {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': adminToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  const result: AdminGraphQLResponse<T> = await response.json();

  if (result.errors?.length) {
    console.error('Shopify Admin API errors:', result.errors);
    throw new Error(result.errors[0].message);
  }

  if (!result.data) {
    throw new Error('No data returned from Shopify Admin API');
  }

  return result.data;
}

/**
 * Handle pagination for Admin API bulk queries
 */
export async function* paginatedAdminQuery<T, N>(
  query: string,
  getNodes: (data: T) => N[],
  getPageInfo: (data: T) => { hasNextPage: boolean; endCursor: string | null },
  variables?: Record<string, unknown>,
  pageSize = 50
): AsyncGenerator<N[], void, unknown> {
  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const data = await adminGraphQL<T>(query, {
      ...variables,
      first: pageSize,
      after: cursor,
    });

    const nodes = getNodes(data);
    if (nodes.length > 0) {
      yield nodes;
    }

    const pageInfo = getPageInfo(data);
    hasNextPage = pageInfo.hasNextPage;
    cursor = pageInfo.endCursor;

    // Rate limit: max 2 queries per second
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}
