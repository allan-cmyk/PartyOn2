import { NextRequest, NextResponse } from 'next/server';
import { requireOpsAuth } from '@/lib/auth/ops-session';
import { runAgent } from '@/lib/agent/engine';

export async function POST(request: NextRequest) {
  // Ops-only: this surface can mint payable draft-order invoices and adjust
  // inventory. It renders inside /ops/agent, but the middleware only gates
  // /api/v1/admin/** — every handler outside that prefix carries its own guard.
  const auth = await requireOpsAuth();
  if (auth instanceof NextResponse) return auth;


  try {
    const body = await request.json();
    const { conversationId, message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const result = await runAgent({
      conversationId: conversationId || undefined,
      userMessage: message,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Agent chat error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Agent error' },
      { status: 500 }
    );
  }
}
