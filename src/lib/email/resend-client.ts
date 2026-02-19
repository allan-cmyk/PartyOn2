/**
 * Resend Email Client
 * Handles all transactional email sending for Party On Delivery
 */

import { Resend } from 'resend';
import { prisma } from '@/lib/database/client';
import { EmailType, EmailStatus } from '@prisma/client';

// Initialize Resend client
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'orders@partyondelivery.com';
const FROM_NAME = 'Party On Delivery';

if (!RESEND_API_KEY) {
  console.warn('[Email] RESEND_API_KEY not configured - emails will be logged but not sent');
}

export const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

/**
 * Email sending options
 */
export interface SendEmailOptions {
  to: string;
  cc?: string[];
  subject: string;
  html: string;
  text?: string;
  type: EmailType;
  orderId?: string;
  customerId?: string;
  draftOrderId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Send an email and log it
 */
export async function sendEmail(options: SendEmailOptions): Promise<string | null> {
  const { to, cc, subject, html, text, type, orderId, customerId, draftOrderId, metadata } = options;

  // Create email log entry
  const emailLog = await prisma.emailLog.create({
    data: {
      type,
      to,
      subject,
      status: EmailStatus.PENDING,
      orderId,
      customerId,
      draftOrderId,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
    },
  });

  // If Resend is not configured, log and return
  if (!resend) {
    console.log('[Email] Would send email:', { to, subject, type });
    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: {
        status: EmailStatus.FAILED,
        errorMessage: 'RESEND_API_KEY not configured',
      },
    });
    return null;
  }

  try {
    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      ...(cc && cc.length > 0 ? { cc } : {}),
      subject,
      html,
      text,
    });

    // Update log with success
    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: {
        status: EmailStatus.SENT,
        resendId: result.data?.id,
        sentAt: new Date(),
      },
    });

    console.log('[Email] Sent successfully:', { to, subject, type, resendId: result.data?.id });
    return result.data?.id || null;
  } catch (error) {
    // Update log with error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: {
        status: EmailStatus.FAILED,
        errorMessage,
      },
    });

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
  // Handle various time formats (e.g., "14:00", "2:00 PM")
  if (time.includes('AM') || time.includes('PM')) {
    return time;
  }
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}
