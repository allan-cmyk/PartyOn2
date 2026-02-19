/**
 * Affiliate Session Management
 * JWT-based magic link auth for the partner dashboard
 */

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const AFFILIATE_SESSION_COOKIE = 'affiliate_session';
const TOKEN_EXPIRY = '7d';

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET or NEXTAUTH_SECRET environment variable is required');
  }
  return new TextEncoder().encode(secret);
}

export interface AffiliateSessionPayload {
  affiliateId: string;
  email: string;
  code: string;
  exp?: number;
  iat?: number;
}

/**
 * Create a JWT session token for an affiliate
 */
export async function createAffiliateSessionToken(payload: {
  affiliateId: string;
  email: string;
  code: string;
}): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(getJwtSecret());
}

/**
 * Verify an affiliate session token
 */
export async function verifyAffiliateSessionToken(
  token: string
): Promise<AffiliateSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as AffiliateSessionPayload;
  } catch {
    return null;
  }
}

/**
 * Set the affiliate session cookie
 */
export async function setAffiliateSessionCookie(data: {
  affiliateId: string;
  email: string;
  code: string;
}): Promise<void> {
  const token = await createAffiliateSessionToken(data);
  const cookieStore = await cookies();

  cookieStore.set(AFFILIATE_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Clear the affiliate session cookie
 */
export async function clearAffiliateSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AFFILIATE_SESSION_COOKIE);
}

/**
 * Get current affiliate session from cookie
 */
export async function getAffiliateSession(): Promise<AffiliateSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AFFILIATE_SESSION_COOKIE)?.value;

  if (!token) return null;
  return verifyAffiliateSessionToken(token);
}

/**
 * Require affiliate auth -- throws if not logged in
 */
export async function requireAffiliateAuth(): Promise<AffiliateSessionPayload> {
  const session = await getAffiliateSession();
  if (!session) {
    throw new Error('Affiliate authentication required');
  }
  return session;
}
