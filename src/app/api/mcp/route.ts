import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createMcpServer } from '@/lib/mcp/server';
import { authenticateMcpRequest } from '@/lib/mcp/auth';
import { checkMcpRateLimit } from '@/lib/mcp/rate-limit';

export const maxDuration = 60;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-MCP-Actor',
};

function addCorsHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function authOrReject(request: Request) {
  const auth = authenticateMcpRequest(request);
  if (!auth) {
    return {
      auth: null,
      response: Response.json(
        { error: 'unauthorized', message: 'Missing or invalid Bearer token.' },
        { status: 401, headers: CORS_HEADERS }
      ),
    };
  }
  return { auth, response: null };
}

async function handleMcpRequest(request: Request): Promise<Response> {
  const { auth, response: authError } = authOrReject(request);
  if (!auth) return authError!;

  const rl = await checkMcpRateLimit(auth.level);
  if (!rl.allowed) {
    return Response.json(
      { error: 'rate_limited', message: 'Too many requests. Try again in a minute.', remaining: rl.remaining },
      { status: 429, headers: CORS_HEADERS }
    );
  }

  const server = createMcpServer(auth);
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  await server.connect(transport);

  // For POST, parse body first in case Next.js has already consumed the stream
  if (request.method === 'POST') {
    const body = await request.json();
    const response = await transport.handleRequest(request, { parsedBody: body });
    return addCorsHeaders(response);
  }

  // For GET (SSE) and DELETE, pass through directly
  const response = await transport.handleRequest(request);
  return addCorsHeaders(response);
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request): Promise<Response> {
  return handleMcpRequest(request);
}

export async function GET(request: Request): Promise<Response> {
  return handleMcpRequest(request);
}

export async function DELETE(request: Request): Promise<Response> {
  return handleMcpRequest(request);
}
