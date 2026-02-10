/** Product and catalog types used throughout the application */

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  tags: string[];
  availableForSale?: boolean;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{
      node: {
        url: string;
        altText: string | null;
        width: number;
        height: number;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: ProductVariant;
    }>;
  };
  metafield?: {
    value: string;
    type: string;
  } | null;
  collections?: {
    edges: Array<{
      node: {
        handle: string;
        title: string;
      };
    }>;
  };
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number;
  price: {
    amount: string;
    currencyCode: string;
  };
  compareAtPrice?: {
    amount: string;
    currencyCode: string;
  };
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
  image?: {
    url: string;
    altText: string | null;
  };
}

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image?: {
    url: string;
    altText: string | null;
  };
  products: {
    edges: Array<{
      node: Product;
    }>;
  };
}

/** Backward-compatible aliases (prefer new names for new code) */
export type ShopifyProduct = Product;
export type ShopifyProductVariant = ProductVariant;
export type ShopifyCollection = Collection;
