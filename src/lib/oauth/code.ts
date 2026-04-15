import crypto from 'node:crypto';

// Stateless OAuth authorization code: HMAC-signed JSON blob.
// Avoids needing a server-side store (KV, DB) for the 10-min code lifetime.
// Replay is mitigated by PKCE: an attacker with the code but not the verifier
// cannot redeem it.

interface CodePayload {
  code_challenge: string;
  client_id: string | null;
  redirect_uri: string;
  exp: number; // ms since epoch
}

function getSigningKey(): string {
  const key = process.env.MCP_AUTH_TOKEN_READ;
  if (!key) throw new Error('MCP_AUTH_TOKEN_READ not set — cannot sign OAuth codes');
  return key;
}

function b64url(buf: Buffer | string): string {
  const input = typeof buf === 'string' ? Buffer.from(buf) : buf;
  return input.toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function b64urlDecode(s: string): Buffer {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64');
}

export function signCode(payload: Omit<CodePayload, 'exp'> & { ttlMs?: number }): string {
  const exp = Date.now() + (payload.ttlMs ?? 10 * 60 * 1000);
  const body: CodePayload = {
    code_challenge: payload.code_challenge,
    client_id: payload.client_id,
    redirect_uri: payload.redirect_uri,
    exp,
  };
  const json = JSON.stringify(body);
  const payloadB64 = b64url(json);
  const sig = crypto.createHmac('sha256', getSigningKey()).update(payloadB64).digest();
  return `${payloadB64}.${b64url(sig)}`;
}

export function verifyCode(code: string): CodePayload | null {
  const parts = code.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, sigB64] = parts;

  const expectedSig = crypto.createHmac('sha256', getSigningKey()).update(payloadB64).digest();
  let providedSig: Buffer;
  try {
    providedSig = b64urlDecode(sigB64);
  } catch {
    return null;
  }
  if (providedSig.length !== expectedSig.length) return null;
  if (!crypto.timingSafeEqual(providedSig, expectedSig)) return null;

  let payload: CodePayload;
  try {
    payload = JSON.parse(b64urlDecode(payloadB64).toString('utf8')) as CodePayload;
  } catch {
    return null;
  }
  if (typeof payload.exp !== 'number' || payload.exp < Date.now()) return null;
  return payload;
}
