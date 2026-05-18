/**
 * POST /api/admin/recommendations/[id]/execute
 *
 * Run the inline action attached to a rec card.
 *
 *   navigate payloads — log the click, bump status open→approved, return 200.
 *                       The client handles the actual router.push.
 *
 *   apiCall payloads — scaffold only. The dispatcher recognizes each ops
 *                      mutation kind but returns 501 with a clear error
 *                      message. Phase 1C-b will wire each mutation through
 *                      its existing endpoint with proper idempotency tests.
 *
 * See docs/OPERATIONS-DIRECTOR-AGENT-BUILDOUT.md §7 Phase 1C-c.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireOpsAuth } from '@/lib/auth/ops-session';
import { prisma } from '@/lib/database/client';
import {
  findRecommendationLocation,
  isExecutableStatus,
} from '@/lib/recommendations/unified-list';
import { applyStatusUpdate, logAction } from '@/lib/recommendations/mutation-helpers';
import type { ActionPayload } from '@/lib/recommendations/card-types';

export const dynamic = 'force-dynamic';

interface DispatchResult {
  status: number;
  body: Record<string, unknown>;
}

/**
 * Direct-action dispatcher for apiCall payloads. Each `kind` lives in this
 * switch so adding a new ops mutation in Phase 1C-b is one case + one
 * implementation, nothing else. Today all kinds return 501.
 */
function dispatchApiCall(payload: ActionPayload): DispatchResult {
  // TODO(phase 1C-b): wire each kind through its existing endpoint:
  //   - reconcile-pack    → POST /api/ops/orders/[id]/picks reconciliation
  //   - adjust-inventory  → POST /api/v1/inventory (operation=adjust)
  //   - apply-note        → POST /api/v1/inventory/notes/[id]/apply
  //   - apply-receiving   → POST /api/v1/inventory/receiving/[id]/apply
  //   Each must be idempotent and write an InventoryMovement audit row.
  const message =
    'Direct-action buttons coming in a follow-up — for now this rec deep-links you to the page where you can act.';
  return {
    status: 501,
    body: { error: 'not_implemented', kind: payload.kind, message },
  };
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const auth = await requireOpsAuth();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  const location = await findRecommendationLocation(id);
  if (!location) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (!isExecutableStatus(location.status)) {
    return NextResponse.json(
      { error: 'invalid_status', message: `Rec is ${location.status} — cannot execute.` },
      { status: 409 }
    );
  }

  const payload = await loadActionPayload(id, location.domain);
  if (!payload) {
    return NextResponse.json(
      { error: 'no_action', message: 'This rec has no inline action attached.' },
      { status: 400 }
    );
  }

  const label = payload.label ?? payload.kind;

  if (payload.kind === 'navigate') {
    if (location.status === 'open') {
      await applyStatusUpdate(id, location.domain, location.status, { status: 'approved' });
    }
    await logAction(id, location.domain, {
      actionKind: payload.kind,
      actionLabel: label,
      result: 'navigated',
    });
    const href = typeof payload.params.href === 'string' ? payload.params.href : null;
    return NextResponse.json({ ok: true, result: 'navigated', href });
  }

  if (payload.kind === 'apiCall') {
    const dispatch = dispatchApiCall(payload);
    await logAction(id, location.domain, {
      actionKind: payload.kind,
      actionLabel: label,
      result: 'not_implemented',
    });
    return NextResponse.json(dispatch.body, { status: dispatch.status });
  }

  return NextResponse.json(
    { error: 'unknown_action_kind', kind: payload.kind },
    { status: 400 }
  );
}

async function loadActionPayload(
  id: string,
  domain: 'ops' | 'marketing-seo'
): Promise<ActionPayload | null> {
  if (domain === 'ops') {
    const row = await prisma.operationsRecommendation.findUnique({
      where: { id },
      select: { actionPayload: true },
    });
    const raw = row?.actionPayload;
    if (!raw || typeof raw !== 'object') return null;
    return raw as unknown as ActionPayload;
  }
  // Marketing recs are advisory — no inline action in Phase 1C.
  return null;
}
