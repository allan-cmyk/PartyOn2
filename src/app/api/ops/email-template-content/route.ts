import { NextRequest, NextResponse } from 'next/server';
import { requireOpsAuth } from '@/lib/auth/ops-session';
import { getInvoiceTextOverrides, saveInvoiceTextOverrides } from '@/lib/email/template-content';
import { INVOICE_TEXT_DEFAULTS, type InvoiceTextOverrides } from '@/lib/email/templates/invoice';

export async function GET(request: NextRequest) {
  const auth = await requireOpsAuth();
  if (auth instanceof NextResponse) return auth;

  const type = request.nextUrl.searchParams.get('type');

  if (type !== 'invoice') {
    return NextResponse.json({ error: 'Only invoice type is supported' }, { status: 400 });
  }

  try {
    const overrides = await getInvoiceTextOverrides();
    return NextResponse.json({ defaults: INVOICE_TEXT_DEFAULTS, overrides });
  } catch (error) {
    console.error('[Email Template Content GET] Error:', error);
    return NextResponse.json({ error: 'Failed to load template content' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireOpsAuth();
    if (auth instanceof NextResponse) return auth;

    const { type, content } = await request.json();

    if (type !== 'invoice') {
      return NextResponse.json({ error: 'Only invoice type is supported' }, { status: 400 });
    }

    await saveInvoiceTextOverrides(content as InvoiceTextOverrides);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Email Template Content PUT] Error:', error);
    return NextResponse.json({ error: 'Failed to save template content' }, { status: 500 });
  }
}
