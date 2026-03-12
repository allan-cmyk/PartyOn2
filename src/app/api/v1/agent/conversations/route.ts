import { NextRequest, NextResponse } from 'next/server';
import { listConversations, loadConversation } from '@/lib/agent/engine';

export async function GET(request: NextRequest) {
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
