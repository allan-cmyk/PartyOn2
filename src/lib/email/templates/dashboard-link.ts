/**
 * Dashboard Link Email Template
 * Sent when user requests their dashboard link via the share flow.
 * May be forwarded to other party members, so includes explanation of what the dashboard does.
 */

export function dashboardLinkEmail(
  dashboardUrl: string,
  orderName?: string
): { html: string; text: string; subject: string } {
  const titleSuffix = orderName ? ` for ${orderName}` : '';
  const subject = `Your Party On Delivery Dashboard${titleSuffix}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Dashboard Link${titleSuffix}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 32px; text-align: center;">
              <img src="https://partyondelivery.com/images/pod-logo-2025.png" alt="Party On Delivery" width="180" style="width: 180px; max-width: 100%; height: auto; margin-bottom: 12px;" />
              <p style="color: #ffffff; margin: 0; font-size: 14px; letter-spacing: 0.05em;">PREMIUM ALCOHOL DELIVERY</p>
            </td>
          </tr>

          <!-- Title Banner -->
          <tr>
            <td style="background-color: #fef9e7; padding: 24px; text-align: center; border-bottom: 1px solid #e5e5e5;">
              <h2 style="margin: 0; color: #1a1a1a; font-size: 22px; font-weight: 700;">Your Dashboard Link</h2>
              ${orderName ? `<p style="margin: 8px 0 0; color: #666; font-size: 16px;">for ${orderName}</p>` : ''}
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 24px;">
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                You've been invited to a group order on Party On Delivery. Use the dashboard to build your order together -- everyone picks what they want, and everything gets delivered in one drop-off.
              </p>

              <!-- Feature callouts -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 16px; background-color: #f9fafb; border-radius: 8px; margin-bottom: 8px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right: 12px; vertical-align: top; font-size: 18px;">&#127866;</td>
                        <td>
                          <p style="margin: 0; color: #1a1a1a; font-size: 15px; font-weight: 600;">Browse &amp; add products</p>
                          <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">Beer, wine, spirits, mixers, ice, and party supplies.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #f9fafb; border-radius: 8px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right: 12px; vertical-align: top; font-size: 18px;">&#128101;</td>
                        <td>
                          <p style="margin: 0; color: #1a1a1a; font-size: 15px; font-weight: 600;">Everyone adds their own items</p>
                          <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">Each person can browse and add to the shared order.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #f9fafb; border-radius: 8px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right: 12px; vertical-align: top; font-size: 18px;">&#128666;</td>
                        <td>
                          <p style="margin: 0; color: #1a1a1a; font-size: 15px; font-weight: 600;">One delivery for the whole group</p>
                          <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">Everything arrives together at the time and place you choose.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 36px; background-color: #D4AF37; color: #1a1a1a; text-decoration: none; font-size: 16px; font-weight: 700; border-radius: 6px; letter-spacing: 0.05em;">
                      OPEN DASHBOARD
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0; color: #9ca3af; font-size: 13px; line-height: 1.6; text-align: center;">
                Or copy this link: <a href="${dashboardUrl}" style="color: #1a1a1a; text-decoration: underline;">${dashboardUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 24px; text-align: center;">
              <p style="margin: 0; color: #D4AF37; font-size: 14px;">Questions? Contact us at info@partyondelivery.com</p>
              <p style="margin: 8px 0 0; color: #999; font-size: 12px;">${new Date().getFullYear()} Party On Delivery. Austin, Texas.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

  const text = `Your Dashboard Link${titleSuffix}

You've been invited to a group order on Party On Delivery. Use the dashboard to build your order together -- everyone picks what they want, and everything gets delivered in one drop-off.

What you can do:
- Browse & add products: beer, wine, spirits, mixers, ice, and party supplies
- Everyone adds their own items to the shared order
- One delivery for the whole group at the time and place you choose

Open your dashboard: ${dashboardUrl}

Questions? Contact us at info@partyondelivery.com
${new Date().getFullYear()} Party On Delivery. Austin, Texas.`;

  return { html, text, subject };
}
