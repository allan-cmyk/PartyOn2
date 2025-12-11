/**
 * Shopify Admin API - Order Queries
 * Fetches order details for printable order sheets
 */

export interface OrderLineItem {
  title: string;
  variantTitle: string | null;
  quantity: number;
  sku: string | null;
}

export interface OrderAddress {
  address1: string | null;
  address2: string | null;
  city: string | null;
  province: string | null;
  zip: string | null;
  country: string | null;
}

export interface OrderCustomAttribute {
  key: string;
  value: string | null;
}

export interface OrderData {
  id: string;
  name: string; // Order number like "#3903"
  createdAt: string;
  displayFulfillmentStatus: string;
  displayFinancialStatus: string;
  customer: {
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    email: string | null;
  } | null;
  shippingAddress: OrderAddress | null;
  lineItems: OrderLineItem[];
  customAttributes: OrderCustomAttribute[];
  note: string | null;
  totalPriceSet: {
    shopMoney: {
      amount: string;
      currencyCode: string;
    };
  };
}

const ORDER_BY_NUMBER_QUERY = `
  query getOrderByNumber($query: String!) {
    orders(first: 1, query: $query) {
      edges {
        node {
          id
          name
          createdAt
          displayFulfillmentStatus
          displayFinancialStatus
          customer {
            firstName
            lastName
            phone
            email
          }
          shippingAddress {
            address1
            address2
            city
            province
            zip
            country
          }
          lineItems(first: 50) {
            edges {
              node {
                title
                variantTitle
                quantity
                sku
              }
            }
          }
          customAttributes {
            key
            value
          }
          note
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

/**
 * Fetch order by order number (e.g., 3903)
 */
export async function getOrderByNumber(orderNumber: number): Promise<OrderData | null> {
  const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || process.env.SHOPIFY_ADMIN_API_TOKEN;
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
          query: ORDER_BY_NUMBER_QUERY,
          variables: { query: `name:#${orderNumber}` },
        }),
      }
    );

    const data = await response.json();

    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      throw new Error(data.errors[0]?.message || 'GraphQL query failed');
    }

    const orderEdge = data.data?.orders?.edges?.[0];
    if (!orderEdge) {
      return null;
    }

    const order = orderEdge.node;

    // Transform line items from edges format
    const lineItems: OrderLineItem[] = order.lineItems.edges.map(
      (edge: { node: OrderLineItem }) => edge.node
    );

    return {
      ...order,
      lineItems,
    };
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
}

/**
 * Parse delivery date and time from custom attributes, address fields, or notes
 */
