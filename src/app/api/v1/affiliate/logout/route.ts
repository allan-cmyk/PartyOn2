/**
 * POST /api/v1/affiliate/logout
 * Clear affiliate session cookie
 */

import { NextResponse } from 'next/server';
import { clearAffiliateSessionCookie } from '@/lib/affiliates/affiliate-session';

export async function POST(): Promise<NextResponse> {
  await clearAffiliateSessionCookie();
  return NextResponse.json({ success: true });
}
