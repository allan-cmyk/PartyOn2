const BASE = 'https://partyondelivery.com';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function GET() {
  return Response.json(
    {
      resource: `${BASE}/api/mcp`,
      authorization_servers: [BASE],
      bearer_methods_supported: ['header'],
      resource_documentation: `${BASE}/api/mcp`,
    },
    { headers: CORS }
  );
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}
