/**
 * Send Draft Order Invoice API
 * POST: Send invoice email to customer
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getDraftOrderById, updateDraftOrderStatus } from '@/lib/draft-orders';

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

    // Format delivery date
    const deliveryDate = new Date(draftOrder.deliveryDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Build items HTML
    const itemsHtml = draftOrder.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          ${item.title}${item.variantTitle ? ` - ${item.variantTitle}` : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          $${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `
      )
      .join('');

    // Send email via Resend
    const { data, error: resendError } = await getResend().emails.send({
      from: 'PartyOn Delivery <orders@partyondelivery.com>',
      to: draftOrder.customerEmail,
      subject: `Your Invoice from PartyOn Delivery - $${Number(draftOrder.total).toFixed(2)}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #111827; padding: 32px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #D4AF37; font-size: 28px; font-weight: 600; letter-spacing: 0.05em;">
                PARTYÓN DELIVERY
              </h1>
              <p style="margin: 8px 0 0; color: #9ca3af; font-size: 14px;">
                Premium Alcohol Delivery in Austin
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px; color: #111827; font-size: 24px;">
                Hi ${draftOrder.customerName},
              </h2>
              <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Here's your invoice for your upcoming delivery. Click the button below to complete your payment.
              </p>

              <!-- Delivery Info -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 12px; color: #111827; font-size: 16px;">
                  📦 Delivery Details
                </h3>
                <p style="margin: 0 0 4px; color: #4b5563; font-size: 14px;">
                  <strong>Date:</strong> ${deliveryDate}
                </p>
                <p style="margin: 0 0 4px; color: #4b5563; font-size: 14px;">
                  <strong>Time:</strong> ${draftOrder.deliveryTime}
                </p>
                <p style="margin: 0; color: #4b5563; font-size: 14px;">
                  <strong>Address:</strong> ${draftOrder.deliveryAddress}, ${draftOrder.deliveryCity}, ${draftOrder.deliveryState} ${draftOrder.deliveryZip}
                </p>
              </div>

              <!-- Order Items -->
              <h3 style="margin: 0 0 12px; color: #111827; font-size: 16px;">
                🛒 Order Items
              </h3>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 24px;">
                <thead>
                  <tr style="background-color: #f9fafb;">
                    <th style="padding: 12px; text-align: left; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">
                      Item
                    </th>
                    <th style="padding: 12px; text-align: center; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">
                      Qty
                    </th>
                    <th style="padding: 12px; text-align: right; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Order Total -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 32px;">
                <tr>
                  <td style="padding: 8px 0; color: #4b5563;">Subtotal</td>
                  <td style="padding: 8px 0; text-align: right; color: #4b5563;">$${Number(draftOrder.subtotal).toFixed(2)}</td>
                </tr>
                ${Number(draftOrder.discountAmount) > 0 ? `
                <tr>
                  <td style="padding: 8px 0; color: #059669;">Discount${draftOrder.discountCode ? ` (${draftOrder.discountCode})` : ''}</td>
                  <td style="padding: 8px 0; text-align: right; color: #059669;">-$${Number(draftOrder.discountAmount).toFixed(2)}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #4b5563;">Sales Tax</td>
                  <td style="padding: 8px 0; text-align: right; color: #4b5563;">$${Number(draftOrder.taxAmount).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #4b5563;">Delivery Fee</td>
                  <td style="padding: 8px 0; text-align: right; color: #4b5563;">$${Number(draftOrder.deliveryFee).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 16px 0 0; color: #111827; font-size: 18px; font-weight: 600; border-top: 2px solid #e5e7eb;">Total</td>
                  <td style="padding: 16px 0 0; text-align: right; color: #111827; font-size: 18px; font-weight: 600; border-top: 2px solid #e5e7eb;">$${Number(draftOrder.total).toFixed(2)}</td>
                </tr>
              </table>

              <!-- Pay Button -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${invoiceUrl}" style="display: inline-block; background-color: #D4AF37; color: #111827; text-decoration: none; padding: 16px 48px; font-size: 16px; font-weight: 600; border-radius: 8px; letter-spacing: 0.05em;">
                      PAY NOW
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
                Or copy this link: <a href="${invoiceUrl}" style="color: #D4AF37;">${invoiceUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 32px; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                Questions? Contact us at orders@partyondelivery.com
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} PartyOn Delivery. Austin, Texas.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
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
