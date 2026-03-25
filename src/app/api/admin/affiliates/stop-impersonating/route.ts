/**
 * POST /api/admin/affiliates/stop-impersonating
 * Clears the affiliate session and impersonation cookies, returning admin to their context.
 */

import { NextResponse } from 'next/server';
import { clearAffiliateSessionCookie } from '@/lib/affiliates/affiliate-session';
import { cookies } from 'next/headers';

export async function POST(): Promise<NextResponse> {
  await clearAffiliateSessionCookie();

  const cookieStore = await cookies();
  cookieStore.delete('admin_impersonating');

  return NextResponse.json({ success: true });
}
