/**
 * Visitor cookie helpers.
 *
 * We store a single `pod_vsid` cookie on every browser. Value is a random
 * uuid that maps 1:1 to a VisitorSession row. Cookie is intentionally
 * readable by JS so the client-side pixel can:
 *
 *   - send it on every page-view beacon
 *   - read it before /api/v1/landing/lead-event so the server doesn't have
 *     to mint a new one
 *
 * Lifespan: 1 year. Rotates on cookie clear (new session row, no link).
 */
import { randomUUID } from 'node:crypto';
import type { NextRequest } from 'next/server';

export const COOKIE_NAME = 'pod_vsid';

export function ensureVisitorCookie(req: NextRequest): {
  cookieId: string;
  isNew: boolean;
} {
  const existing = req.cookies.get(COOKIE_NAME)?.value;
  if (existing && existing.length >= 8) {
    return { cookieId: existing, isNew: false };
  }
  return { cookieId: randomUUID(), isNew: true };
}
