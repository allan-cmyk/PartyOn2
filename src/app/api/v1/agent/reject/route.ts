import { NextRequest, NextResponse } from 'next/server';
import { requireOpsAuth } from '@/lib/auth/ops-session';
import { prisma } from '@/lib/database/client';

export async function POST(request: NextRequest) {
  // Ops-only: this surface can mint payable draft-order invoices and adjust
  // inventory. It renders inside /ops/agent, but the middleware only gates
  // /api/v1/admin/** — every handler outside that prefix carries its own guard.
  const auth = await requireOpsAuth();
  if (auth instanceof NextResponse) return auth;


  try {
    const { proposalId, reason } = await request.json();

    if (!proposalId) {
      return NextResponse.json(
        { error: 'proposalId is required' },
        { status: 400 }
      );
    }

    const proposal = await prisma.agentProposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }

    if (proposal.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Proposal already ${proposal.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    await prisma.agentProposal.update({
      where: { id: proposalId },
      data: {
        status: 'REJECTED',
        resultData: reason ? { rejectionReason: reason } : undefined,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Proposal reject error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Rejection failed' },
      { status: 500 }
    );
  }
}