export function parseDeliveryInfo(
  customAttributes: OrderCustomAttribute[],
  shippingAddress?: OrderAddress | null,
  note?: string | null
): {
  deliveryDate: string | null;
  deliveryTime: string | null;
  deliveryType: 'house' | 'boat' | 'unknown';
} {
  let deliveryDate: string | null = null;
  let deliveryTime: string | null = null;
  let deliveryType: 'house' | 'boat' | 'unknown' = 'unknown';

  // First check custom attributes
  for (const attr of customAttributes) {
    const key = attr.key.toLowerCase();
    const value = attr.value;

    if (key.includes('delivery') && key.includes('date')) {
      deliveryDate = value;
    }
    if (key.includes('delivery') && key.includes('time')) {
      deliveryTime = value;
    }
    if (key.includes('delivery') && key.includes('type')) {
      if (value?.toLowerCase().includes('boat')) {
        deliveryType = 'boat';
      } else if (value?.toLowerCase().includes('house')) {
        deliveryType = 'house';
      }
    }
    // Check for boat-specific attributes
    if (key.includes('boat') || key.includes('marina') || key.includes('slip')) {
      deliveryType = 'boat';
    }
  }

  // Check address2 field for date/time (common pattern: "12/10/25 - 5:30pm")
  if (shippingAddress?.address2) {
    const addr2 = shippingAddress.address2;
    // Pattern: MM/DD/YY - H:MMam/pm or similar
    const dateTimeMatch = addr2.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})\s*[-–]\s*(\d{1,2}:\d{2}\s*(?:am|pm)?)/i);
    if (dateTimeMatch) {
      if (!deliveryDate) deliveryDate = dateTimeMatch[1];
      if (!deliveryTime) deliveryTime = dateTimeMatch[2];
    }
  }

  // Check note field for date/time patterns
  if (note && (!deliveryDate || !deliveryTime)) {
    // Pattern 1: "MM/DD/YY - H:MMam/pm" or "MM/DD/YYYY - H:MMam/pm"
    const dateTimeMatch = note.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})\s*[-–@]\s*(\d{1,2}:\d{2}\s*(?:am|pm)?)/i);
    if (dateTimeMatch) {
      if (!deliveryDate) deliveryDate = dateTimeMatch[1];
      if (!deliveryTime) deliveryTime = dateTimeMatch[2];
    }

    // Pattern 2: Separate date and time on different lines or with labels
    if (!deliveryDate) {
      // Look for date patterns: MM/DD/YY, MM/DD/YYYY, MM-DD-YY, etc.
      const dateMatch = note.match(/(?:date|deliver(?:y|ed)?|drop.?off)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
      if (dateMatch) {
        deliveryDate = dateMatch[1];
      } else {
        // Try standalone numeric date pattern
        const standaloneDateMatch = note.match(/\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/);
        if (standaloneDateMatch) {
          deliveryDate = standaloneDateMatch[1];
        }
      }
    }

    // Pattern 3: Text month format like "Dec 13", "December 13", "Dec 13th", etc.
    if (!deliveryDate) {
      const monthNames: Record<string, string> = {
        'jan': '1', 'january': '1',
        'feb': '2', 'february': '2',
        'mar': '3', 'march': '3',
        'apr': '4', 'april': '4',
        'may': '5',
        'jun': '6', 'june': '6',
        'jul': '7', 'july': '7',
        'aug': '8', 'august': '8',
        'sep': '9', 'sept': '9', 'september': '9',
        'oct': '10', 'october': '10',
        'nov': '11', 'november': '11',
        'dec': '12', 'december': '12',
      };
      // Match patterns like "Dec 13", "December 13th", "dec. 13"
      const textDateMatch = note.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[.\s]*(\d{1,2})(?:st|nd|rd|th)?\b/i);
      if (textDateMatch) {
        const monthKey = textDateMatch[1].toLowerCase();
        const month = monthNames[monthKey];
        const day = textDateMatch[2];
        // Assume current year or next year based on whether the date has passed
        const now = new Date();
        const currentYear = now.getFullYear();
        const testDate = new Date(currentYear, parseInt(month) - 1, parseInt(day));
        const year = testDate < now ? currentYear + 1 : currentYear;
        deliveryDate = `${month}/${day}/${year.toString().slice(-2)}`;
      }
    }

    if (!deliveryTime) {
      // Look for time patterns: H:MMam/pm, HH:MM am/pm
      const timeMatch = note.match(/(?:time|at|@)[:\s]*(\d{1,2}:\d{2}\s*(?:am|pm)?)/i);
      if (timeMatch) {
        deliveryTime = timeMatch[1];
      } else {
        // Try standalone time pattern
        const standaloneTimeMatch = note.match(/\b(\d{1,2}:\d{2}\s*(?:am|pm))\b/i);
        if (standaloneTimeMatch) {
          deliveryTime = standaloneTimeMatch[1];
        }
      }
    }

    // Check note for boat keywords
    const noteLower = note.toLowerCase();
    if (noteLower.includes('boat') || noteLower.includes('marina') ||
        noteLower.includes('slip') || noteLower.includes('dock') ||
        noteLower.includes('lake travis')) {
      deliveryType = 'boat';
    }
  }

  // Check for boat keywords in address
  if (shippingAddress) {
    const fullAddress = [
      shippingAddress.address1,
      shippingAddress.address2,
    ].join(' ').toLowerCase();

    if (fullAddress.includes('marina') || fullAddress.includes('boat') ||
        fullAddress.includes('slip') || fullAddress.includes('dock') ||
        fullAddress.includes('lake travis')) {
      deliveryType = 'boat';
    }
  }

  // Default to house delivery if not specified
  if (deliveryType === 'unknown') {
    deliveryType = 'house';
  }

  return { deliveryDate, deliveryTime, deliveryType };
}

/**
 * Format package size from variant title, product title, or SKU
 */
