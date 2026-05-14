/**
 * POST /api/v1/lead-magnet
 *
 * Server endpoint called from the LeadMagnetModal when someone submits
 * the popup. Three jobs:
 *
 *   1. Send the welcome email via Resend (delivers the reward link)
 *   2. Stamp the lead row as SUBMITTED via the existing lead-event API
 *      (handled client-side; this endpoint only owns the email)
 *   3. Return ok=true so the modal can transition to the success state
 *
 * Silent failure mode: if Resend isn't configured (no RESEND_API_KEY),
 * we log and return ok=true anyway so the UX still completes. The lead
 * row is still created — Brian can manually follow up.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { sendEmail } from '@/lib/email/resend-client';
import { leadMagnetEmail } from '@/lib/email/templates/lead-magnet';
import { EmailType } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  firstName: z.string().min(1).max(80),
  email: z.string().email().max(200),
  phone: z.string().max(40).optional().nullable(),
  magnetId: z.string().max(80),
  magnetTitle: z.string().max(200),
  rewardUrl: z.string().max(500),
  rewardCta: z.string().max(80).optional().nullable(),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: 'invalid_body', detail: String(err) },
      { status: 400 },
    );
  }

  const { subject, html, text } = leadMagnetEmail({
    firstName: body.firstName,
    magnetTitle: body.magnetTitle,
    rewardUrl: body.rewardUrl,
    rewardCta: body.rewardCta ?? undefined,
  });

  try {
    // Reuse the existing WELCOME EmailType so we don't have to migrate
    // the EmailType enum. Metadata tags this as a lead-magnet send for
    // analytics + opt-out tracking.
    await sendEmail({
      to: body.email,
      subject,
      html,
      text,
      type: EmailType.WELCOME,
      metadata: {
        flow: 'lead-magnet',
        magnetId: body.magnetId,
        rewardUrl: body.rewardUrl,
      },
      tags: [
        { name: 'flow', value: 'lead_magnet' },
        { name: 'magnet_id', value: body.magnetId.replace(/[^a-zA-Z0-9_-]/g, '_') },
      ],
    });
  } catch (err) {
    console.error('[lead-magnet] email send failed', err);
    // Don't 500 — the lead row is already created on the client; we just
    // failed to deliver the email. Brian can retry manually.
  }

  return NextResponse.json({ ok: true });
}
