import { NextRequest, NextResponse } from 'next/server';
import { requireOpsAuth } from '@/lib/auth/ops-session';
import { listConversations, loadConversation } from '@/lib/agent/engine';

export async function GET(request: NextRequest) {
  // Ops-only: this surface can mint payable draft-order invoices and adjust
  // inventory. It renders inside /ops/agent, but the middleware only gates
  // /api/v1/admin/** — every handler outside that prefix carries its own guard.
  const auth = await requireOpsAuth();
  if (auth instanceof NextResponse) return auth;


  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const conversation = await loadConversation(id);
      if (!conversation) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(conversation);
    }

    const conversations = await listConversations();
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Conversations error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load conversations' },
      { status: 500 }
    );
  }
}
