/**
 * Email Service
 * Centralized service for sending all transactional emails
 */

import { EmailType } from '@prisma/client';
import { sendEmail } from './resend-client';
import {
  generateOrderConfirmationEmail,
  generateOrderConfirmationText,
  OrderConfirmationData,
} from './templates/order-confirmation';
import {
  generateDeliveryEnRouteEmail,
  generateDeliveryEnRouteText,
  generateDeliveryCompletedEmail,
  generateDeliveryCompletedText,
  DeliveryUpdateData,
} from './templates/delivery-update';

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(
  data: OrderConfirmationData
): Promise<string | null> {
  const html = generateOrderConfirmationEmail(data);
  const text = generateOrderConfirmationText(data);

  return sendEmail({
    to: data.customerEmail,
    subject: `Order Confirmed - #${data.orderNumber}`,
    html,
    text,
    type: EmailType.ORDER_CONFIRMATION,
    metadata: {
      orderNumber: data.orderNumber,
      customerName: data.customerName,
    },
  });
}

/**
 * Send delivery en route notification
 */
export async function sendDeliveryEnRouteEmail(
  customerEmail: string,
  data: DeliveryUpdateData
): Promise<string | null> {
  const html = generateDeliveryEnRouteEmail(data);
  const text = generateDeliveryEnRouteText(data);

  return sendEmail({
    to: customerEmail,
    subject: `Your Order #${data.orderNumber} is On Its Way!`,
    html,
    text,
    type: EmailType.DELIVERY_EN_ROUTE,
    metadata: {
      orderNumber: data.orderNumber,
      driverName: data.driverName,
    },
  });
}

/**
 * Send delivery completed notification
 */
export async function sendDeliveryCompletedEmail(
  customerEmail: string,
  data: DeliveryUpdateData
): Promise<string | null> {
  const html = generateDeliveryCompletedEmail(data);
  const text = generateDeliveryCompletedText(data);

  return sendEmail({
    to: customerEmail,
    subject: `Delivery Complete - Order #${data.orderNumber}`,
    html,
    text,
    type: EmailType.DELIVERY_COMPLETED,
    metadata: {
      orderNumber: data.orderNumber,
    },
  });
}

/**
 * Send payment failed notification
 */
export async function sendPaymentFailedEmail(
  customerEmail: string,
  customerName: string,
  errorMessage?: string
): Promise<string | null> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Failed - PartyOn Delivery</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 32px; text-align: center;">
              <h1 style="color: #D4AF37; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 0.1em;">PARTYON</h1>
              <p style="color: #ffffff; margin: 8px 0 0; font-size: 14px; letter-spacing: 0.05em;">PREMIUM ALCOHOL DELIVERY</p>
            </td>
          </tr>

          <!-- Error Banner -->
          <tr>
            <td style="background-color: #fef2f2; padding: 24px; text-align: center; border-bottom: 1px solid #e5e5e5;">
              <div style="font-size: 48px; margin-bottom: 8px;">&#9888;</div>
              <h2 style="margin: 0; color: #991b1b; font-size: 24px;">Payment Issue</h2>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 24px;">
              <p style="margin: 0 0 16px; font-size: 16px; color: #1a1a1a;">
                Hi ${customerName},
              </p>
              <p style="margin: 0 0 16px; font-size: 16px; color: #666;">
                We were unable to process your payment. This can happen for several reasons:
              </p>
              <ul style="margin: 0 0 16px; padding: 0 0 0 20px; color: #666;">
                <li>Insufficient funds</li>
                <li>Card declined by bank</li>
                <li>Incorrect card information</li>
                <li>Card expired</li>
              </ul>
              ${
                errorMessage
                  ? `
                <div style="background-color: #fef2f2; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                  <p style="margin: 0; color: #991b1b; font-size: 14px;">Error Details</p>
                  <p style="margin: 4px 0 0; font-size: 14px; color: #666;">${errorMessage}</p>
                </div>
              `
                  : ''
              }
              <p style="margin: 16px 0; font-size: 16px; color: #666;">
                Please try again with a different payment method or contact your bank if the issue persists.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 0 24px 24px; text-align: center;">
              <a href="https://partyondelivery.com/products" style="display: inline-block; background-color: #D4AF37; color: #1a1a1a; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Try Again
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 24px; text-align: center;">
              <p style="margin: 0; color: #D4AF37; font-size: 14px;">Need help?</p>
              <p style="margin: 8px 0 0; color: #ffffff; font-size: 14px;">Reply to this email or contact us at support@partyondelivery.com</p>
              <p style="margin: 16px 0 0; color: #666; font-size: 12px;">&copy; ${new Date().getFullYear()} PartyOn Delivery. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
