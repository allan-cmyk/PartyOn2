/**
 * Dashboard Link Email Template
 * Sent when user requests their dashboard link via the share flow.
 */

export function dashboardLinkEmail(dashboardUrl: string): { html: string; text: string } {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Dashboard Link</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #1e3a5f; padding: 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: 0.05em;">
                PARTY ON DELIVERY
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px 24px;">
              <h2 style="margin: 0 0 16px; color: #111827; font-size: 22px; font-weight: 700;">
                Your Dashboard Link
              </h2>
              <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Here is your Party On Delivery dashboard link. Bookmark this page to easily manage your order, add items, and share with friends.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background-color: #1e3a5f; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; letter-spacing: 0.05em;">
                      OPEN MY DASHBOARD
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Or copy this link: <a href="${dashboardUrl}" style="color: #1e3a5f; text-decoration: underline;">${dashboardUrl}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 16px 24px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Party On Delivery - Austin, TX | (512) 934-1615
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

  const text = `Your Party On Delivery Dashboard Link

Here is your dashboard link. Bookmark this page to manage your order, add items, and share with friends.

${dashboardUrl}

Party On Delivery - Austin, TX | (512) 934-1615`;

  return { html, text };
}
