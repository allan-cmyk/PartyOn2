export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  tags: string[];
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
      node: ShopifyProductVariant;
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

export interface ShopifyProductVariant {
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

export interface ShopifyCollection {
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
      node: ShopifyProduct;
    }>;
  };
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: {
    edges: Array<{
      node: {
        id: string;
        quantity: number;
        merchandise: {
          id: string;
          title: string;
          price: {
            amount: string;
            currencyCode: string;
          };
          product: {
            title: string;
            handle: string;
            images?: {
              edges: Array<{
                node: {
                  url: string;
                  altText: string | null;
                };
              }>;
            };
          };
        };
      };
    }>;
  };
  cost: {
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
    subtotalAmount: {
      amount: string;
      currencyCode: string;
    };
    totalTaxAmount?: {
      amount: string;
      currencyCode: string;
    };
  };
}

export interface ShopifyCustomer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
  acceptsMarketing: boolean;
  createdAt?: string;
  updatedAt?: string;
  defaultAddress?: ShopifyAddress;
  addresses: {
    edges: Array<{
      node: ShopifyAddress;
    }>;
  };
  orders?: {
    edges: Array<{
      node: ShopifyOrder;
    }>;
  };
  metafields?: Array<{
    key: string;
    value: string | number | boolean;
    type?: string;
  }>;
}

export interface ShopifyAddress {
  id: string;
  address1?: string;
  address2?: string;
  city?: string;
  company?: string;
  country?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  province?: string;
  zip?: string;
}

export interface ShopifyOrder {
  id: string;
  orderNumber: number;
  name: string;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  currentTotalPrice: {
    amount: string;
    currencyCode: string;
  };
  totalShippingPrice?: {
    amount: string;
    currencyCode: string;
  };
  subtotalPrice?: {
    amount: string;
    currencyCode: string;
  };
  totalTax?: {
    amount: string;
    currencyCode: string;
  };
  lineItems: {
    edges: Array<{
      node: {
        title: string;
        quantity: number;
        variant: ShopifyProductVariant & {
          product?: {
            handle: string;
          };
        };
      };
    }>;
  };
  shippingAddress?: ShopifyAddress;
  shippingLine?: {
    title: string;
    price: {
      amount: string;
      currencyCode: string;
    };
  };
  statusUrl?: string;
  successfulFulfillments?: Array<{
    trackingCompany?: string;
    trackingInfo?: Array<{
      number: string;
      url?: string;
    }>;
  }>;
}

export interface CustomerAccessToken {
  accessToken: string;
  expiresAt: string;
}

export interface CustomerUserError {
  field?: string[];
  message: string;
  code?: string;
}

// Alcohol-specific types
export interface AlcoholProduct extends ShopifyProduct {
  metafield?: {
    value: string;
    type: string;
  } | null;
}

export interface DeliveryWindow {
  date: string;
  timeSlots: Array<{
    start: string;
    end: string;
    available: boolean;
  }>;
}

export interface AgeVerification {
  verified: boolean;
  verifiedAt?: Date;
  idType?: string;
  idNumber?: string;
}