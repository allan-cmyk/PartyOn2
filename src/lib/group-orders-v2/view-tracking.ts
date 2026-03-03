/**
 * Dashboard View Tracking
 * Tracks unique visitors to dashboard pages using IP-based hashing.
 */

import { prisma } from '@/lib/database/client';
import { createHash } from 'crypto';

/**
 * Track a unique dashboard view by hashed IP.
 * Uses INSERT ON CONFLICT DO NOTHING to only count new visitors.
 * Increments viewCount on GroupOrderV2 only for new views.
 */
export async function trackDashboardView(
  shareCode: string,
  ip: string
): Promise<void> {
  const visitorHash = createHash('sha256')
    .update(ip + shareCode)
    .digest('hex')
    .slice(0, 32);

  // Insert new view row; if already exists, do nothing
  const result = await prisma.$executeRaw`
    INSERT INTO dashboard_views (id, share_code, visitor_hash, viewed_at)
    VALUES (gen_random_uuid(), ${shareCode}, ${visitorHash}, NOW())
    ON CONFLICT (share_code, visitor_hash) DO NOTHING
  `;

  // result = 1 if row was inserted (new visitor), 0 if already existed
  if (result === 1) {
    await prisma.$executeRaw`
      UPDATE group_orders_v2
      SET view_count = view_count + 1
      WHERE share_code = ${shareCode}
    `;
  }
}
