/**
 * @fileoverview Topic Cluster Configuration for SEO-optimized blog structure
 * @module lib/topic-clusters
 *
 * This file defines the pillar-cluster relationship for internal linking.
 * Each pillar page is a comprehensive guide that links to all cluster pages,
 * and each cluster page links back to its pillar.
 */

export interface TopicCluster {
  /** The pillar page slug */
  pillarSlug: string;
  /** The pillar page title */
  pillarTitle: string;
  /** The category this cluster covers */
  category: string;
  /** Service page URL for CTAs */
  serviceUrl: string;
  /** Cluster page slugs that link to this pillar */
  clusterSlugs: string[];
}

/**
 * Topic cluster definitions for PartyOn blog
 * Each cluster has one pillar page and multiple cluster (subtopic) pages
 */
export const TOPIC_CLUSTERS: TopicCluster[] = [
  {
    pillarSlug: 'ultimate-guide-austin-corporate-events',
    pillarTitle: 'The Ultimate Guide to Austin Corporate Events',
    category: 'Corporate Events',
    serviceUrl: '/corporate',
    clusterSlugs: [
      'how-to-choose-the-right-venue-for-your-austin-corporate-event',
      'top-corporate-catering-options-for-austin-business-events',
      'fun-team-building-activities-around-austin',
      'corporate-holiday-party-ideas-for-austin-companies',
      'how-to-organize-transportation-for-large-company-events',
      'professional-bar-service-and-responsible-drinking-for-events',
      'best-live-entertainment-ideas-for-austin-corporate-functions',
      'how-to-budget-for-a-mid-size-austin-corporate-event',
      'austin-venues-with-built-in-a-v-and-networking-spaces',
      'how-to-create-branded-photo-moments-for-corporate-events',
      'corporate-event-bar-service-tips-for-austin-businesses',
      'how-to-plan-a-successful-corporate-networking-event-in-austin',
      'essential-bar-setup-checklist-for-austin-office-parties',
      'corporate-client-appreciation-event-ideas-in-austin',
      'how-to-host-a-professional-happy-hour-for-your-austin-team',
    ],
  },
  {
    pillarSlug: 'ultimate-guide-austin-bachelor-parties',
    pillarTitle: 'The Ultimate Guide to Austin Bachelor Parties',
    category: 'Bachelor Parties',
    serviceUrl: '/bach-parties',
    clusterSlugs: [
      'best-bbq-spots-for-a-bachelor-party-lunch-in-austin',
      'top-party-boat-rentals-for-austin-bachelor-weekends',
      'how-to-plan-a-brewery-crawl-on-austin-s-east-side',
      'unique-bachelor-party-ideas-beyond-the-bar-scene',
      'best-airbnb-neighborhoods-for-bachelor-parties-in-austin',
      'how-to-create-a-stress-free-bachelor-itinerary-in-austin',
      'austin-s-best-axe-throwing-and-adventure-activities-for-bachelor-parties',
      'what-to-pack-for-a-bachelor-weekend-on-lake-travis',
      'how-to-book-vip-nightlife-and-bottle-service-in-austin',
      'austin-bachelor-party-do-s-and-don-ts-for-first-time-planners',
    ],
  },
  {
    pillarSlug: 'ultimate-guide-austin-bachelorette-parties',
    pillarTitle: 'The Ultimate Guide to Austin Bachelorette Parties',
    category: 'Bachelorette Parties',
    serviceUrl: '/bach-parties',
    clusterSlugs: [
      'how-to-split-costs-fairly-for-a-bachelorette-weekend-in-austin',
      'best-austin-bachelorette-themes-and-matching-outfit-ideas',
      'top-brunch-spots-for-an-austin-bachelorette-crew',
      'spa-and-wellness-retreat-ideas-for-a-relaxing-bachelorette',
      'the-ultimate-guide-to-austin-s-instagram-worthy-photo-ops',
      'how-to-build-a-group-playlist-for-your-austin-bach-trip',
      'unique-airbnbs-for-large-bachelorette-groups-in-austin',
      'diy-austin-bachelorette-scavenger-hunt-ideas',
      'where-to-find-custom-party-favors-and-decor-in-austin',
      'how-to-host-a-bachelorette-pool-party-on-lake-travis',
    ],
  },
  {
    pillarSlug: 'ultimate-guide-austin-wedding-bar-service',
    pillarTitle: 'The Ultimate Guide to Austin Wedding Bar Service',
    category: 'Weddings',
    serviceUrl: '/weddings',
    clusterSlugs: [
      'how-to-plan-a-hill-country-wedding-in-under-six-months',
      'best-small-wedding-venues-near-austin',
      'how-to-build-a-stress-free-wedding-vendor-checklist',
      'local-austin-florists-and-caterers-for-texas-style-weddings',
      'how-to-plan-a-friday-or-sunday-wedding-to-save-money',
      'austin-elopement-ideas-for-minimalist-couples',
      'how-to-blend-rustic-and-modern-wedding-decor-in-texas',
      'wedding-photography-locations-around-austin-s-lakes-and-hills',
      'how-to-plan-a-rehearsal-dinner-at-austin-restaurants',
      'all-inclusive-austin-wedding-venues-with-packages',
      'signature-wedding-cocktails-perfect-for-texas-heat',
    ],
  },
  {
    pillarSlug: 'ultimate-guide-lake-travis-boat-parties',
    pillarTitle: 'The Ultimate Guide to Lake Travis Boat Parties',
    category: 'Boat Parties',
    serviceUrl: '/boat-parties',
    clusterSlugs: [
      'essential-checklist-for-your-lake-travis-party-boat-day',
      'best-party-barge-rentals-in-austin-for-large-groups',
      'how-to-create-the-perfect-boat-party-playlist',
      'food-and-drink-ideas-for-your-byob-austin-boat-party',
      'top-safety-tips-for-renting-a-party-boat',
      'how-to-throw-a-birthday-bash-on-lake-austin',
      'budgeting-your-boat-rental-and-extras-for-the-day',
      'what-to-wear-and-pack-for-an-austin-boat-party',
      'best-time-of-year-for-boat-parties-on-lake-travis',
      'how-to-book-a-double-decker-barge-for-your-group',
      'ultimate-guide-to-austin-boat-parties-on-lake-travis',
    ],
  },
  {
    pillarSlug: 'ultimate-guide-ut-tailgating',
    pillarTitle: 'The Ultimate Guide to UT Football Tailgating',
    category: 'Tailgating',
    serviceUrl: '/products',
    clusterSlugs: [
      'where-to-tailgate-for-ut-football-games-in-austin',
      'best-tailgate-food-and-bbq-recipes-for-longhorn-fans',
      'what-to-pack-for-a-perfect-austin-tailgate-setup',
      'how-to-legally-tailgate-near-dkr-texas-memorial-stadium',
      'tailgate-playlist-ideas-to-hype-your-crowd',
      'how-to-decorate-your-tailgate-like-a-pro',
      'longhorn-themed-cocktail-and-mocktail-recipes',
      'group-tailgate-games-everyone-will-love',
      'how-to-find-parking-and-setup-zones-for-austin-tailgates',
      'eco-friendly-tailgating-how-to-clean-up-responsibly',
    ],
  },
];

