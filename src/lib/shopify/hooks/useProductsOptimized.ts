import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { shopifyFetch } from '../client';
import { PRODUCTS_QUERY } from '../queries/products';
import { ShopifyProduct } from '../types';

interface ProductsResponse {
  products: {
    edges: Array<{
      node: ShopifyProduct;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string;
    };
  };
}

// Fetcher function for SWR
const fetcher = async (query: string, variables: Record<string, unknown>) => {
  return shopifyFetch<ProductsResponse>({
    query,
    variables,
  });
};

// Optimized hook with SWR for caching and deduplication
export function useProductsOptimized(pageSize: number = 50) {
  const getKey = (pageIndex: number, previousPageData: ProductsResponse | null) => {
    // reached the end
    if (previousPageData && !previousPageData.products.pageInfo.hasNextPage) return null;
    
    // first page, we don't have `previousPageData`
    if (pageIndex === 0) {
      return [PRODUCTS_QUERY, { first: pageSize }];
    }
    
    // add the cursor from the previous page
    return [
      PRODUCTS_QUERY,
      { 
        first: pageSize, 
        after: previousPageData?.products.pageInfo.endCursor 
      }
    ];
  };

  const {
    data,
    error,
    size,
    setSize,
    isLoading,
    mutate
  } = useSWRInfinite<ProductsResponse>(
    getKey,
    ([query, variables]) => fetcher(query, variables),
    {
      revalidateFirstPage: false,
      revalidateAll: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // Dedupe requests for 1 minute
      fallbackData: [], // Start with empty array
      parallel: true, // Load pages in parallel
      initialSize: 1, // Start with 1 page
      persistSize: true, // Remember page size
    }
  );

  // Flatten all products from all pages
  const products = data ? data.flatMap(page => 
    page.products.edges.map(edge => edge.node)
  ) : [];

  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.products.edges.length === 0;
  const isReachingEnd = isEmpty || (data && !data[data.length - 1]?.products.pageInfo.hasNextPage);

  const loadMore = () => {
    if (!isLoadingMore && !isReachingEnd) {
      setSize(size + 1);
    }
  };

  // Prefetch next page
  const prefetchNext = () => {
    if (!isReachingEnd && data) {
      const lastPage = data[data.length - 1];
      if (lastPage?.products.pageInfo.hasNextPage) {
        // Prefetch the next page
        fetcher(PRODUCTS_QUERY, { 
          first: pageSize, 
          after: lastPage.products.pageInfo.endCursor 
        });
      }
    }
  };

  return {
    products,
    loading: isLoading,
    loadingMore: isLoadingMore,
    error,
    hasMore: !isReachingEnd,
    loadMore,
    prefetchNext,
    refresh: () => mutate(),
  };
}

// Single product hook with caching
export function useProductOptimized(handle: string) {
  const { data, error, isLoading, mutate } = useSWR<{productByHandle: ShopifyProduct}>(
    handle ? `/product/${handle}` : null,
    () => shopifyFetch({
      query: `
        query getProductByHandle($handle: String!) {
          productByHandle(handle: $handle) {
            id
            handle
            title
            description
            descriptionHtml
            vendor
            productType
            tags
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 10) {
              edges {
                node {
                  url
                  altText
                  width
                  height
                }
              }
            }
            variants(first: 100) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  quantityAvailable
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                  selectedOptions {
                    name
                    value
                  }
                  image {
                    url
                    altText
                  }
                }
              }
            }
            metafield(namespace: "custom", key: "alcohol_by_volume") {
              value
              type
            }
          }
        }
      `,
      variables: { handle },
    }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    product: data?.productByHandle,
    loading: isLoading,
    error,
    refresh: () => mutate(),
  };
}