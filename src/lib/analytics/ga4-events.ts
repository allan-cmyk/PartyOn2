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
 * @param experimentId - Optional experiment ID for A/B test attribution
 * @param variantId - Optional variant ID for A/B test attribution
 */
export function trackCTAClick(
  buttonText: string,
  buttonUrl: string,
  section: 'hero' | 'choose_path' | 'services' | 'footer_cta' | 'navigation',
  experimentId?: string,
  variantId?: string
): void {
  if (!isGtagAvailable()) {
    // Log in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[GA4 Dev] cta_click:', { buttonText, buttonUrl, section, experimentId, variantId });
    }
    return;
  }

  window.gtag?.('event', 'cta_click', {
    button_text: buttonText,
    button_url: buttonUrl,
    section: section,
    page_location: window.location.href,
    ...(experimentId && { experiment_id: experimentId }),
    ...(variantId && { variant_id: variantId }),
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
 * Track hero variant impression for A/B testing
 * @param experimentId - The experiment ID from the database
 * @param variantId - The variant content identifier (e.g., 'control', 'variant-a')
 * @param elementId - The element being tested (default: 'hero')
 */
export function trackHeroVariant(
  experimentId: string,
  variantId: string,
  elementId: string = 'hero'
): void {
  if (!isGtagAvailable()) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[GA4 Dev] experiment_impression:', { experimentId, variantId, elementId });
    }
    return;
  }

  window.gtag?.('event', 'experiment_impression', {
    experiment_id: experimentId,
    variant_id: variantId,
    element_id: elementId,
    page_location: window.location.href,
  });
}

/**
 * Track experiment conversion (purchase, signup, etc.)
 * @param experimentId - The experiment ID
 * @param variantId - The variant ID
 * @param conversionType - Type of conversion (purchase, signup, etc.)
 * @param value - Optional monetary value
 */
export function trackExperimentConversion(
  experimentId: string,
  variantId: string,
  conversionType: 'purchase' | 'signup' | 'lead' | 'checkout',
  value?: number
): void {
  if (!isGtagAvailable()) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[GA4 Dev] experiment_conversion:', { experimentId, variantId, conversionType, value });
    }
    return;
  }

  window.gtag?.('event', 'experiment_conversion', {
    experiment_id: experimentId,
    variant_id: variantId,
    conversion_type: conversionType,
    ...(value !== undefined && { value }),
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
