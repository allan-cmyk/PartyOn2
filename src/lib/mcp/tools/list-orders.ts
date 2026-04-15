import { z } from 'zod';
import { prisma } from '@/lib/database/client';
import { OrderStatus, FulfillmentStatus, Prisma } from '@prisma/client';
import { listEnvelope } from '../envelopes';
import { logMcpRequest } from '../logging';
import type { McpAuth } from '../auth';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 20;

export function registerListOrders(server: McpServer, auth: McpAuth) {
  server.registerTool('list_orders', {
    description:
      'List orders with optional filters. Use deliveryDateFrom/deliveryDateTo for "what\'s being delivered on X" / "parties this weekend" questions; use dateFrom/dateTo for "orders placed on X" questions. Returns summary fields only -- use get_order for full details.',
    inputSchema: {
      status: z.enum([
        'PENDING', 'CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY',
        'DELIVERED', 'CANCELLED', 'REFUNDED',
      ]).optional().describe('Filter by order status'),
      fulfillmentStatus: z.enum([
        'UNFULFILLED', 'PENDING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY',
        'DELIVERED', 'FAILED',
      ]).optional().describe('Filter by fulfillment status'),
      dateFrom: z.string().optional().describe('Filter by order CREATION date start (ISO, e.g. 2026-04-01). For "orders placed on" questions.'),
      dateTo: z.string().optional().describe('Filter by order CREATION date end (ISO). For "orders placed on" questions.'),
      deliveryDateFrom: z.string().optional().describe('Filter by DELIVERY date start (ISO, e.g. 2026-04-17). For "deliveries on Friday" / "parties this weekend" questions. Use this for anything about when an order is delivered, NOT dateFrom.'),
      deliveryDateTo: z.string().optional().describe('Filter by DELIVERY date end (ISO). Pair with deliveryDateFrom.'),
      affiliateId: z.string().optional().describe('Filter by affiliate ID'),
      limit: z.number().optional().describe(`Max results to return (default ${DEFAULT_LIMIT}, max ${MAX_LIMIT})`),
      offset: z.number().optional().describe('Number of results to skip (default 0)'),
    },
  }, async (args) => {
    const start = Date.now();
    try {
      const limit = Math.max(1, Math.min(args.limit ?? DEFAULT_LIMIT, MAX_LIMIT));
      const offset = args.offset ?? 0;

      const where: Prisma.OrderWhereInput = {};
      if (args.status) where.status = args.status as OrderStatus;
      if (args.fulfillmentStatus) where.fulfillmentStatus = args.fulfillmentStatus as FulfillmentStatus;
      if (args.affiliateId) where.affiliateId = args.affiliateId;

      if (args.dateFrom || args.dateTo) {
        where.createdAt = {};
        if (args.dateFrom) where.createdAt.gte = new Date(args.dateFrom);
        if (args.dateTo) where.createdAt.lte = new Date(args.dateTo);
      }

      if (args.deliveryDateFrom || args.deliveryDateTo) {
        where.deliveryDate = {};
        if (args.deliveryDateFrom) where.deliveryDate.gte = new Date(args.deliveryDateFrom);
        if (args.deliveryDateTo) where.deliveryDate.lte = new Date(args.deliveryDateTo);
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: { affiliate: { select: { businessName: true } } },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
        prisma.order.count({ where }),
      ]);

      const items = orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        fulfillmentStatus: o.fulfillmentStatus,
        financialStatus: o.financialStatus,
        createdAt: o.createdAt.toISOString(),
        customerName: o.customerName,
        total: Number(o.total),
        deliveryDate: o.deliveryDate.toISOString(),
        affiliateName: o.affiliate?.businessName ?? null,
      }));

      logMcpRequest({
        toolName: 'list_orders', authLevel: auth.level, actor: auth.actor,
        params: args as object, durationMs: Date.now() - start, success: true, rowCount: items.length,
      });

      return { content: [{ type: 'text' as const, text: JSON.stringify(listEnvelope(items, total, limit, offset)) }] };
    } catch (err) {
      logMcpRequest({
        toolName: 'list_orders', authLevel: auth.level, actor: auth.actor,
        params: args as object, durationMs: Date.now() - start, success: false,
        errorMsg: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  });
}
