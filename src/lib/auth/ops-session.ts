/**
 * Ops Session Management
 * JWT-based auth for /ops and /api/ops routes
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';

export type OpsRole = 'admin' | 'employee';

const OPS_SESSION_COOKIE = 'ops_session';
const TOKEN_EXPIRY = '12h';

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET or NEXTAUTH_SECRET environment variable is required');
  }
  return new TextEncoder().encode(secret);
}

export interface OpsSessionPayload {
  role: OpsRole;
  exp?: number;
  iat?: number;
}

/**
 * Create a JWT session token for ops
 */
export async function createOpsSessionToken(role: OpsRole): Promise<string> {
  return new SignJWT({ role } as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(getJwtSecret());
}

/**
 * Verify an ops session token
 */
export async function verifyOpsSessionToken(
  token: string
): Promise<OpsSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as OpsSessionPayload;
  } catch {
    return null;
  }
}

/**
 * Set the ops session cookie
 */
export async function setOpsSessionCookie(role: OpsRole): Promise<void> {
  const token = await createOpsSessionToken(role);
  const cookieStore = await cookies();

  cookieStore.set(OPS_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 12, // 12 hours
    path: '/',
  });
}

/**
 * Get current ops session from cookie
 */
export async function getOpsSession(): Promise<OpsSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(OPS_SESSION_COOKIE)?.value;

  if (!token) return null;
  return verifyOpsSessionToken(token);
}

/**
 * Clear the ops session cookie
 */
export async function clearOpsSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(OPS_SESSION_COOKIE);
}

/**
 * Require ops auth (any role). Returns session or 401 NextResponse.
 */
export async function requireOpsAuth(): Promise<OpsSessionPayload | NextResponse> {
  const session = await getOpsSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }
  return session;
}

/**
 * Require admin role. Returns session or 401/403 NextResponse.
 */
export async function requireAdminRole(): Promise<OpsSessionPayload | NextResponse> {
  const session = await getOpsSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }
  if (session.role !== 'admin') {
    return NextResponse.json(
      { success: false, error: 'Admin role required' },
      { status: 403 }
    );
  }
  return session;
}
