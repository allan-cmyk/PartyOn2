'use client';

/**
 * HeroSectionExperimental
 * Wrapper component that handles A/B test variant assignment
 * and passes the appropriate variant to HeroSection
 */

import { ReactElement } from 'react';
import HeroSection from './HeroSection';
import { useExperimentVariant } from '@/hooks/useExperimentVariant';

/**
 * Experimental Hero Section with A/B Testing
 *
 * This component:
 * 1. Checks for active experiments on page "/" with elementId "hero"
 * 2. Assigns a variant to the visitor (persisted in 30-day cookie)
 * 3. Renders HeroSection with the assigned variant content
 * 4. Tracks impressions and clicks with experiment context
 *
 * If no active experiment exists, it renders the default (control) hero.
 */
export default function HeroSectionExperimental(): ReactElement {
  const { variant, experimentId, isLoading } = useExperimentVariant('/', 'hero');

  // During loading, still render the hero with default content
  // This prevents layout shift and maintains fast LCP
  // The variant will be applied once loaded (usually within ~100ms)
  if (isLoading) {
    // Render default hero immediately - variant tracking will fire once loaded
    return <HeroSection />;
  }

  // If we have an active experiment, pass the variant
  if (experimentId && variant) {
    return (
      <HeroSection
        variant={variant}
        experimentId={experimentId}
      />
    );
  }

  // No active experiment - render default hero
  return <HeroSection />;
}
