/**
 * Resend Email Client
 * Note: EmailLog model not in Prisma schema - email logging not implemented
 */

import { Resend } from 'resend';

// Initialize Resend client
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'orders@partyondelivery.com';
const FROM_NAME = 'PartyOn Delivery';

if (!RESEND_API_KEY) {
  console.warn('[Email] RESEND_API_KEY not configured - emails will be logged but not sent');
}

export const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

/**
 * Email type enum (local since Prisma model doesn't exist)
 */
export type EmailType =
  | 'ORDER_CONFIRMATION'
  | 'DELIVERY_EN_ROUTE'
  | 'DELIVERY_COMPLETED'
  | 'PAYMENT_FAILED'
  | 'REFUND_PROCESSED'
  | 'PASSWORD_RESET'
  | 'WELCOME';

/**
 * Email sending options
 */
export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  type: EmailType;
  orderId?: string;
  customerId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Send an email (without logging to DB)
 */
export async function sendEmail(options: SendEmailOptions): Promise<string | null> {
  const { to, subject, html, text, type } = options;

  // If Resend is not configured, just log
  if (!resend) {
    console.log('[Email] Would send email:', { to, subject, type });
    return null;
  }

  try {
    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html,
      text,
    });

    console.log('[Email] Sent successfully:', { to, subject, type, resendId: result.data?.id });
    return result.data?.id || null;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Email] Failed to send:', { to, subject, type, error: errorMessage });
    return null;
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format time for display
 */
export function formatTime(time: string): string {
  if (time.includes('AM') || time.includes('PM')) {
    return time;
  }
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}
