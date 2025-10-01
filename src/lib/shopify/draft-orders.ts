/**
 * Shopify Draft Order API integration
 * Used to create merged checkouts for group orders
 */

/**
 * Fix invoice URLs to use the reliable Shopify store domain
 * Handles multiple domain patterns and ensures reliable invoice access
 */
function fixInvoiceUrl(invoiceUrl: string | null | undefined): string | null {
  if (!invoiceUrl) return null;

  const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN || 'premier-concierge.myshopify.com';

  // List of custom domains that might cause issues
  const customDomains = [
    'partyondelivery.com',
    'party-on-delivery.com',
    'www.partyondelivery.com',
    'www.party-on-delivery.com'
  ];

  let fixedUrl = invoiceUrl;

  // Replace any custom domain with the reliable store domain
  for (const customDomain of customDomains) {
    fixedUrl = fixedUrl.replace(new RegExp(`https?://${customDomain.replace('.', '\\.')}`, 'gi'), `https://${storeDomain}`);
  }

  // Ensure the URL uses HTTPS
  if (fixedUrl.startsWith('http://')) {
    fixedUrl = fixedUrl.replace('http://', 'https://');
  }

  console.log('🔧 Invoice URL fix:', { original: invoiceUrl, fixed: fixedUrl });

  return fixedUrl;
}

/**
 * Generate a custom invoice email body with corrected URLs
 */
function generateCustomInvoiceMessage(draftOrderId: string, defaultMessage?: string): string {
  const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN || 'premier-concierge.myshopify.com';

  // Extract just the ID part for the invoice URL
  const invoiceId = draftOrderId.replace('gid://shopify/DraftOrder/', '');
  const correctInvoiceUrl = `https://${storeDomain}/invoices/${invoiceId}`;

  return `${defaultMessage || 'Please complete your Party On Delivery group order payment.'}

To complete your purchase, please click the link below:
${correctInvoiceUrl}

If the link doesn't work, you can copy and paste this URL into your browser:
${correctInvoiceUrl}

Thank you for choosing Party On Delivery!

---
Party On Delivery Team
Austin's Premier Alcohol Delivery Service`;
}
interface DraftOrderLineItem {
  variantId: string;
  quantity: number;
}

interface DraftOrderInput {
  lineItems: DraftOrderLineItem[];
  customerId?: string;
  email: string;
  phone?: string;
  shippingAddress: {
    address1: string;
    address2?: string;
    city: string;
    province: string;
    zip: string;
    country: string;
    firstName: string;
    lastName: string;
  };
  note?: string;
  tags?: string[];
  customAttributes?: Array<{
    key: string;
    value: string;
  }>;
}

const DRAFT_ORDER_MUTATION = `
  mutation draftOrderCreate($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder {
        id
        name
        invoiceUrl
        status
        totalPrice
        subtotalPrice
        totalTax
        lineItems(first: 250) {
          edges {
            node {
              title
              quantity
              originalUnitPrice
              discountedUnitPrice
              originalTotal
              discountedTotal
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// const DRAFT_ORDER_COMPLETE_MUTATION = `
//   mutation draftOrderComplete($id: ID!) {
//     draftOrderComplete(draftOrderId: $id) {
//       draftOrder {
//         id
//         order {
//           id
//           name
//         }
//       }
//       userErrors {
//         field
//         message
//       }
//     }
//   }
// `;

const DRAFT_ORDER_INVOICE_SEND = `
  mutation draftOrderInvoiceSend($id: ID!, $email: EmailInput!) {
    draftOrderInvoiceSend(id: $id, email: $email) {
      draftOrder {
        id
        invoiceSentAt
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Create a draft order using the Admin API
 */
export async function createDraftOrder(input: DraftOrderInput) {
  const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
  
  if (!adminToken || !domain) {
    throw new Error('Shopify Admin API credentials not configured');
  }

  try {
    const response = await fetch(
      `https://${domain}/admin/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': adminToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: DRAFT_ORDER_MUTATION,
          variables: { input },
        }),
      }
    );

    const data = await response.json();

    if (data.data?.draftOrderCreate?.userErrors?.length > 0) {
      const errors = data.data.draftOrderCreate.userErrors;
      throw new Error(`Draft order creation failed: ${errors[0].message}`);
    }

    if (!data.data?.draftOrderCreate?.draftOrder) {
      throw new Error('Failed to create draft order');
    }

    const draftOrder = data.data.draftOrderCreate.draftOrder;

    // Fix invoice URL to use store domain instead of custom domain
    if (draftOrder.invoiceUrl) {
      draftOrder.invoiceUrl = fixInvoiceUrl(draftOrder.invoiceUrl);
    }

    return draftOrder;
  } catch (error) {
    console.error('Error creating draft order:', error);
    throw error;
  }
}

