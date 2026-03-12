const BASE_URL = 'https://partyondelivery.com';

interface EmbedParams {
  code: string;
  customerPerk: string;
  tagline?: string;
  buttonText?: string;
  partnerLabel?: string;
}

function getPerkHtml(code: string, customerPerk: string): string {
  const perkLower = customerPerk.toLowerCase();
  if (perkLower === 'free delivery') {
    return `<span style="color:#F2D34F;font-size:12px;font-weight:600;">FREE DELIVERY</span><span style="color:rgba(255,255,255,0.7);font-size:12px;"> with code </span><span style="color:#F2D34F;font-size:12px;font-weight:600;">${code}</span>`;
  }
  return `<span style="color:rgba(255,255,255,0.7);font-size:12px;">Use code </span><span style="color:#F2D34F;font-size:12px;font-weight:600;">${code}</span><span style="color:rgba(255,255,255,0.7);font-size:12px;"> for </span><span style="color:#F2D34F;font-size:12px;font-weight:600;">${customerPerk}</span>`;
}

export function generateBannerHtml(params: EmbedParams): string {
  const { code, customerPerk } = params;
  const tagline = params.tagline || 'Cold drinks. On time. Best buy-back policy in Austin.';
  const buttonText = params.buttonText || 'Order Now';
  const href = code ? `${BASE_URL}/order?ref=${code}` : `${BASE_URL}/order`;
  const perkLine = code
    ? `<div style="display:inline-block;background:rgba(242,211,79,0.15);border:1px solid rgba(242,211,79,0.3);border-radius:6px;padding:4px 10px;margin-top:8px;">${getPerkHtml(code, customerPerk)}</div>`
    : '';

  return `<a href="${href}" target="_blank" rel="noopener" style="display:block;max-width:600px;width:100%;text-decoration:none;border-radius:12px;overflow:hidden;font-family:'Barlow Condensed',Arial,Helvetica,sans-serif;"><!--[if mso]><table role="presentation" width="600"><tr><td><![endif]--><div style="position:relative;min-height:140px;border-radius:12px;overflow:hidden;"><div style="position:absolute;top:0;left:0;right:0;bottom:0;background:url('${BASE_URL}/images/gallery/sunset-champagne-pontoon.webp') center/cover no-repeat;"></div><div style="position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(90deg,rgba(10,22,40,0.92) 0%,rgba(10,22,40,0.7) 50%,rgba(10,22,40,0.4) 100%);"></div><div style="position:relative;padding:20px 28px;display:flex;align-items:center;gap:20px;min-height:140px;flex-wrap:wrap;"><div style="flex:1;min-width:200px;"><img src="${BASE_URL}/images/pod-logo-embed.png" alt="Party On Delivery" style="height:40px;width:auto;display:block;margin-bottom:8px;" /><div style="color:rgba(255,255,255,0.8);font-size:13px;font-family:Arial,Helvetica,sans-serif;">${tagline}</div>${perkLine}</div><div style="flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:10px;"><div style="background:#F2D34F;color:#0a1628;padding:10px 20px;border-radius:8px;font-weight:700;font-size:13px;letter-spacing:1px;text-transform:uppercase;">${buttonText}</div></div></div></div><!--[if mso]></td></tr></table><![endif]--></a>`;
}

export function generateCardHtml(params: EmbedParams): string {
  const { code, customerPerk } = params;
  const tagline = params.tagline || 'Cold drinks. On time. Best buy-back policy in Austin.';
  const cardTagline = tagline.includes('. ') ? tagline.replace(/\. /g, '.<br>') : tagline;
  const buttonText = params.buttonText || 'Order Now';
  const partnerLabel = params.partnerLabel || 'Official Partner';
  const href = code ? `${BASE_URL}/order?ref=${code}` : `${BASE_URL}/order`;
  const perkLine = code
    ? `<div style="background:rgba(242,211,79,0.12);border:1px solid rgba(242,211,79,0.25);border-radius:8px;padding:8px 16px;">${getPerkHtml(code, customerPerk)}</div>`
    : '';

  return `<a href="${href}" target="_blank" rel="noopener" style="display:block;max-width:350px;width:100%;text-decoration:none;border-radius:12px;overflow:hidden;font-family:'Barlow Condensed',Arial,Helvetica,sans-serif;"><!--[if mso]><table role="presentation" width="350"><tr><td><![endif]--><div style="border-radius:12px;overflow:hidden;"><div style="position:relative;height:160px;"><div style="position:absolute;top:0;left:0;right:0;bottom:0;background:url('${BASE_URL}/images/hero/hero-drink-skyline.webp') center/cover no-repeat;"></div><div style="position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(180deg,rgba(10,22,40,0.3) 0%,rgba(10,22,40,0.6) 100%);"></div><div style="position:relative;height:100%;display:flex;align-items:center;justify-content:center;"><div style="text-align:center;"><img src="${BASE_URL}/images/pod-logo-embed.png" alt="Party On Delivery" style="height:44px;width:auto;display:inline-block;margin-bottom:4px;" /><div style="color:#F2D34F;font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">${partnerLabel}</div></div></div></div><div style="background:#0a1628;padding:20px 24px;display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;"><div style="color:rgba(255,255,255,0.8);font-size:13px;line-height:1.5;font-family:Arial,Helvetica,sans-serif;">${cardTagline}</div>${perkLine}<div style="background:#F2D34F;color:#0a1628;padding:10px 28px;border-radius:8px;font-weight:700;font-size:13px;letter-spacing:1px;text-transform:uppercase;margin-top:4px;">${buttonText}</div></div></div><!--[if mso]></td></tr></table><![endif]--></a>`;
}