/**
 * Find the pillar page for a given cluster page slug
 * @param clusterSlug - The slug of the cluster page
 * @returns The topic cluster containing this slug, or undefined
 */
export function findPillarForCluster(clusterSlug: string): TopicCluster | undefined {
  return TOPIC_CLUSTERS.find(cluster =>
    cluster.clusterSlugs.includes(clusterSlug)
  );
}

/**
 * Find the topic cluster for a given category
 * @param category - The category name
 * @returns The topic cluster for this category, or undefined
 */
export function findClusterByCategory(category: string): TopicCluster | undefined {
  return TOPIC_CLUSTERS.find(cluster =>
    cluster.category.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Check if a slug is a pillar page
 * @param slug - The page slug to check
 * @returns true if this is a pillar page
 */
export function isPillarPage(slug: string): boolean {
  return TOPIC_CLUSTERS.some(cluster => cluster.pillarSlug === slug);
}

/**
 * Get related cluster pages for a given slug (excluding the current page)
 * @param slug - The current page slug
 * @returns Array of related cluster slugs
 */
export function getRelatedClusterPages(slug: string): string[] {
  const cluster = findPillarForCluster(slug);
  if (!cluster) return [];

  return cluster.clusterSlugs.filter(s => s !== slug);
}

/**
 * Generate the pillar link section for a cluster page
 * @param clusterSlug - The cluster page slug
 * @returns Markdown string with pillar link, or empty string
 */
export function generatePillarLinkSection(clusterSlug: string): string {
  const cluster = findPillarForCluster(clusterSlug);
  if (!cluster) return '';

  return `
---

*This article is part of our comprehensive [${cluster.pillarTitle}](/blog/${cluster.pillarSlug}). Explore the full guide for more tips and resources.*
`;
}

/**
 * Generate related articles section for a cluster page
 * @param clusterSlug - The cluster page slug
 * @param limit - Maximum number of related articles (default 3)
 * @returns Markdown string with related article links
 */
export function generateRelatedArticlesSection(clusterSlug: string, limit = 3): string {
  const related = getRelatedClusterPages(clusterSlug).slice(0, limit);
  if (related.length === 0) return '';

  const links = related.map(slug => {
    // Convert slug to title (basic transformation)
    const title = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return `- [${title}](/blog/${slug})`;
  }).join('\n');

  return `
## Related Articles

${links}
`;
}
