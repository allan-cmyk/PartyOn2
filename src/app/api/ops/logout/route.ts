/**
 * POST /api/ops/logout
 * Clear the httpOnly ops session cookie
 */

import { NextResponse } from 'next/server';
import { clearOpsSessionCookie } from '@/lib/auth/ops-session';

export async function POST(): Promise<NextResponse> {
  await clearOpsSessionCookie();
  return NextResponse.json({ success: true });
}
