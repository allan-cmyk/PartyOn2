/**
 * Agent Tool Definitions + Executors
 * Each tool has a JSON schema definition (sent to OpenRouter) and an async executor function.
 */

import { prisma } from '@/lib/database/client';
import { Prisma } from '@prisma/client';
import { searchProducts, getProducts } from '@/lib/inventory/services/product-service';
import { getProductInventory, getLowStockAlerts } from '@/lib/inventory/services/inventory-service';
import { calculateDeliveryFee } from '@/lib/delivery/rates';
import { calculateCartTax } from '@/lib/tax/calculator';
import { calculateDraftOrderAmounts } from '@/lib/draft-orders/service';
import type { OpenRouterToolDefinition } from '@/lib/ai/inventory-client';

// ==========================================
// Tool Definitions (sent to OpenRouter)
// ==========================================

export const AGENT_TOOLS: OpenRouterToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'search_products',
      description: 'Search the product catalog by name, type, or keyword. Returns top results with variants, prices, and images.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query (product name, brand, type, etc.)',
          },
          product_type: {
            type: 'string',
            description: 'Optional product type filter (e.g., "Seltzer", "Light Beer", "Spirit")',
          },
          limit: {
            type: 'number',
            description: 'Max results to return (default 10)',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_inventory',
      description: 'Check stock levels for a specific product across all locations and variants.',
      parameters: {
        type: 'object',
        properties: {
          product_id: {
            type: 'string',
            description: 'The product ID to check inventory for',
          },
        },
        required: ['product_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_low_stock_alerts',
      description: 'List all active low-stock alerts.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'lookup_customer',
      description: 'Search for a customer by email, phone, or name. Returns matches with order count.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Customer email, phone number, or name to search for',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_upcoming_orders',
      description: 'Get draft orders with future delivery dates.',
      parameters: {
        type: 'object',
        properties: {
          days_ahead: {
            type: 'number',
            description: 'How many days ahead to look (default 7)',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculate_delivery_fee',
      description: 'Calculate the delivery fee for a given zip code and order subtotal.',
      parameters: {
        type: 'object',
        properties: {
          zip_code: {
            type: 'string',
            description: '5-digit zip code for delivery address',
          },
          subtotal: {
            type: 'number',
            description: 'Order subtotal in dollars',
          },
          is_express: {
            type: 'boolean',
            description: 'Whether this is express delivery (default false)',
          },
        },
        required: ['zip_code', 'subtotal'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculate_tax',
      description: 'Calculate sales tax for a given subtotal, discount, and zip code.',
      parameters: {
        type: 'object',
        properties: {
          subtotal: {
            type: 'number',
            description: 'Order subtotal in dollars',
          },
          discount_amount: {
            type: 'number',
            description: 'Total discount amount in dollars (default 0)',
          },
          zip_code: {
            type: 'string',
            description: '5-digit zip code',
          },
        },
        required: ['subtotal'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_draft_order_proposal',
      description: 'Build a complete draft order (invoice) proposal for operator approval. Does NOT create the order -- just builds the proposal with accurate totals. Use calculate_delivery_fee and search_products first to get correct values.',
      parameters: {
        type: 'object',
        properties: {
          customer_name: { type: 'string' },
          customer_email: { type: 'string' },
          customer_phone: { type: 'string' },
          delivery_address: { type: 'string' },
          delivery_city: { type: 'string', description: 'Default: Austin' },
          delivery_state: { type: 'string', description: 'Default: TX' },
          delivery_zip: { type: 'string' },
          delivery_date: { type: 'string', description: 'ISO date string (YYYY-MM-DD)' },
          delivery_time: { type: 'string', description: 'e.g., "12:00 PM - 2:00 PM"' },
          delivery_notes: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                product_id: { type: 'string' },
                variant_id: { type: 'string' },
                title: { type: 'string' },
                variant_title: { type: 'string' },
                quantity: { type: 'number' },
                price: { type: 'number' },
                image_url: { type: 'string' },
              },
              required: ['product_id', 'variant_id', 'title', 'quantity', 'price'],
            },
            description: 'Array of line items',
          },
          discount_code: { type: 'string' },
          discount_amount: { type: 'number' },
          admin_notes: { type: 'string' },
        },
        required: ['customer_name', 'customer_email', 'delivery_address', 'delivery_zip', 'delivery_date', 'items'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'adjust_inventory_proposal',
      description: 'Propose inventory adjustments for operator approval. Does NOT execute the adjustment.',
      parameters: {
        type: 'object',
        properties: {
          adjustments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                product_id: { type: 'string' },
                variant_id: { type: 'string' },
                product_title: { type: 'string' },
                variant_title: { type: 'string' },
                quantity_change: { type: 'number', description: 'Positive to add, negative to remove' },
                reason: { type: 'string' },
              },
              required: ['product_id', 'product_title', 'quantity_change', 'reason'],
            },
          },
        },
        required: ['adjustments'],
      },
    },
  },
];

// ==========================================
// Tool Executors
// ==========================================

export interface ToolContext {
  conversationId: string;
}

export type ToolExecutor = (args: Record<string, unknown>, ctx?: ToolContext) => Promise<string>;

async function executeSearchProducts(args: Record<string, unknown>): Promise<string> {
  const query = args.query as string;
  const productType = args.product_type as string | undefined;
  const limit = (args.limit as number) || 10;

  if (productType) {
    const { products } = await getProducts(
      { search: query, productType, status: 'ACTIVE' },
      { pageSize: limit }
    );
    return JSON.stringify(products.map(formatProduct));
  }

  const products = await searchProducts(query, limit);
  return JSON.stringify(products.map(formatProduct));
}

function formatProduct(p: {
  id: string;
  title: string;
  handle: string;
  productType: string | null;
  vendor: string | null;
  basePrice: { toString(): string };
  variants: Array<{
    id: string;
    title: string;
    price: { toString(): string };
    sku: string | null;
    inventoryQuantity: number;
  }>;
  images: Array<{ url: string }>;
}) {
  return {
    id: p.id,
    title: p.title,
    handle: p.handle,
    productType: p.productType,
    vendor: p.vendor,
    basePrice: Number(p.basePrice),
    variants: p.variants.map(v => ({
      id: v.id,
      title: v.title,
      price: Number(v.price),
      sku: v.sku,
      inventoryQuantity: v.inventoryQuantity,
    })),
    imageUrl: p.images[0]?.url || null,
  };
}

async function executeCheckInventory(args: Record<string, unknown>): Promise<string> {
  const productId = args.product_id as string;
  const items = await getProductInventory(productId);

  return JSON.stringify(items.map(item => ({
    locationName: item.location.name,
    variantTitle: item.variant?.title || 'Default',
    sku: item.variant?.sku || null,
    quantity: item.quantity,
    reservedQuantity: item.reservedQuantity,
    available: item.quantity - item.reservedQuantity,
    lowStockThreshold: item.lowStockThreshold,
  })));
}

async function executeGetLowStockAlerts(): Promise<string> {
  const alerts = await getLowStockAlerts();
  return JSON.stringify(alerts);
}

async function executeLookupCustomer(args: Record<string, unknown>): Promise<string> {
  const query = args.query as string;

  const customers = await prisma.customer.findMany({
    where: {
      OR: [
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query } },
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: 5,
  });

  const results = await Promise.all(customers.map(async (c) => {
    const orderCount = await prisma.draftOrder.count({
      where: { customerEmail: c.email },
    });
    return {
      id: c.id,
      email: c.email,
      phone: c.phone,
      firstName: c.firstName,
      lastName: c.lastName,
      orderCount,
    };
  }));

  return JSON.stringify(results);
}

async function executeGetUpcomingOrders(args: Record<string, unknown>): Promise<string> {
  const daysAhead = (args.days_ahead as number) || 7;
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(futureDate.getDate() + daysAhead);

  const orders = await prisma.draftOrder.findMany({
    where: {
      deliveryDate: {
        gte: now,
        lte: futureDate,
      },
      status: { notIn: ['CANCELLED', 'EXPIRED'] },
    },
    orderBy: { deliveryDate: 'asc' },
    take: 20,
  });

  return JSON.stringify(orders.map(o => ({
    id: o.id,
    status: o.status,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    deliveryDate: o.deliveryDate,
    deliveryTime: o.deliveryTime,
    deliveryZip: o.deliveryZip,
    subtotal: Number(o.subtotal),
    total: Number(o.total),
    itemCount: Array.isArray(o.items) ? (o.items as unknown[]).length : 0,
  })));
}

async function executeCalculateDeliveryFee(args: Record<string, unknown>): Promise<string> {
  const zipCode = args.zip_code as string;
  const subtotal = args.subtotal as number;
  const isExpress = (args.is_express as boolean) || false;

  const result = calculateDeliveryFee(zipCode, subtotal, isExpress);
  return JSON.stringify(result);
}

async function executeCalculateTax(args: Record<string, unknown>): Promise<string> {
  const subtotal = args.subtotal as number;
  const discountAmount = (args.discount_amount as number) || 0;
  const zipCode = args.zip_code as string | undefined;

  const result = calculateCartTax({ subtotal, discountAmount, zipCode });
  return JSON.stringify(result);
}

async function executeCreateDraftOrderProposal(args: Record<string, unknown>, ctx?: ToolContext): Promise<string> {
  const items = (args.items as Array<Record<string, unknown>>).map(item => ({
    productId: item.product_id as string,
    variantId: item.variant_id as string,
    title: item.title as string,
    variantTitle: item.variant_title as string | undefined,
    quantity: item.quantity as number,
    price: item.price as number,
    imageUrl: item.image_url as string | undefined,
  }));

  const deliveryZip = args.delivery_zip as string;
  const discountAmount = (args.discount_amount as number) || 0;

  // Calculate delivery fee
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryResult = calculateDeliveryFee(deliveryZip, subtotal);

  // Calculate amounts
  const amounts = calculateDraftOrderAmounts(
    items,
    deliveryZip,
    deliveryResult.fee,
    discountAmount
  );

  // Parse delivery date, normalize to noon UTC
  const dateStr = args.delivery_date as string;
  const deliveryDate = new Date(dateStr + 'T12:00:00Z');

  const proposalData = {
    customerName: args.customer_name as string,
    customerEmail: args.customer_email as string,
    customerPhone: args.customer_phone as string | undefined,
    deliveryAddress: args.delivery_address as string,
    deliveryCity: (args.delivery_city as string) || 'Austin',
    deliveryState: (args.delivery_state as string) || 'TX',
    deliveryZip,
    deliveryDate: deliveryDate.toISOString(),
    deliveryTime: (args.delivery_time as string) || '12:00 PM - 2:00 PM',
    deliveryNotes: args.delivery_notes as string | undefined,
    items,
    ...amounts,
    originalDeliveryFee: deliveryResult.originalFee,
    deliveryZone: deliveryResult.zone,
    freeDeliveryApplied: deliveryResult.discountApplied,
    discountCode: args.discount_code as string | undefined,
    adminNotes: args.admin_notes as string | undefined,
  };

  // Create proposal in DB linked to current conversation
  const proposal = await prisma.agentProposal.create({
    data: {
      conversationId: ctx!.conversationId,
      type: 'DRAFT_ORDER',
      status: 'PENDING',
      data: proposalData as unknown as Prisma.InputJsonValue,
    },
  });

  return JSON.stringify({
    proposalId: proposal.id,
    type: 'DRAFT_ORDER',
    summary: {
      customerName: proposalData.customerName,
      customerEmail: proposalData.customerEmail,
      deliveryDate: proposalData.deliveryDate,
      deliveryAddress: proposalData.deliveryAddress,
      deliveryZone: proposalData.deliveryZone,
      itemCount: items.length,
      subtotal: amounts.subtotal,
      taxAmount: amounts.taxAmount,
      deliveryFee: amounts.deliveryFee,
      discountAmount: amounts.discountAmount,
      total: amounts.total,
      freeDeliveryApplied: proposalData.freeDeliveryApplied,
    },
  });
}

async function executeAdjustInventoryProposal(args: Record<string, unknown>, ctx?: ToolContext): Promise<string> {
  const adjustments = args.adjustments as Array<Record<string, unknown>>;

  const proposalData = {
    adjustments: adjustments.map(adj => ({
      productId: adj.product_id as string,
      variantId: adj.variant_id as string | undefined,
      productTitle: adj.product_title as string,
      variantTitle: adj.variant_title as string | undefined,
      quantityChange: adj.quantity_change as number,
      reason: adj.reason as string,
    })),
  };

  const proposal = await prisma.agentProposal.create({
    data: {
      conversationId: ctx!.conversationId,
      type: 'INVENTORY_ADJUSTMENT',
      status: 'PENDING',
      data: proposalData as unknown as Prisma.InputJsonValue,
    },
  });

  return JSON.stringify({
    proposalId: proposal.id,
    type: 'INVENTORY_ADJUSTMENT',
    summary: {
      adjustmentCount: adjustments.length,
      adjustments: proposalData.adjustments.map(a => ({
        product: a.productTitle,
        variant: a.variantTitle,
        change: a.quantityChange > 0 ? `+${a.quantityChange}` : `${a.quantityChange}`,
        reason: a.reason,
      })),
    },
  });
}

// ==========================================
// Tool Executor Map
// ==========================================

export const TOOL_EXECUTORS: Record<string, ToolExecutor> = {
  search_products: executeSearchProducts,
  check_inventory: executeCheckInventory,
  get_low_stock_alerts: executeGetLowStockAlerts,
  lookup_customer: executeLookupCustomer,
  get_upcoming_orders: executeGetUpcomingOrders,
  calculate_delivery_fee: executeCalculateDeliveryFee,
  calculate_tax: executeCalculateTax,
  create_draft_order_proposal: executeCreateDraftOrderProposal,
  adjust_inventory_proposal: executeAdjustInventoryProposal,
};

/**
 * Execute a tool by name with given arguments
 */
export async function executeTool(name: string, args: Record<string, unknown>, ctx?: ToolContext): Promise<string> {
  const executor = TOOL_EXECUTORS[name];
  if (!executor) {
    return JSON.stringify({ error: `Unknown tool: ${name}` });
  }

  try {
    return await executor(args, ctx);
  } catch (error) {
    console.error(`Tool execution error (${name}):`, error);
    return JSON.stringify({
      error: `Tool ${name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
}
