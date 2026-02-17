/**
 * POST /api/v2/group-orders - Create a new group order
 */

import { NextRequest, NextResponse } from 'next/server';
import { CreateGroupOrderV2Schema } from '@/lib/group-orders-v2/validation';
import { createGroupOrder } from '@/lib/group-orders-v2/service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CreateGroupOrderV2Schema.safeParse(body);
    if (!parsed.success) {
      // Extract human-readable error messages from Zod issues
      const messages = parsed.error.issues.map((issue) => {
        // For nested paths like ['tabs', 0, 'deliveryDate'], just use the message
        return issue.message;
      });
      const uniqueMessages = [...new Set(messages)];
      return NextResponse.json(
        { success: false, error: uniqueMessages.join('. '), details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const group = await createGroupOrder(parsed.data);

    return NextResponse.json(
      { success: true, data: group },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Group V2] Create error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create group order' },
      { status: 500 }
    );
  }
}
