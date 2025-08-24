import { NextResponse } from 'next/server';
import { listWebhooks } from '@/lib/shopify/admin/webhooks';

export async function GET() {
  try {
    const webhooks = await listWebhooks();
    return NextResponse.json({ webhooks });
  } catch (error) {
    console.error('Error listing webhooks:', error);
    return NextResponse.json(
      { error: 'Failed to list webhooks' },
      { status: 500 }
    );
  }
}