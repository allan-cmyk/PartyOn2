import crypto from 'node:crypto';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

interface DcrRequest {
  redirect_uris?: string[];
  client_name?: string;
  token_endpoint_auth_method?: string;
  grant_types?: string[];
  response_types?: string[];
  scope?: string;
}

export async function POST(request: Request) {
  let body: DcrRequest = {};
  try {
    body = (await request.json()) as DcrRequest;
  } catch {
    // no-op
  }

  const client_id = crypto.randomUUID();
  const client_secret = crypto.randomBytes(32).toString('hex');

  return Response.json(
    {
      client_id,
      client_secret,
      client_id_issued_at: Math.floor(Date.now() / 1000),
      redirect_uris: body.redirect_uris ?? [],
      grant_types: body.grant_types ?? ['authorization_code'],
      response_types: body.response_types ?? ['code'],
      token_endpoint_auth_method: body.token_endpoint_auth_method ?? 'none',
      client_name: body.client_name ?? 'Unknown',
      scope: body.scope ?? 'mcp',
    },
    { status: 201, headers: CORS }
  );
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}
