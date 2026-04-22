import { NextRequest, NextResponse } from 'next/server';
import { applyInvoice } from '@/lib/inventory/receiving/service';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  try {
    const result = await applyInvoice(id);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to apply invoice';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
