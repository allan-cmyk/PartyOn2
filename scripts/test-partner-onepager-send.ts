/**
 * One-shot test: send the partner one-pager email to a given address.
 *
 * Verifies: env wiring, template generation, PDF attachment loading,
 * Resend send, EmailLog row creation.
 *
 * Note on images: the HTML references https://partyondelivery.com/email-assets/*
 * — those URLs only resolve once the assets are deployed to production.
 * Until prod deploys, images will appear broken in the test inbox; the PDF
 * attachment, Calendly link, copy, and layout-via-fallback are still verifiable.
 *
 * Usage:
 *   set -a && source .env.local && set +a
 *   npx tsx scripts/test-partner-onepager-send.ts <recipient@example.com>
 */

import { sendPartnerOnePagerEmail } from '../src/lib/email/email-service';

async function main() {
  const recipient = process.argv[2];
  if (!recipient) {
    console.error('Usage: npx tsx scripts/test-partner-onepager-send.ts <recipient@example.com>');
    process.exit(1);
  }

  for (const required of ['RESEND_API_KEY', 'PARTNER_CALENDLY_URL']) {
    if (!process.env[required]) {
      console.error(`Missing required env var: ${required}`);
      process.exit(1);
    }
  }

  console.log(`Sending partner one-pager to ${recipient}…`);
  console.log(`  Calendly URL: ${process.env.PARTNER_CALENDLY_URL}`);
  console.log(`  From: Party On Delivery <${process.env.RESEND_FROM_EMAIL || 'orders@partyondelivery.com'}>`);

  const resendId = await sendPartnerOnePagerEmail({
    to: recipient,
    companyName: 'Test Property Management',
    source: 'vacation-rental-onepager',
    signupQrId: 'test-script',
  });

  if (resendId) {
    console.log(`✓ Sent. Resend ID: ${resendId}`);
  } else {
    console.error('✗ Send returned null — check logs above for the failure reason.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