/**
 * Send invoice for a draft order with corrected invoice URL
 */
export async function sendDraftOrderInvoice(
  draftOrderId: string,
  email: string,
  subject?: string,
  message?: string
) {
  const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
  
  if (!adminToken || !domain) {
    throw new Error('Shopify Admin API credentials not configured');
  }

  try {
    const response = await fetch(
      `https://${domain}/admin/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': adminToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: DRAFT_ORDER_INVOICE_SEND,
          variables: {
            id: draftOrderId,
            email: {
              to: email,
              subject: subject || 'Your Party On Delivery Group Order - Complete Payment',
              message: generateCustomInvoiceMessage(draftOrderId, message),
            },
          },
        }),
      }
    );

    const data = await response.json();

    if (data.data?.draftOrderInvoiceSend?.userErrors?.length > 0) {
      const errors = data.data.draftOrderInvoiceSend.userErrors;
      throw new Error(`Failed to send invoice: ${errors[0].message}`);
    }

    const draftOrder = data.data?.draftOrderInvoiceSend?.draftOrder;

    // Fix invoice URL to use store domain instead of custom domain
    if (draftOrder?.invoiceUrl) {
      draftOrder.invoiceUrl = fixInvoiceUrl(draftOrder.invoiceUrl);
    }

    return draftOrder;
  } catch (error) {
    console.error('Error sending draft order invoice:', error);
    throw error;
  }
}

/**
 * Create a draft order from multiple carts (for group orders)
 */
interface CartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
  };
}

export async function createGroupDraftOrder(
  carts: Array<{ id: string; lines: CartLine[] }>,
  groupOrderDetails: {
    hostEmail: string;
    hostPhone?: string;
    hostCustomerId?: string;
    deliveryAddress: {
      address1: string;
      address2?: string;
      city: string;
      province: string;
      zip: string;
      country: string;
    };
    deliveryDate: string;
    deliveryTime: string;
    groupName: string;
    shareCode: string;
  }
) {
  // Merge all cart line items
  const mergedLineItems: DraftOrderLineItem[] = [];
  
  for (const cart of carts) {
    for (const line of cart.lines) {
      const existingItem = mergedLineItems.find(
        item => item.variantId === line.merchandise.id
      );
      
      if (existingItem) {
        existingItem.quantity += line.quantity;
      } else {
        mergedLineItems.push({
          variantId: line.merchandise.id,
          quantity: line.quantity,
        });
      }
    }
  }

  // Create the draft order
  const draftOrderInput: DraftOrderInput = {
    lineItems: mergedLineItems,
    customerId: groupOrderDetails.hostCustomerId,
    email: groupOrderDetails.hostEmail,
    phone: groupOrderDetails.hostPhone,
    shippingAddress: {
      ...groupOrderDetails.deliveryAddress,
      firstName: 'Group Order',
      lastName: groupOrderDetails.groupName,
    },
    note: `Group Order: ${groupOrderDetails.groupName}
Share Code: ${groupOrderDetails.shareCode}
Delivery Date: ${groupOrderDetails.deliveryDate}
Delivery Time: ${groupOrderDetails.deliveryTime}
Number of Participants: ${carts.length}`,
    tags: ['group-order', `code-${groupOrderDetails.shareCode}`],
    customAttributes: [
      { key: 'group_order', value: 'true' },
      { key: 'share_code', value: groupOrderDetails.shareCode },
      { key: 'delivery_date', value: groupOrderDetails.deliveryDate },
      { key: 'delivery_time', value: groupOrderDetails.deliveryTime },
      { key: 'participant_count', value: carts.length.toString() },
    ],
  };

  return createDraftOrder(draftOrderInput);
}