export function formatPackageSize(
  variantTitle: string | null,
  sku: string | null,
  productTitle?: string
): string {
  // First try variant title
  if (variantTitle && variantTitle !== 'Default Title') {
    return variantTitle;
  }

  // Try to extract from product title (e.g., "Austin Eastciders Variety • 12 Pack 12oz Can")
  if (productTitle) {
    // Look for pattern after bullet point
    const bulletMatch = productTitle.match(/[•·]\s*(.+)$/);
    if (bulletMatch) {
      return bulletMatch[1].trim();
    }

    // Look for common size patterns
    const sizePatterns = [
      /(\d+)\s*Pack\s*(\d+(?:\.\d+)?)\s*(oz|ml|L|fl\s*oz)/i,
      /(\d+(?:\.\d+)?)\s*(ml|L)\s*Bottle/i,
      /(\d+(?:\.\d+)?)\s*(oz|ml|L|fl\s*oz)/i,
      /(\d+)\s*Pack/i,
      /(\d+)\s*pcs/i,
      /(\d+)\s*lbs?/i,
    ];

    for (const pattern of sizePatterns) {
      const match = productTitle.match(pattern);
      if (match) {
        return match[0];
      }
    }
  }

  // Try SKU
  if (sku) {
    const sizeMatch = sku.match(/(\d+(?:\.\d+)?)\s*(ml|l|oz|pack)/i);
    if (sizeMatch) {
      return `${sizeMatch[1]} ${sizeMatch[2]}`;
    }
  }

  return '-';
}

/**
 * Order sheet color configuration
 */
export interface OrderSheetColor {
  bgClass: string;
  bgHex: string;
  label: string;
}

/**
 * Parse day of week from date string (MM/DD/YY or MM/DD/YYYY format)
 */
function getDayOfWeek(dateStr: string | null): string | null {
  if (!dateStr) return null;

  try {
    // Parse MM/DD/YY or MM/DD/YYYY format
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;

    let year = parseInt(parts[2], 10);
    // Handle 2-digit year
    if (year < 100) {
      year += year > 50 ? 1900 : 2000;
    }

    const month = parseInt(parts[0], 10) - 1; // JS months are 0-indexed
    const day = parseInt(parts[1], 10);

    const date = new Date(year, month, day);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  } catch {
    return null;
  }
}

/**
 * Check if time is before noon (12pm)
 */
function isBeforeNoon(timeStr: string | null): boolean {
  if (!timeStr) return true; // Default to morning if no time

  const normalized = timeStr.toLowerCase().trim();

  // Any PM time is NOT before noon (12pm onwards)
  if (normalized.includes('pm')) {
    return false;
  }

  // AM or no indicator - assume before noon
  return true;
}

/**
 * Determine the order sheet highlight color based on delivery info
 *
 * Rules:
 * - 13993 FM 2769 + Friday → Tan
 * - 13993 FM 2769 + Saturday before noon → Pink
 * - 13993 FM 2769 + Saturday after noon → Blue
 * - 13993 FM 2769 + Sun-Thu → Yellow (default)
 * - Other boat/marina addresses → Blue
 * - House delivery (default) → Yellow
 */
export function getOrderSheetColor(
  address: string | null,
  deliveryDate: string | null,
  deliveryTime: string | null,
  deliveryType: 'house' | 'boat' | 'unknown'
): OrderSheetColor {
  // Check for special marina address (13993 FM 2769)
  if (address?.includes('13993')) {
    const dayOfWeek = getDayOfWeek(deliveryDate);
    const isMorning = isBeforeNoon(deliveryTime);

    if (dayOfWeek === 'Friday') {
      return { bgClass: 'bg-[#D2B48C]', bgHex: '#D2B48C', label: 'tan' };
    }
    if (dayOfWeek === 'Saturday' && isMorning) {
      return { bgClass: 'bg-[#FFB6C1]', bgHex: '#FFB6C1', label: 'pink' };
    }
    if (dayOfWeek === 'Saturday' && !isMorning) {
      return { bgClass: 'bg-[#87CEEB]', bgHex: '#87CEEB', label: 'blue' };
    }
    // Sun-Thu at marina: fall through to default yellow
  }

  // Boat delivery (non-special marina)
  if (deliveryType === 'boat') {
    return { bgClass: 'bg-[#87CEEB]', bgHex: '#87CEEB', label: 'blue' };
  }

  // Default: House delivery - Yellow
  return { bgClass: 'bg-yellow-300', bgHex: '#FCD34D', label: 'yellow' };
}
