/**
 * Shopify Customer Sync Service
 * Syncs customers from Shopify to local database
 */

import { PrismaClient } from '@prisma/client';
import { adminGraphQL, paginatedAdminQuery } from './admin-client';

const CUSTOMERS_QUERY = `
  query getCustomers($first: Int!, $after: String) {
    customers(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          email
          phone
          firstName
          lastName
          acceptsMarketing
          createdAt
          updatedAt
          defaultAddress {
            id
            firstName
            lastName
            company
            address1
            address2
            city
            province
            zip
            country
            phone
          }
          addresses {
            id
            firstName
            lastName
            company
            address1
            address2
            city
            province
            zip
            country
            phone
          }
        }
      }
    }
  }
`;

interface ShopifyAddress {
  id: string;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  province: string | null;
  zip: string | null;
  country: string | null;
  phone: string | null;
}

interface ShopifyCustomer {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  acceptsMarketing: boolean;
  createdAt: string;
  updatedAt: string;
  defaultAddress: ShopifyAddress | null;
  addresses: ShopifyAddress[];
}

interface CustomersQueryResult {
  customers: {
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    edges: Array<{ node: ShopifyCustomer }>;
  };
}

/**
 * Extract Shopify GID numeric ID
 */
function extractShopifyId(gid: string): string {
  return gid.split('/').pop() || gid;
}

export interface CustomerSyncResult {
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ email: string | null; error: string }>;
}

/**
 * Sync all customers from Shopify to database
 */
export async function syncAllCustomers(prisma: PrismaClient): Promise<CustomerSyncResult> {
  const result: CustomerSyncResult = { created: 0, updated: 0, skipped: 0, errors: [] };

  const customerIterator = paginatedAdminQuery<CustomersQueryResult, ShopifyCustomer>(
    CUSTOMERS_QUERY,
    data => data.customers.edges.map(e => e.node),
    data => data.customers.pageInfo
  );

  for await (const customers of customerIterator) {
    for (const shopifyCustomer of customers) {
      try {
        // Skip customers without email
        if (!shopifyCustomer.email) {
          result.skipped++;
          continue;
        }

        const syncResult = await syncSingleCustomer(prisma, shopifyCustomer);
        if (syncResult.isNew) {
          result.created++;
        } else {
          result.updated++;
        }
      } catch (error) {
        result.errors.push({
          email: shopifyCustomer.email,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  return result;
}

/**
 * Sync a single customer from Shopify data
 */
async function syncSingleCustomer(
  prisma: PrismaClient,
  shopifyCustomer: ShopifyCustomer
): Promise<{ isNew: boolean }> {
  if (!shopifyCustomer.email) {
    throw new Error('Customer email is required');
  }

  const shopifyId = extractShopifyId(shopifyCustomer.id);

  // Check if customer exists
  const existing = await prisma.customer.findFirst({
    where: {
      OR: [{ shopifyId }, { email: shopifyCustomer.email }],
    },
  });

  const customerData = {
    email: shopifyCustomer.email,
    phone: shopifyCustomer.phone,
    firstName: shopifyCustomer.firstName,
    lastName: shopifyCustomer.lastName,
    acceptsMarketing: shopifyCustomer.acceptsMarketing,
    shopifyId,
  };

  let customerId: string;
  let isNew = false;

  if (existing) {
    await prisma.customer.update({
      where: { id: existing.id },
      data: customerData,
    });
    customerId = existing.id;
  } else {
    const created = await prisma.customer.create({
      data: customerData,
    });
    customerId = created.id;
    isNew = true;
  }

  // Sync addresses
  await syncCustomerAddresses(
    prisma,
    customerId,
    shopifyCustomer.addresses,
    shopifyCustomer.defaultAddress
  );

  return { isNew };
}

/**
 * Sync customer addresses
 */
async function syncCustomerAddresses(
  prisma: PrismaClient,
  customerId: string,
  addresses: ShopifyAddress[],
  defaultAddress: ShopifyAddress | null
): Promise<void> {
  // Get existing addresses for this customer
  const existingAddresses = await prisma.customerAddress.findMany({
    where: { customerId },
  });

  const existingShopifyIds = new Set(
    existingAddresses.map(a => a.shopifyId).filter(Boolean)
  );

  for (const address of addresses) {
    if (!address.address1) continue;

    const shopifyId = extractShopifyId(address.id);
    const isDefault = defaultAddress?.id === address.id;

    const addressData = {
      customerId,
      firstName: address.firstName,
      lastName: address.lastName,
      company: address.company,
      address1: address.address1,
      address2: address.address2,
      city: address.city || 'Austin',
      province: address.province || 'TX',
      zip: address.zip || '',
      country: address.country || 'US',
      phone: address.phone,
      isDefault,
      shopifyId,
    };

    if (existingShopifyIds.has(shopifyId)) {
      // Update existing address
      await prisma.customerAddress.updateMany({
        where: { shopifyId },
        data: addressData,
      });
    } else {
      // Create new address
      await prisma.customerAddress.create({
        data: addressData,
      });
    }
  }

  // If setting a default, ensure only one is default
  if (defaultAddress) {
    const defaultShopifyId = extractShopifyId(defaultAddress.id);
    await prisma.customerAddress.updateMany({
      where: {
        customerId,
        NOT: { shopifyId: defaultShopifyId },
      },
      data: { isDefault: false },
    });
  }
}

/**
 * Sync a single customer by Shopify ID
 */
export async function syncCustomerByShopifyId(
  prisma: PrismaClient,
  shopifyGid: string
): Promise<void> {
  const query = `
    query getCustomer($id: ID!) {
      customer(id: $id) {
        id
        email
        phone
        firstName
        lastName
        acceptsMarketing
        createdAt
        updatedAt
        defaultAddress {
          id
          firstName
          lastName
          company
          address1
          address2
          city
          province
          zip
          country
          phone
        }
        addresses {
          id
          firstName
          lastName
          company
          address1
          address2
          city
          province
          zip
          country
          phone
        }
      }
    }
  `;

  const data = await adminGraphQL<{ customer: ShopifyCustomer | null }>(query, {
    id: shopifyGid,
  });

  if (data.customer) {
    await syncSingleCustomer(prisma, data.customer);
  }
}
