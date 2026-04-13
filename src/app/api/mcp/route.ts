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

  if (request.method === 'POST') {
    // Parse body before creating the patched request (body can only be read once)
    const body = await request.json();

    // Build a new request with the correct Accept header and a fresh body.
    // The MCP SDK checks Accept before looking at parsedBody, so we must
    // set it on the request object itself.
    const headers = new Headers(request.headers);
    headers.set('accept', 'application/json, text/event-stream');

    const patched = new Request(request.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const response = await transport.handleRequest(patched, { parsedBody: body });
    return addCorsHeaders(response);
  }

  // For GET (SSE), patch Accept header
  if (request.method === 'GET') {
    const headers = new Headers(request.headers);
    headers.set('accept', 'text/event-stream');

    const patched = new Request(request.url, {
      method: 'GET',
      headers,
    });

    const response = await transport.handleRequest(patched);
    return addCorsHeaders(response);
  }

  // DELETE
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
