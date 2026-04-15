import crypto from 'node:crypto';
import { verifyCode } from '@/lib/oauth/code';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

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

  const payload = verifyCode(code);
  if (!payload) {
    return jsonErr('invalid_grant', 'Code expired or signature invalid');
  }

  const hash = crypto.createHash('sha256').update(code_verifier).digest('base64url');
  if (hash !== payload.code_challenge) {
    return jsonErr('invalid_grant', 'PKCE verification failed');
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
