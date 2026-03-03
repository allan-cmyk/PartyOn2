import { NextResponse } from 'next/server';
import { getOpsSession } from '@/lib/auth/ops-session';

/**
 * GET /api/ops/session
 * Check if the ops_session cookie is still valid.
 * Used by admin/ops layouts to restore auth after browser restart.
 */
export async function GET() {
  const session = await getOpsSession();
  if (session) {
    return NextResponse.json({ authenticated: true, role: session.role });
  }
  return NextResponse.json({ authenticated: false });
}
