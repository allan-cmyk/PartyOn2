/**
 * GA4 Custom Event Tracking for A/B Testing
 * @module lib/analytics/ga4-events
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Check if gtag is available (only in production with GA4 configured)
 */
function isGtagAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

/**
 * Track CTA button clicks for A/B testing
 * @param buttonText - The text displayed on the button
 * @param buttonUrl - The destination URL
 * @param section - The page section (hero, choose_path, services, footer_cta)
 */
export function trackCTAClick(
  buttonText: string,
  buttonUrl: string,
  section: 'hero' | 'choose_path' | 'services' | 'footer_cta' | 'navigation'
): void {
  if (!isGtagAvailable()) {
    // Log in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[GA4 Dev] cta_click:', { buttonText, buttonUrl, section });
    }
    return;
  }

  window.gtag?.('event', 'cta_click', {
    button_text: buttonText,
    button_url: buttonUrl,
    section: section,
    page_location: window.location.href,
  });
}

/**
 * Track scroll depth milestones (25%, 50%, 75%, 100%)
 * @param percentage - The scroll percentage reached
 */
export function trackScrollDepth(percentage: 25 | 50 | 75 | 100): void {
  if (!isGtagAvailable()) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[GA4 Dev] scroll_depth:', { percentage });
    }
    return;
  }

  window.gtag?.('event', 'scroll_depth', {
    percent_scrolled: percentage,
    page_location: window.location.href,
  });
}

/**
 * Track section visibility (when user scrolls into a section)
 * @param sectionName - The name of the section viewed
 */
export function trackSectionView(sectionName: string): void {
  if (!isGtagAvailable()) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[GA4 Dev] section_view:', { sectionName });
    }
    return;
  }

  window.gtag?.('event', 'section_view', {
    section_name: sectionName,
    page_location: window.location.href,
  });
}

/**
 * Track hero variant for A/B testing
 * @param variant - The hero variant identifier (e.g., 'A', 'B', 'control')
 */
export function trackHeroVariant(variant: string): void {
  if (!isGtagAvailable()) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[GA4 Dev] hero_variant:', { variant });
    }
    return;
  }

  window.gtag?.('event', 'experiment_impression', {
    experiment_id: 'homepage_hero_test',
    variant_id: variant,
    page_location: window.location.href,
  });
}

/**
 * Track time spent on page before first interaction
 * @param seconds - Time in seconds before first click/scroll
 */
export function trackEngagementTime(seconds: number): void {
  if (!isGtagAvailable()) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[GA4 Dev] engagement_time:', { seconds });
    }
    return;
  }

  window.gtag?.('event', 'first_interaction', {
    time_to_interact: seconds,
    page_location: window.location.href,
  });
}

/**
 * Track outbound link clicks
 * @param url - The external URL clicked
 * @param linkText - The text of the link
 */
export function trackOutboundClick(url: string, linkText: string): void {
  if (!isGtagAvailable()) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[GA4 Dev] outbound_click:', { url, linkText });
    }
    return;
  }

  window.gtag?.('event', 'click', {
    event_category: 'outbound',
    event_label: linkText,
    transport_type: 'beacon',
    link_url: url,
  });
}
