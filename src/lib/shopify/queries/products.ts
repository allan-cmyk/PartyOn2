import { gql } from 'graphql-request';

// Optimized query for product grid/list views - minimal data for performance
export const PRODUCTS_GRID_QUERY = gql`
  query getProductsGrid($first: Int = 20, $after: String, $query: String) {
    products(first: $first, after: $after, query: $query) {
      edges {
        node {
          id
          handle
          title
          description
          productType
          tags
          vendor
          collections(first: 3) {
            edges {
              node {
                handle
                title
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                availableForSale
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

// Optimized collection query for grid view
export const COLLECTION_GRID_QUERY = gql`
  query getCollectionGrid($handle: String!, $first: Int = 100) {
    collectionByHandle(handle: $handle) {
      id
      handle
      title
      description
      products(first: $first) {
        edges {
          node {
            id
            handle
            title
            productType
            tags
            vendor
            collections(first: 3) {
              edges {
                node {
                  handle
                  title
                }
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  availableForSale
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const PRODUCTS_QUERY = gql`
  query getProducts($first: Int = 20, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          id
          handle
          title
          description
          vendor
          productType
          tags
          collections(first: 5) {
            edges {
              node {
                handle
                title
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 1) {
            edges {
              node {
                url
                altText
                width
                height
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                title
                availableForSale
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = gql`
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
`;

export const COLLECTIONS_QUERY = gql`
  query getCollections($first: Int = 10) {
    collections(first: $first) {
      edges {
        node {
          id
          handle
          title
          description
          image {
            url
            altText
          }
        }
      }
    }
  }
`;

export const COLLECTION_BY_HANDLE_QUERY = gql`
  query getCollectionByHandle($handle: String!, $first: Int = 100) {
    collectionByHandle(handle: $handle) {
      id
      handle
      title
      description
      image {
        url
        altText
      }
      products(first: $first) {
        edges {
          node {
            id
            handle
            title
            description
            vendor
            productType
            tags
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                  width
                  height
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  availableForSale
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

// Search products query
export const SEARCH_PRODUCTS_QUERY = gql`
  query searchProducts($query: String!, $first: Int = 50) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          handle
          title
          description
          vendor
          productType
          tags
          collections(first: 5) {
            edges {
              node {
                handle
                title
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                availableForSale
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

// Fetch multiple products by handles - uses Shopify query filter
export const PRODUCTS_BY_HANDLES_QUERY = gql`
  query getProductsByHandles($query: String!, $first: Int = 20) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          handle
          title
          productType
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                availableForSale
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

// Storefront Search Query - Uses Shopify's predictiveSearch for real-time search
export const STOREFRONT_SEARCH_QUERY = gql`
  query storefrontSearch($query: String!, $limit: Int = 10) {
    predictiveSearch(query: $query, limit: $limit, types: [PRODUCT]) {
      products {
        id
        handle
        title
        description
        vendor
        productType
        tags
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 1) {
          edges {
            node {
              url
              altText
            }
          }
        }
        variants(first: 1) {
          edges {
            node {
              id
              availableForSale
              price {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
`;