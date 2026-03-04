/**
 * Affiliate Welcome Email Template
 * Sent when an admin manually creates a new affiliate partner
 */

export interface AffiliateWelcomeEmailData {
  contactName: string;
  businessName: string;
  code: string;
  referralLink: string;
  directReferralLink: string;
  dashboardLink: string;
  personalNote?: string;
}

/**
 * Generate affiliate welcome email HTML
 */
export function generateAffiliateWelcomeEmail(data: AffiliateWelcomeEmailData): string {
  const year = new Date().getFullYear();

  const personalNoteHtml = data.personalNote
    ? `
              <div style="background-color: #fef9e7; border-left: 4px solid #D4AF37; border-radius: 4px; padding: 16px 20px; margin-bottom: 24px;">
                <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.6; font-style: italic;">
                  ${data.personalNote.replace(/\n/g, '<br>')}
                </p>
              </div>`
    : '';

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
                Hi ${data.contactName},
              </h2>
              <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Welcome to the Party On Delivery partner program! We're excited to have <strong>${data.businessName}</strong> on board. Below you'll find everything you need to start earning commissions.
              </p>

              ${personalNoteHtml}

              <!-- Partner Page -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: center;">
                <h3 style="margin: 0 0 12px; color: #1a1a1a; font-size: 18px;">
                  Your Partner Page
                </h3>
                <div style="background-color: #1a1a1a; color: #D4AF37; font-family: 'Courier New', Courier, monospace; font-size: 18px; font-weight: 700; padding: 16px 24px; border-radius: 8px; display: inline-block; margin-bottom: 16px;">
                  <a href="${data.referralLink}" style="color: #D4AF37; text-decoration: none;">${data.referralLink}</a>
                </div>
                <div style="border: 3px solid #D4AF37; border-radius: 8px; padding: 16px 24px; margin-bottom: 16px; text-align: center;">
                  <p style="margin: 0 0 4px; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Referral Code</p>
                  <p style="margin: 0; color: #1a1a1a; font-size: 28px; font-weight: 700; letter-spacing: 0.1em; font-family: 'Courier New', Courier, monospace;">${data.code}</p>
                </div>
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="text-align: left;">
                  <tr>
                    <td style="padding: 4px 0; color: #4b5563; font-size: 14px; line-height: 1.6; vertical-align: top; width: 24px;">&#8226;</td>
                    <td style="padding: 4px 0; color: #4b5563; font-size: 14px; line-height: 1.6;">A branded landing page for your business</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #4b5563; font-size: 14px; line-height: 1.6; vertical-align: top;">&#8226;</td>
                    <td style="padding: 4px 0; color: #4b5563; font-size: 14px; line-height: 1.6;">Anyone can open this link -- great for social media, text messages, or sharing directly</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #4b5563; font-size: 14px; line-height: 1.6; vertical-align: top;">&#8226;</td>
                    <td style="padding: 4px 0; color: #4b5563; font-size: 14px; line-height: 1.6;">Customers enter this code at checkout to get their discount</td>
                  </tr>
                </table>
              </div>

              <!-- Website Referral Link -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: center;">
                <h3 style="margin: 0 0 12px; color: #1a1a1a; font-size: 18px;">
                  Your Website Referral Link
                </h3>
                <div style="background-color: #1a1a1a; color: #D4AF37; font-family: 'Courier New', Courier, monospace; font-size: 16px; font-weight: 700; padding: 16px 24px; border-radius: 8px; display: inline-block; margin-bottom: 12px;">
                  <a href="${data.directReferralLink}" style="color: #D4AF37; text-decoration: none;">${data.directReferralLink}</a>
                </div>
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="text-align: left;">
                  <tr>
                    <td style="padding: 4px 0; color: #4b5563; font-size: 14px; line-height: 1.6; vertical-align: top; width: 24px;">&#8226;</td>
                    <td style="padding: 4px 0; color: #4b5563; font-size: 14px; line-height: 1.6;">Embed this on your website, booking confirmations, or email signatures</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #4b5563; font-size: 14px; line-height: 1.6; vertical-align: top;">&#8226;</td>
                    <td style="padding: 4px 0; color: #4b5563; font-size: 14px; line-height: 1.6;">When someone clicks this link, they are <strong>automatically tagged</strong> as your referral for 30 days -- no code needed</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #4b5563; font-size: 14px; line-height: 1.6; vertical-align: top;">&#8226;</td>
                    <td style="padding: 4px 0; color: #4b5563; font-size: 14px; line-height: 1.6;">The customer sees the same partner page -- the tracking happens behind the scenes</td>
                  </tr>
                </table>
              </div>

              <!-- How It Works -->
              <h3 style="margin: 0 0 12px; color: #1a1a1a; font-size: 18px;">
                How It Works
              </h3>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 6px 0; color: #4b5563; font-size: 15px; line-height: 1.6; vertical-align: top; width: 24px;">&#8226;</td>
                  <td style="padding: 6px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">Your customers get <strong>free delivery</strong> when they order through your partner page</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #4b5563; font-size: 15px; line-height: 1.6; vertical-align: top;">&#8226;</td>
                  <td style="padding: 6px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">You earn a <strong>commission</strong> on every order placed through your referral</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #4b5563; font-size: 15px; line-height: 1.6; vertical-align: top;">&#8226;</td>
                  <td style="padding: 6px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">The more revenue you refer, the <strong>higher your commission rate</strong> grows</td>
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

              <!-- Payout Schedule -->
              <h3 style="margin: 0 0 12px; color: #1a1a1a; font-size: 18px;">
                Payout Schedule
              </h3>
              <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px; line-height: 1.6;">
                Tiers are based on your annual referred revenue, starting from your join date and resetting each year on that anniversary. Commissions are paid out monthly by the <strong>15th of the following month</strong>. You can track your earnings in real time from your partner dashboard.
              </p>

              <!-- Partner Dashboard -->
              <h3 style="margin: 0 0 12px; color: #1a1a1a; font-size: 18px;">
                Your Partner Dashboard
              </h3>
              <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px; line-height: 1.6;">
                Access your dashboard at any time to view orders, commissions, and payouts. For your first login, enter your email and we'll send you a one-time access link. Once inside, you can set a password so you can log in directly going forward.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${data.dashboardLink}" style="display: inline-block; background-color: #D4AF37; color: #1a1a1a; text-decoration: none; padding: 16px 48px; font-size: 16px; font-weight: 600; border-radius: 8px; letter-spacing: 0.05em;">
                      GO TO DASHBOARD
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Marketing Tips -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 0;">
                <h3 style="margin: 0 0 12px; color: #1a1a1a; font-size: 18px;">
                  Marketing Tips
                </h3>
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="padding: 4px 0; color: #4b5563; font-size: 14px; line-height: 1.6; vertical-align: top; width: 24px;">&#8226;</td>
                    <td style="padding: 4px 0; color: #4b5563; font-size: 14px; line-height: 1.6;">Add your referral link to your website and booking confirmations</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #4b5563; font-size: 14px; line-height: 1.6; vertical-align: top;">&#8226;</td>
                    <td style="padding: 4px 0; color: #4b5563; font-size: 14px; line-height: 1.6;">Share your partner page on social media and in your bio</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #4b5563; font-size: 14px; line-height: 1.6; vertical-align: top;">&#8226;</td>
                    <td style="padding: 4px 0; color: #4b5563; font-size: 14px; line-height: 1.6;">Mention the <strong>free delivery perk</strong> -- it's a great selling point</td>
                  </tr>
                </table>
              </div>
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
 * Generate affiliate welcome email plain text
 */
export function generateAffiliateWelcomeText(data: AffiliateWelcomeEmailData): string {
  const lines = [
    `Hi ${data.contactName},`,
    '',
    `Welcome to the Party On Delivery partner program! We're excited to have ${data.businessName} on board.`,
    '',
  ];

  if (data.personalNote) {
    lines.push(data.personalNote, '');
  }

  lines.push(
    'YOUR PARTNER PAGE',
    data.referralLink,
    `- A branded landing page for your business`,
    '- Anyone can open this link -- great for social media, text messages, or sharing directly',
    `- Customers enter your referral code ${data.code} at checkout to get their discount`,
    '',
    'YOUR WEBSITE REFERRAL LINK',
    data.directReferralLink,
    '- Embed this on your website, booking confirmations, or email signatures',
    '- When someone clicks this link, they are automatically tagged as your referral for 30 days -- no code needed',
    '- The customer sees the same partner page -- the tracking happens behind the scenes',
    '',
    'HOW IT WORKS',
    '- Your customers get free delivery when they order through your partner page',
    '- You earn a commission on every order placed through your referral',
    '- The more revenue you refer, the higher your commission rate grows',
    '',
    'COMMISSION TIERS (annual revenue from your join date)',
    'Starter ($0-$10k): 5%',
    'Growth ($10k-$20k): 8%',
    'Pro ($20k+): 10%',
    '',
    'PAYOUT SCHEDULE',
    'Tiers are based on your annual referred revenue, starting from your join date and resetting each year on that anniversary. Commissions are paid out monthly by the 15th of the following month.',
    '',
    'YOUR PARTNER DASHBOARD',
    `Access your dashboard: ${data.dashboardLink}`,
    'For your first login, enter your email and we\'ll send you a one-time access link. Once inside, you can set a password so you can log in directly going forward.',
    '',
    'MARKETING TIPS',
    '- Add your referral link to your website and booking confirmations',
    '- Share your partner page on social media and in your bio',
    '- Mention the free delivery perk -- it\'s a great selling point',
    '',
    'Questions? Contact us at info@partyondelivery.com',
    `Party On Delivery. Austin, Texas.`,
  );

  return lines.join('\n');
}
