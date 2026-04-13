import { z } from 'zod';
import { prisma } from '@/lib/database/client';
import { Prisma } from '@prisma/client';
import { listEnvelope } from '../envelopes';
import { logMcpRequest } from '../logging';
import type { McpAuth } from '../auth';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const MAX_LIMIT = 25;
const DEFAULT_LIMIT = 10;

export function registerSearchOrders(server: McpServer, auth: McpAuth) {
  server.registerTool('search_orders', {
    description:
      'Search orders by customer name, email, or phone number. Use when someone asks about a specific customer\'s order and you don\'t have the order ID. Returns summary fields only -- use get_order for full details on a specific result.',
    inputSchema: {
      query: z.string().describe('Search term -- matches against customer name, email, phone, or order number'),
      limit: z.number().optional().describe(`Max results (default ${DEFAULT_LIMIT}, max ${MAX_LIMIT})`),
    },
  }, async (args) => {
    const start = Date.now();
    try {
      const limit = Math.max(1, Math.min(args.limit ?? DEFAULT_LIMIT, MAX_LIMIT));
      const query = args.query.trim();

      if (!query) {
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({ error: 'empty_query', message: 'Search query cannot be empty.' }),
          }],
          isError: true,
        };
      }

      const searchNum = parseInt(query);
      const orConditions: Prisma.OrderWhereInput[] = [
        { customerName: { contains: query, mode: 'insensitive' } },
        { customerEmail: { contains: query, mode: 'insensitive' } },
      ];

      if (query.match(/^\+?\d[\d\s\-().]+$/)) {
        orConditions.push({ customerPhone: { contains: query, mode: 'insensitive' } });
        orConditions.push({ deliveryPhone: { contains: query, mode: 'insensitive' } });
      }

      if (!isNaN(searchNum) && searchNum > 0) {
        orConditions.push({ orderNumber: searchNum });
      }

      const where: Prisma.OrderWhereInput = { OR: orConditions };

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: { affiliate: { select: { businessName: true } } },
          orderBy: { createdAt: 'desc' },
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
        toolName: 'search_orders', authLevel: auth.level, actor: auth.actor,
        params: { query: args.query, limit } as object, durationMs: Date.now() - start,
        success: true, rowCount: items.length,
      });

      return { content: [{ type: 'text' as const, text: JSON.stringify(listEnvelope(items, total, limit, 0)) }] };
    } catch (err) {
      logMcpRequest({
        toolName: 'search_orders', authLevel: auth.level, actor: auth.actor,
        params: args as object, durationMs: Date.now() - start, success: false,
        errorMsg: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  });
}
