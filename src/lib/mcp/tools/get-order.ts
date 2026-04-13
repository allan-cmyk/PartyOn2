import { z } from 'zod';
import { prisma } from '@/lib/database/client';
import { detailEnvelope, errorEnvelope } from '../envelopes';
import { logMcpRequest } from '../logging';
import type { McpAuth } from '../auth';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerGetOrder(server: McpServer, auth: McpAuth) {
  server.registerTool('get_order', {
    description:
      'Get full details for a single order including line items, customer info, delivery details, and affiliate attribution. Use when you need the complete picture of a specific order. Pass either id (UUID) or orderNumber (integer), not both.',
    inputSchema: {
      id: z.string().optional().describe('Order UUID'),
      orderNumber: z.number().optional().describe('Order number (integer, e.g. 109)'),
    },
  }, async (args) => {
    const start = Date.now();
    try {
      if (!args.id && args.orderNumber === undefined) {
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify(errorEnvelope(
              'missing_identifier',
              'Provide either id or orderNumber.',
              'Use list_orders or search_orders to find the order first.'
            )),
          }],
          isError: true,
        };
      }

      const where = args.id
        ? { id: args.id }
        : { orderNumber: args.orderNumber! };

      const order = await prisma.order.findUnique({
        where,
        include: {
          customer: {
            select: {
              id: true, email: true, firstName: true, lastName: true, phone: true,
            },
          },
          items: {
            include: {
              product: { select: { id: true, title: true, handle: true } },
              variant: { select: { id: true, title: true, sku: true } },
            },
          },
          affiliate: {
            select: { id: true, code: true, businessName: true, contactName: true },
          },
          amendments: { orderBy: { createdAt: 'desc' } },
          refunds: { select: { amount: true, reason: true, createdAt: true } },
          groupOrderV2: {
            select: { id: true, name: true, shareCode: true, hostName: true },
          },
        },
      });

      if (!order) {
        logMcpRequest({
          toolName: 'get_order', authLevel: auth.level, actor: auth.actor,
          params: args as object, durationMs: Date.now() - start, success: true, rowCount: 0,
        });
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify(errorEnvelope(
              'not_found',
              `Order ${args.id || '#' + args.orderNumber} not found.`,
              'Use search_orders to find orders by customer name or email.'
            )),
          }],
          isError: true,
        };
      }

      const result = {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        fulfillmentStatus: order.fulfillmentStatus,
        financialStatus: order.financialStatus,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        customer: order.customer,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        pricing: {
          subtotal: Number(order.subtotal),
          discountCode: order.discountCode,
          discountAmount: Number(order.discountAmount),
          taxAmount: Number(order.taxAmount),
          deliveryFee: Number(order.deliveryFee),
          tipAmount: Number(order.tipAmount),
          total: Number(order.total),
        },
        delivery: {
          date: order.deliveryDate.toISOString(),
          time: order.deliveryTime,
          address: order.deliveryAddress,
          phone: order.deliveryPhone,
          instructions: order.deliveryInstructions,
          type: order.deliveryType,
        },
        items: order.items.map((item) => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          price: Number(item.price),
          totalPrice: Number(item.totalPrice),
          refundedQuantity: item.refundedQuantity,
          product: item.product ? {
            id: item.product.id,
            title: item.product.title,
            handle: item.product.handle,
          } : null,
          variant: item.variant ? {
            id: item.variant.id,
            title: item.variant.title,
            sku: item.variant.sku,
          } : null,
        })),
        affiliate: order.affiliate ?? null,
        groupOrderV2: order.groupOrderV2 ?? null,
        refunds: order.refunds.map((r) => ({
          amount: Number(r.amount),
          reason: r.reason,
          createdAt: r.createdAt.toISOString(),
        })),
        amendments: order.amendments.map((a) => ({
          id: a.id,
          type: a.type,
          notes: a.notes,
          previousTotal: Number(a.previousTotal),
          newTotal: Number(a.newTotal),
          createdAt: a.createdAt.toISOString(),
        })),
        internalNote: order.internalNote,
        customerNote: order.customerNote,
        cancelledAt: order.cancelledAt?.toISOString() ?? null,
        cancelReason: order.cancelReason,
      };

      logMcpRequest({
        toolName: 'get_order', authLevel: auth.level, actor: auth.actor,
        params: args as object, durationMs: Date.now() - start, success: true, rowCount: 1,
      });

      return { content: [{ type: 'text' as const, text: JSON.stringify(detailEnvelope(result)) }] };
    } catch (err) {
      logMcpRequest({
        toolName: 'get_order', authLevel: auth.level, actor: auth.actor,
        params: args as object, durationMs: Date.now() - start, success: false,
        errorMsg: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  });
}
