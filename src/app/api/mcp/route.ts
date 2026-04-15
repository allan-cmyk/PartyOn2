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
        {
          status: 401,
          headers: {
            ...CORS_HEADERS,
            'WWW-Authenticate':
              'Bearer realm="mcp", resource_metadata="https://partyondelivery.com/.well-known/oauth-protected-resource"',
          },
        }
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

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request): Promise<Response> {
  return handleMcpRequest(request);
}

// Stateless mode: GET (SSE) and DELETE (session teardown) are unsupported.
// Per MCP Streamable HTTP spec, return 405 so clients fall back to request/response only.
export async function GET(): Promise<Response> {
  return new Response(
    JSON.stringify({ error: 'method_not_allowed', message: 'Server runs in stateless mode; use POST.' }),
    { status: 405, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', Allow: 'POST, OPTIONS' } }
  );
}

export async function DELETE(): Promise<Response> {
  return new Response(
    JSON.stringify({ error: 'method_not_allowed', message: 'Server runs in stateless mode; use POST.' }),
    { status: 405, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', Allow: 'POST, OPTIONS' } }
  );
}