PARTYON DELIVERY
Payment Issue

Hi ${customerName},

We were unable to process your payment. This can happen for several reasons:
- Insufficient funds
- Card declined by bank
- Incorrect card information
- Card expired

${errorMessage ? `Error Details: ${errorMessage}\n` : ''}
Please try again with a different payment method or contact your bank if the issue persists.

Try again at: https://partyondelivery.com/products

Need help? Reply to this email or contact support@partyondelivery.com

PartyOn Delivery
Premium Alcohol Delivery
  `.trim();

  return sendEmail({
    to: customerEmail,
    subject: 'Payment Issue - PartyOn Delivery',
    html,
    text,
    type: EmailType.PAYMENT_FAILED,
    metadata: {
      customerName,
      errorMessage,
    },
  });
}

/**
 * Send refund processed notification
 */
export async function sendRefundProcessedEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: number,
  refundAmount: number | string,
  reason?: string
): Promise<string | null> {
  const { formatCurrency } = await import('./resend-client');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Refund Processed - PartyOn Delivery</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 32px; text-align: center;">
              <h1 style="color: #D4AF37; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 0.1em;">PARTYON</h1>
              <p style="color: #ffffff; margin: 8px 0 0; font-size: 14px; letter-spacing: 0.05em;">PREMIUM ALCOHOL DELIVERY</p>
            </td>
          </tr>

          <!-- Info Banner -->
          <tr>
            <td style="background-color: #dbeafe; padding: 24px; text-align: center; border-bottom: 1px solid #e5e5e5;">
              <div style="font-size: 48px; margin-bottom: 8px;">&#128181;</div>
              <h2 style="margin: 0; color: #1e40af; font-size: 24px;">Refund Processed</h2>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 24px;">
              <p style="margin: 0 0 16px; font-size: 16px; color: #1a1a1a;">
                Hi ${customerName},
              </p>
              <p style="margin: 0 0 16px; font-size: 16px; color: #666;">
                We've processed a refund for your order <strong>#${orderNumber}</strong>.
              </p>

              <div style="background-color: #f0fdf4; border-radius: 8px; padding: 16px; margin-bottom: 16px; text-align: center;">
                <p style="margin: 0; color: #166534; font-size: 14px;">Refund Amount</p>
                <p style="margin: 4px 0 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">${formatCurrency(refundAmount)}</p>
              </div>

              ${
                reason
                  ? `
                <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                  <p style="margin: 0; color: #666; font-size: 14px;">Reason</p>
                  <p style="margin: 4px 0 0; font-size: 14px; color: #1a1a1a;">${reason}</p>
                </div>
              `
                  : ''
              }

              <p style="margin: 16px 0; font-size: 14px; color: #666;">
                Please allow 5-10 business days for the refund to appear on your original payment method.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 24px; text-align: center;">
              <p style="margin: 0; color: #D4AF37; font-size: 14px;">Questions about your refund?</p>
              <p style="margin: 8px 0 0; color: #ffffff; font-size: 14px;">Reply to this email or contact us at support@partyondelivery.com</p>
              <p style="margin: 16px 0 0; color: #666; font-size: 12px;">&copy; ${new Date().getFullYear()} PartyOn Delivery. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
PARTYON DELIVERY
Refund Processed

Hi ${customerName},

We've processed a refund for your order #${orderNumber}.

Refund Amount: ${formatCurrency(refundAmount)}
${reason ? `Reason: ${reason}\n` : ''}
Please allow 5-10 business days for the refund to appear on your original payment method.

Questions? Reply to this email or contact support@partyondelivery.com

PartyOn Delivery
Premium Alcohol Delivery
  `.trim();

  return sendEmail({
    to: customerEmail,
    subject: `Refund Processed - Order #${orderNumber}`,
    html,
    text,
    type: EmailType.REFUND_PROCESSED,
    orderId: undefined, // Could be passed if available
    metadata: {
      orderNumber,
      refundAmount,
      reason,
    },
  });
}
