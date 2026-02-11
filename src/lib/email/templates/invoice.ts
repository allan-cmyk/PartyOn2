/**
 * Invoice Email Template
 * Sent when an admin sends a draft order invoice to a customer
 */

import { formatCurrency, formatDate } from '../resend-client';

interface InvoiceItem {
  title: string;
  variantTitle?: string;
  quantity: number;
  price: number;
}

export interface InvoiceEmailData {
  customerName: string;
  deliveryDate: Date | string;
  deliveryTime: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryZip: string;
  items: InvoiceItem[];
  subtotal: number | string | { toString(): string };
  taxAmount: number | string | { toString(): string };
  deliveryFee: number | string | { toString(): string };
  discountAmount: number | string | { toString(): string };
  discountCode?: string | null;
  total: number | string | { toString(): string };
  invoiceUrl: string;
}

export interface InvoiceTextOverrides {
  greeting?: string;
  bodyText?: string;
  buttonText?: string;
  linkText?: string;
  footerText?: string;
  copyrightText?: string;
}

export const INVOICE_TEXT_DEFAULTS: Required<InvoiceTextOverrides> = {
  greeting: 'Hi {customerName},',
  bodyText: "Here's your invoice for your upcoming delivery. Click the button below to complete your payment.",
  buttonText: 'PAY NOW',
  linkText: 'Or copy this link:',
  footerText: 'Questions? Contact us at orders@partyondelivery.com',
  copyrightText: '{year} PartyOn Delivery. Austin, Texas.',
};

/**
 * Generate invoice email HTML
 */
export function generateInvoiceEmail(data: InvoiceEmailData, textOverrides?: InvoiceTextOverrides): string {
  const deliveryDate = formatDate(data.deliveryDate);

  // Merge defaults with overrides and replace placeholders
  const text = { ...INVOICE_TEXT_DEFAULTS, ...textOverrides };
  const greeting = text.greeting.replace('{customerName}', data.customerName);
  const bodyText = text.bodyText;
  const buttonText = text.buttonText;
  const linkText = text.linkText;
  const footerText = text.footerText;
  const copyrightText = text.copyrightText.replace('{year}', String(new Date().getFullYear()));

  const itemsHtml = data.items
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
          ${formatCurrency(item.price * item.quantity)}
        </td>
      </tr>
    `
    )
    .join('');

  const discountHtml =
    Number(data.discountAmount) > 0
      ? `
                <tr>
                  <td style="padding: 8px 0; color: #059669;">Discount${data.discountCode ? ` (${data.discountCode})` : ''}</td>
                  <td style="padding: 8px 0; text-align: right; color: #059669;">-${formatCurrency(Number(data.discountAmount))}</td>
                </tr>
                `
      : '';

  return `
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
              <img src="https://partyondelivery.com/images/pod-logo-2025.png" alt="PartyOn Delivery" width="180" style="width: 180px; max-width: 100%; height: auto; margin-bottom: 12px;" />
              <p style="margin: 0; color: #9ca3af; font-size: 14px;">
                Premium Alcohol Delivery in Austin
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px; color: #111827; font-size: 24px;">
                ${greeting}
              </h2>
              <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                ${bodyText}
              </p>

              <!-- Delivery Info -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 12px; color: #111827; font-size: 16px;">
                  &#128230; Delivery Details
                </h3>
                <p style="margin: 0 0 4px; color: #4b5563; font-size: 14px;">
                  <strong>Date:</strong> ${deliveryDate}
                </p>
                <p style="margin: 0 0 4px; color: #4b5563; font-size: 14px;">
                  <strong>Time:</strong> ${data.deliveryTime}
                </p>
                <p style="margin: 0; color: #4b5563; font-size: 14px;">
                  <strong>Address:</strong> ${data.deliveryAddress}, ${data.deliveryCity}, ${data.deliveryState} ${data.deliveryZip}
                </p>
              </div>

              <!-- Order Items -->
              <h3 style="margin: 0 0 12px; color: #111827; font-size: 16px;">
                &#128722; Order Items
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
                  <td style="padding: 8px 0; text-align: right; color: #4b5563;">${formatCurrency(Number(data.subtotal))}</td>
                </tr>
                ${discountHtml}
                <tr>
                  <td style="padding: 8px 0; color: #4b5563;">Sales Tax</td>
                  <td style="padding: 8px 0; text-align: right; color: #4b5563;">${formatCurrency(Number(data.taxAmount))}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #4b5563;">Delivery Fee</td>
                  <td style="padding: 8px 0; text-align: right; color: #4b5563;">${formatCurrency(Number(data.deliveryFee))}</td>
                </tr>
                <tr>
                  <td style="padding: 16px 0 0; color: #111827; font-size: 18px; font-weight: 600; border-top: 2px solid #e5e7eb;">Total</td>
                  <td style="padding: 16px 0 0; text-align: right; color: #111827; font-size: 18px; font-weight: 600; border-top: 2px solid #e5e7eb;">${formatCurrency(Number(data.total))}</td>
                </tr>
              </table>

              <!-- Pay Button -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${data.invoiceUrl}" style="display: inline-block; background-color: #D4AF37; color: #111827; text-decoration: none; padding: 16px 48px; font-size: 16px; font-weight: 600; border-radius: 8px; letter-spacing: 0.05em;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
                ${linkText} <a href="${data.invoiceUrl}" style="color: #D4AF37;">${data.invoiceUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 32px; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                ${footerText}
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                &copy; ${copyrightText}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate invoice email subject line
 */
export function generateInvoiceSubject(total: number | string): string {
  return `Your Invoice from PartyOn Delivery - ${formatCurrency(total)}`;
}
