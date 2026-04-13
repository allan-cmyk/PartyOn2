import { z } from 'zod';
import { prisma } from '@/lib/database/client';
import { logMcpRequest } from '../logging';
import type { McpAuth } from '../auth';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerGetOrderSummary(server: McpServer, auth: McpAuth) {
  server.registerTool('get_order_summary', {
    description:
      'Get aggregate order stats: total count, total revenue, average order value, and breakdown by status. Use for quick business health checks or comparing time periods. Defaults to last 30 days if no dates provided.',
    inputSchema: {
      dateFrom: z.string().optional().describe('Start date (ISO format, e.g. 2026-04-01). Defaults to 30 days ago.'),
      dateTo: z.string().optional().describe('End date (ISO format, e.g. 2026-04-13). Defaults to today.'),
    },
  }, async (args) => {
    const start = Date.now();
    try {
      const dateTo = args.dateTo ? new Date(args.dateTo) : new Date();
      const dateFrom = args.dateFrom
        ? new Date(args.dateFrom)
        : new Date(dateTo.getTime() - 30 * 24 * 60 * 60 * 1000);

      const where = {
        createdAt: { gte: dateFrom, lte: dateTo },
      };

      const [aggregate, byStatus] = await Promise.all([
        prisma.order.aggregate({
          where,
          _count: true,
          _sum: { total: true },
          _avg: { total: true },
        }),
        prisma.order.groupBy({
          by: ['status'],
          where,
          _count: true,
          _sum: { total: true },
        }),
      ]);

      const result = {
        dateFrom: dateFrom.toISOString(),
        dateTo: dateTo.toISOString(),
        totalOrders: aggregate._count,
        totalRevenue: Number(aggregate._sum.total ?? 0),
        averageOrderValue: Number(aggregate._avg.total ?? 0),
        byStatus: byStatus.map((s) => ({
          status: s.status,
          count: s._count,
          revenue: Number(s._sum.total ?? 0),
        })),
      };

      logMcpRequest({
        toolName: 'get_order_summary', authLevel: auth.level, actor: auth.actor,
        params: args as object, durationMs: Date.now() - start, success: true,
      });

      return { content: [{ type: 'text' as const, text: JSON.stringify(result) }] };
    } catch (err) {
      logMcpRequest({
        toolName: 'get_order_summary', authLevel: auth.level, actor: auth.actor,
        params: args as object, durationMs: Date.now() - start, success: false,
        errorMsg: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  });
}
