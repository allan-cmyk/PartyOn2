'use client';

import Script from 'next/script';
import { type ReactElement } from 'react';

/**
 * Microsoft Clarity — free, unlimited heatmaps, scroll maps, rage/dead click
 * detection, and session replays. No-op when NEXT_PUBLIC_CLARITY_PROJECT_ID
 * is not set; production-only.
 *
 * Setup: https://clarity.microsoft.com → New Project → use the Project ID
 * (the value after `clarity.ms/tag/<id>` in their snippet).
 */
export default function MicrosoftClarity(): ReactElement | null {
  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  if (!projectId || process.env.NODE_ENV !== 'production') return null;

  return (
    <Script
      id="ms-clarity"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${projectId}");
        `,
      }}
    />
  );
}
