import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

export async function POST(request: NextRequest) {
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
