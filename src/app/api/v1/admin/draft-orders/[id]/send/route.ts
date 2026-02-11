/**
 * Send Draft Order Invoice API
 * POST: Send invoice email to customer
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getDraftOrderById, updateDraftOrderStatus } from '@/lib/draft-orders';
import { generateInvoiceEmail, generateInvoiceSubject } from '@/lib/email/templates/invoice';
import { getInvoiceTextOverrides } from '@/lib/email/template-content';

// Initialize Resend lazily to avoid build-time errors when env var is missing
let resend: Resend | null = null;
function getResend(): Resend {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is required');
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/admin/draft-orders/[id]/send
 * Send invoice email to customer
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Get draft order
    const draftOrder = await getDraftOrderById(id);
    if (!draftOrder) {
      return NextResponse.json(
        { success: false, error: 'Draft order not found' },
        { status: 404 }
      );
    }

    // Check if can be sent
    if (['PAID', 'CONVERTED', 'CANCELLED', 'EXPIRED'].includes(draftOrder.status)) {
      return NextResponse.json(
        { success: false, error: `Cannot send invoice for a ${draftOrder.status.toLowerCase()} draft order` },
        { status: 400 }
      );
    }

    // Generate invoice URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://partyondelivery.com';
    const invoiceUrl = `${baseUrl}/invoice/${draftOrder.token}`;

    // Load saved text overrides
    const textOverrides = await getInvoiceTextOverrides();

    // Generate email from template
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
    }, textOverrides);

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'PartyOn Delivery <orders@partyondelivery.com>';

    // Send email via Resend
    const { data, error: resendError } = await getResend().emails.send({
      from: fromEmail,
      to: draftOrder.customerEmail,
      subject: generateInvoiceSubject(Number(draftOrder.total)),
      html,
    });

    if (resendError) {
      console.error('[Draft Order Send] Email error:', resendError);
      return NextResponse.json(
        { success: false, error: 'Failed to send email', details: resendError.message },
        { status: 500 }
      );
    }

    // Update draft order status to SENT
    await updateDraftOrderStatus(id, 'SENT', { sentAt: new Date() });

    return NextResponse.json({
      success: true,
      message: 'Invoice sent successfully',
      data: {
        emailId: data?.id,
        invoiceUrl,
        sentTo: draftOrder.customerEmail,
      },
    });
  } catch (error) {
    console.error('[Draft Order Send] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send invoice' },
      { status: 500 }
    );
  }
}
