import { useState, useEffect } from 'react';
import { shopifyFetch } from '../client';
import { PRODUCTS_QUERY, PRODUCT_BY_HANDLE_QUERY } from '../queries/products';
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

interface ProductResponse {
  productByHandle: ShopifyProduct;
}

export function useProducts(first: number = 20, loadAll: boolean = false) {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [endCursor, setEndCursor] = useState<string | null>(null);

  useEffect(() => {
    if (loadAll) {
      fetchAllProducts();
    } else {
      fetchProducts();
    }
  }, [loadAll]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProducts = async (after?: string) => {
    try {
      setLoading(true);
      const data = await shopifyFetch<ProductsResponse>({
        query: PRODUCTS_QUERY,
        variables: { first, after },
      });

      const newProducts = data.products.edges.map(edge => edge.node);
      
      if (after) {
        setProducts(prev => [...prev, ...newProducts]);
      } else {
        setProducts(newProducts);
      }

      setHasNextPage(data.products.pageInfo.hasNextPage);
      setEndCursor(data.products.pageInfo.endCursor);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      let allProducts: ShopifyProduct[] = [];
      let cursor: string | null = null;
      let hasMore = true;
      
      while (hasMore) {
        const response: ProductsResponse = await shopifyFetch<ProductsResponse>({
          query: PRODUCTS_QUERY,
          variables: { first: 50, after: cursor }, // Use larger batch size
        });

        const newProducts = response.products.edges.map(edge => edge.node);
        allProducts = [...allProducts, ...newProducts];
        
        hasMore = response.products.pageInfo.hasNextPage;
        cursor = response.products.pageInfo.endCursor;
        
        // Set intermediate results so user sees products loading
        setProducts([...allProducts]);
      }

      setHasNextPage(false);
      setEndCursor(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasNextPage && endCursor) {
      fetchProducts(endCursor);
    }
  };

  return { products, loading, error, hasNextPage, loadMore };
}

export function useProduct(handle: string) {
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!handle) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await shopifyFetch<ProductResponse>({
          query: PRODUCT_BY_HANDLE_QUERY,
          variables: { handle },
        });

        setProduct(data.productByHandle);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [handle]);

  return { product, loading, error };
}