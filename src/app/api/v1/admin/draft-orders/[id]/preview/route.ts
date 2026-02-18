/**
 * Draft Order Invoice Preview API
 * GET: Returns rendered invoice email HTML for clipboard copying
 * POST: Returns rendered invoice email HTML with custom text overrides (for modal preview)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDraftOrderById } from '@/lib/draft-orders';
import { generateInvoiceEmail, InvoiceTextOverrides } from '@/lib/email/templates/invoice';
import { getInvoiceTextOverrides } from '@/lib/email/template-content';

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function buildPreview(id: string, textOverrides?: InvoiceTextOverrides, personalNote?: string) {
  const draftOrder = await getDraftOrderById(id);
  if (!draftOrder) {
    return NextResponse.json(
      { success: false, error: 'Draft order not found' },
      { status: 404 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://partyondelivery.com';
  const invoiceUrl = `${baseUrl}/invoice/${draftOrder.token}`;

  const savedOverrides = await getInvoiceTextOverrides();
  const mergedOverrides = { ...savedOverrides, ...textOverrides };

  const html = generateInvoiceEmail({
    customerName: draftOrder.customerName,
    deliveryDate: draftOrder.deliveryDate,
    deliveryTime: draftOrder.deliveryTime,
    deliveryAddress: draftOrder.deliveryAddress,
    deliveryCity: draftOrder.deliveryCity,
    deliveryState: draftOrder.deliveryState,
    deliveryZip: draftOrder.deliveryZip,
    items: draftOrder.items,
    subtotal: draftOrder.subtotal,
    taxAmount: draftOrder.taxAmount,
    deliveryFee: draftOrder.deliveryFee,
    discountAmount: draftOrder.discountAmount,
    discountCode: draftOrder.discountCode,
    total: draftOrder.total,
    invoiceUrl,
    personalNote,
  }, mergedOverrides);

  return NextResponse.json({ success: true, html });
}

/**
 * GET /api/v1/admin/draft-orders/[id]/preview
 * Returns rendered invoice email HTML as a string (default template)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    return buildPreview(id);
  } catch (error) {
    console.error('[Draft Order Preview] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate preview' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/admin/draft-orders/[id]/preview
 * Returns rendered invoice email HTML with custom text overrides
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    return buildPreview(id, body.textOverrides, body.personalNote);
  } catch (error) {
    console.error('[Draft Order Preview] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate preview' },
      { status: 500 }
    );
  }
}
