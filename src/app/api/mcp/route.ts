import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createMcpServer } from '@/lib/mcp/server';
import { authenticateMcpRequest } from '@/lib/mcp/auth';
import { checkMcpRateLimit } from '@/lib/mcp/rate-limit';

export const maxDuration = 60;

export async function POST(request: Request): Promise<Response> {
  // 1. Auth
  const auth = authenticateMcpRequest(request);
  if (!auth) {
    return Response.json(
      { error: 'unauthorized', message: 'Missing or invalid Bearer token.' },
      { status: 401 }
    );
  }

  // 2. Rate limit
  const rl = await checkMcpRateLimit(auth.level);
  if (!rl.allowed) {
    return Response.json(
      {
        error: 'rate_limited',
        message: 'Too many requests. Try again in a minute.',
        remaining: rl.remaining,
      },
      { status: 429 }
    );
  }

  // 3. Create stateless server + transport per request
  const server = createMcpServer(auth);
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless mode for Vercel serverless
  });

  await server.connect(transport);

  // 4. Handle the request
  // Parse body first in case Next.js has already consumed the stream
  const body = await request.json();
  const response = await transport.handleRequest(request, { parsedBody: body });

  return response;
}

export async function GET(): Promise<Response> {
  return Response.json(
    { error: 'method_not_allowed', message: 'This MCP server runs in stateless mode. Use POST.' },
    { status: 405 }
  );
}

export async function DELETE(): Promise<Response> {
  return Response.json(
    { error: 'method_not_allowed', message: 'This MCP server runs in stateless mode. Session termination not needed.' },
    { status: 405 }
  );
}
