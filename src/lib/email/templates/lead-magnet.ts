/**
 * Lead-magnet welcome email.
 *
 * Sent immediately when someone submits the lead-magnet popup. Delivers
 * a direct link to the requested resource (`/flyer` or any other reward
 * URL configured on the magnet) plus a low-key follow-up offer.
 *
 * Visual matches the rest of POD's transactional emails: navy + gold
 * header, simple body copy, single CTA.
 */

export type LeadMagnetEmailInput = {
  firstName: string;
  magnetTitle: string;
  rewardUrl: string;
  rewardCta?: string;
};

const NAVY = '#0A1F33';
const GOLD = '#D4AF37';

function escape(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function leadMagnetEmail(input: LeadMagnetEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const fn = escape(input.firstName || 'there');
  const title = escape(input.magnetTitle);
  const cta = escape(input.rewardCta ?? 'View the playbook');
  const url = input.rewardUrl.startsWith('http')
    ? input.rewardUrl
    : `https://partyondelivery.com${input.rewardUrl}`;

  const subject = `${input.magnetTitle} — your copy is ready, ${fn}`;

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#FAF7F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Arial,sans-serif;color:${NAVY};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;padding:30px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(10,15,25,0.06);">
            <tr>
              <td style="background:${NAVY};padding:28px 24px;text-align:center;border-bottom:3px solid ${GOLD};">
                <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:${GOLD};">PARTY ON DELIVERY · AUSTIN</div>
                <div style="font-size:24px;font-weight:700;color:#FFFFFF;margin-top:6px;letter-spacing:0.5px;">${title}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 28px 8px;">
                <p style="margin:0 0 14px;font-size:16px;line-height:1.55;color:${NAVY};">Hey ${fn},</p>
                <p style="margin:0 0 14px;font-size:16px;line-height:1.55;color:${NAVY};">
                  Your copy of <strong>${title}</strong> is ready. Click below — it covers everything we do:
                  alcohol delivery, party rentals, full bar setup, our Fresh Victor cocktail kits, and
                  white-glove concierge planning.
                </p>
                <div style="text-align:center;margin:28px 0;">
                  <a href="${url}" style="display:inline-block;background:${GOLD};color:${NAVY};padding:14px 32px;border-radius:8px;font-size:14px;font-weight:700;letter-spacing:2px;text-decoration:none;">${cta.toUpperCase()} →</a>
                </div>
                <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#374151;">
                  Got a party already on the calendar? Hit reply with the date + headcount and I&apos;ll send
                  back a quote in under 24 hours. No sales rep, no pressure — just answers.
                </p>
                <p style="margin:18px 0 0;font-size:14px;color:${NAVY};">— Brian Hill, Founder</p>
                <p style="margin:4px 0 0;font-size:13px;color:#6B7280;">Party On Delivery · Austin, TX</p>
                <p style="margin:4px 0 0;font-size:13px;color:#6B7280;">
                  <a href="tel:7373719700" style="color:${NAVY};text-decoration:none;">(737) 371-9700</a>
                  &nbsp;·&nbsp;
                  <a href="https://partyondelivery.com" style="color:${NAVY};text-decoration:none;">partyondelivery.com</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 24px;border-top:1px solid #E5E7EB;text-align:center;">
                <p style="margin:0;font-size:11px;color:#9CA3AF;line-height:1.5;">
                  You got this because you requested the playbook on partyondelivery.com.<br/>
                  Reply STOP to unsubscribe. Must be 21+ to order alcohol.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = `Hey ${fn},

Your copy of ${input.magnetTitle} is ready: ${url}

It covers everything we do: alcohol delivery, party rentals, full bar setup, Fresh Victor cocktail kits, and white-glove concierge planning.

Got a party on the calendar? Hit reply with the date + headcount and I'll send back a quote in under 24 hours.

— Brian Hill, Founder
Party On Delivery · Austin, TX
(737) 371-9700 · partyondelivery.com

Reply STOP to unsubscribe. Must be 21+ to order alcohol.`;

  return { subject, html, text };
}
