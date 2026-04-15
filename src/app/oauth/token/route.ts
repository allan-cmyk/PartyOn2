import crypto from 'node:crypto';
import { kv } from '@/lib/database/client';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface StoredCode {
  code_challenge: string;
  client_id: string | null;
  redirect_uri: string;
}

function jsonErr(code: string, description: string, status = 400) {
  return Response.json({ error: code, error_description: description }, { status, headers: CORS });
}

export async function POST(request: Request) {
  const form = await request.formData();
  const grant_type = String(form.get('grant_type') ?? '');
  const code = String(form.get('code') ?? '');
  const code_verifier = String(form.get('code_verifier') ?? '');

  if (grant_type !== 'authorization_code') {
    return jsonErr('unsupported_grant_type', 'Only authorization_code supported');
  }
  if (!code || !code_verifier) {
    return jsonErr('invalid_request', 'code and code_verifier required');
  }

  const stored = (await kv.get(`oauth:code:${code}`)) as StoredCode | null;
  if (!stored) {
    return jsonErr('invalid_grant', 'Code expired or invalid');
  }

  const hash = crypto.createHash('sha256').update(code_verifier).digest('base64url');
  if (hash !== stored.code_challenge) {
    return jsonErr('invalid_grant', 'PKCE verification failed');
  }

  // Invalidate the code (best-effort — relies on TTL as fallback)
  try {
    await kv.set(`oauth:code:${code}`, null, { ex: 1 });
  } catch {
    // ignore
  }

  const access_token = process.env.MCP_AUTH_TOKEN_READ;
  if (!access_token) {
    return jsonErr('server_error', 'Server token not configured', 500);
  }

  return Response.json(
    {
      access_token,
      token_type: 'Bearer',
      expires_in: 31536000,
      scope: 'mcp',
    },
    { headers: CORS }
  );
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}
