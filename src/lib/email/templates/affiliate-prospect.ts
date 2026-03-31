/**
 * Affiliate Prospect Email Template
 * Sent after a phone call with a potential partner who hasn't signed up yet.
 * Contains the same program details as the welcome email, but pitched as an overview.
 */

export interface AffiliateProspectEmailData {
  contactName: string;
  businessName: string;
  introText?: string;
}

/**
 * Generate affiliate prospect email HTML
 */
export function generateAffiliateProspectEmail(data: AffiliateProspectEmailData): string {
  const year = new Date().getFullYear();
  const firstName = data.contactName.trim().split(/\s+/)[0];
  const introText = data.introText || `Great talking with you about partnering with Party On Delivery! Here's a quick overview of how our partner program works and what <strong>${data.businessName}</strong> can expect.`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 32px; text-align: center; border-radius: 8px 8px 0 0;">
              <img src="https://partyondelivery.com/images/pod-logo-2025.png" alt="Party On Delivery" width="180" style="width: 180px; max-width: 100%; height: auto; margin-bottom: 12px;" />
              <p style="color: #D4AF37; margin: 0; font-size: 14px; letter-spacing: 0.05em; font-weight: 600;">PARTNER PROGRAM</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 24px;">
                Hi ${firstName},
              </h2>
              <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                ${introText}
              </p>

              <!-- What Your Customers Get -->
              <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 12px; color: #166534; font-size: 18px;">
                  What Your Customers Get
                </h3>
                <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                  <strong>Free delivery</strong> on every order placed through your partner page -- a real perk you can offer your guests and clients.
                </p>
              </div>

              <!-- What You Get -->
              <h3 style="margin: 0 0 12px; color: #1a1a1a; font-size: 18px;">
                What You Get
              </h3>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 6px 0; color: #4b5563; font-size: 15px; line-height: 1.6; vertical-align: top; width: 24px;">&#8226;</td>
                  <td style="padding: 6px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">A <strong>branded partner page</strong> for your business on partyondelivery.com</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #4b5563; font-size: 15px; line-height: 1.6; vertical-align: top;">&#8226;</td>
                  <td style="padding: 6px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">A unique <strong>referral code</strong> and <strong>tracking link</strong> that tags visitors as your referrals for 30 days</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #4b5563; font-size: 15px; line-height: 1.6; vertical-align: top;">&#8226;</td>
                  <td style="padding: 6px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">A <strong>commission</strong> on every order -- the more you refer, the higher your rate grows</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #4b5563; font-size: 15px; line-height: 1.6; vertical-align: top;">&#8226;</td>
                  <td style="padding: 6px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">A <strong>real-time dashboard</strong> to track your orders, commissions, and payouts</td>
                </tr>
              </table>

              <!-- Commission Tiers -->
              <h3 style="margin: 0 0 12px; color: #1a1a1a; font-size: 18px;">
                Commission Tiers
              </h3>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
                <thead>
                  <tr style="background-color: #1a1a1a;">
                    <th style="padding: 12px 16px; text-align: left; font-size: 13px; color: #D4AF37; font-weight: 600; letter-spacing: 0.05em;">TIER</th>
                    <th style="padding: 12px 16px; text-align: center; font-size: 13px; color: #D4AF37; font-weight: 600; letter-spacing: 0.05em;">ANNUAL REVENUE</th>
                    <th style="padding: 12px 16px; text-align: right; font-size: 13px; color: #D4AF37; font-weight: 600; letter-spacing: 0.05em;">COMMISSION</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #e5e5e5; color: #4b5563; font-size: 14px;">Starter</td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #e5e5e5; text-align: center; color: #4b5563; font-size: 14px;">$0 - $10k</td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #e5e5e5; text-align: right; color: #1a1a1a; font-size: 14px; font-weight: 600;">5%</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #e5e5e5; color: #4b5563; font-size: 14px;">Growth</td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #e5e5e5; text-align: center; color: #4b5563; font-size: 14px;">$10k - $20k</td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #e5e5e5; text-align: right; color: #1a1a1a; font-size: 14px; font-weight: 600;">8%</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 16px; color: #4b5563; font-size: 14px;">Pro</td>
                    <td style="padding: 12px 16px; text-align: center; color: #4b5563; font-size: 14px;">$20k+</td>
                    <td style="padding: 12px 16px; text-align: right; color: #1a1a1a; font-size: 14px; font-weight: 600;">10%</td>
                  </tr>
                </tbody>
              </table>

              <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px; line-height: 1.6;">
                Tiers are based on your annual referred revenue, starting from your join date and resetting each year on that anniversary. Commissions are paid out monthly by the <strong>15th of the following month</strong>.
              </p>

              <!-- How It Works -->
              <h3 style="margin: 0 0 12px; color: #1a1a1a; font-size: 18px;">
                How It Works
              </h3>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 6px 0; color: #4b5563; font-size: 15px; line-height: 1.6; vertical-align: top; width: 24px;">&#8226;</td>
                  <td style="padding: 6px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">Your customer visits your <strong>partner page</strong> or uses your <strong>referral code</strong> at checkout</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #4b5563; font-size: 15px; line-height: 1.6; vertical-align: top;">&#8226;</td>
                  <td style="padding: 6px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">They browse our full catalog of <strong>beer, wine, spirits, mixers, and party supplies</strong> and place their order</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #4b5563; font-size: 15px; line-height: 1.6; vertical-align: top;">&#8226;</td>
                  <td style="padding: 6px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">We <strong>deliver directly</strong> to their door, boat, venue, or event -- wherever they need it</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #4b5563; font-size: 15px; line-height: 1.6; vertical-align: top;">&#8226;</td>
                  <td style="padding: 6px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">You <strong>earn commission</strong> automatically -- no invoicing, no follow-up needed</td>
                </tr>
              </table>

              <!-- CTA Buttons -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 16px;">
                <tr>
                  <td align="center">
                    <a href="https://api.leadgenjay.com/widget/bookings/pod-partnerships" style="display: inline-block; background-color: #D4AF37; color: #1a1a1a; text-decoration: none; padding: 16px 48px; font-size: 16px; font-weight: 600; border-radius: 8px; letter-spacing: 0.05em;">
                      SCHEDULE A CALL
                    </a>
                  </td>
                </tr>
              </table>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="https://partyondelivery.com/partners" style="display: inline-block; color: #D4AF37; text-decoration: underline; font-size: 14px; font-weight: 600;">
                      Learn more about the program
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #9ca3af; font-size: 13px; text-align: center; line-height: 1.6;">
                Ready to get started? Just reply to this email and we'll get you set up.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 24px 32px; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0 0 8px; color: #D4AF37; font-size: 14px;">
                Questions? Contact us at info@partyondelivery.com
              </p>
              <p style="margin: 0; color: #666; font-size: 12px;">
                &copy; ${year} Party On Delivery. Austin, Texas.
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
 * Generate affiliate prospect email plain text
 */
export function generateAffiliateProspectText(data: AffiliateProspectEmailData): string {
  const firstName = data.contactName.trim().split(/\s+/)[0];

  const introText = data.introText || `Great talking with you about partnering with Party On Delivery! Here's a quick overview of how our partner program works and what ${data.businessName} can expect.`;

  const lines = [
    `Hi ${firstName},`,
    '',
    introText,
    '',
  ];

  lines.push(
    'WHAT YOUR CUSTOMERS GET',
    '- Free delivery on every order placed through your partner page -- a real perk you can offer your guests and clients',
    '',
    'WHAT YOU GET',
    '- A branded partner page for your business on partyondelivery.com',
    '- A unique referral code and tracking link that tags visitors as your referrals for 30 days',
    '- A commission on every order -- the more you refer, the higher your rate grows',
    '- A real-time dashboard to track your orders, commissions, and payouts',
    '',
    'COMMISSION TIERS (annual revenue from your join date)',
    'Starter ($0-$10k): 5%',
    'Growth ($10k-$20k): 8%',
    'Pro ($20k+): 10%',
    'Tiers are based on your annual referred revenue, starting from your join date and resetting each year on that anniversary. Commissions are paid out monthly by the 15th of the following month.',
    '',
    'HOW IT WORKS',
    '- Your customer visits your partner page or uses your referral code at checkout',
    '- They browse our full catalog of beer, wine, spirits, mixers, and party supplies and place their order',
    '- We deliver directly to their door, boat, venue, or event -- wherever they need it',
    '- You earn commission automatically -- no invoicing, no follow-up needed',
    '',
    'Schedule a call: https://api.leadgenjay.com/widget/bookings/pod-partnerships',
    '',
    'Learn more: https://partyondelivery.com/partners',
    '',
    'Ready to get started? Just reply to this email and we\'ll get you set up.',
    '',
    'Questions? Contact us at info@partyondelivery.com',
    'Party On Delivery. Austin, Texas.',
  );

  return lines.join('\n');
}
