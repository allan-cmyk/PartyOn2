import { NextRequest, NextResponse } from 'next/server';
import { runAgent } from '@/lib/agent/engine';

export async function POST(request: NextRequest) {
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
