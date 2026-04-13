import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpAuth } from './auth';
import { registerListOrders } from './tools/list-orders';
import { registerGetOrder } from './tools/get-order';
import { registerGetOrderSummary } from './tools/get-order-summary';
import { registerSearchOrders } from './tools/search-orders';

export function createMcpServer(auth: McpAuth): McpServer {
  const server = new McpServer({
    name: 'party-on-delivery',
    version: '1.0.0',
  });

  registerListOrders(server, auth);
  registerGetOrder(server, auth);
  registerGetOrderSummary(server, auth);
  registerSearchOrders(server, auth);

  return server;
}
