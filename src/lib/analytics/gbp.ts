/**
 * Google Business Profile reviews, via Places API (New).
 *
 * Why Places API instead of the legacy Business Profile API:
 *   The legacy My Business API requires an approval process (weeks-long) and
 *   was retired from the public Cloud Console library. Places API returns up
 *   to the 5 most recent reviews with rating + text + author + timestamp for
 *   any place, with just an API key — plenty of signal for weekly sentiment
 *   trend tracking. Upgrade to the legacy API later if full review history is
 *   ever needed.
 *
 * Env:
 *   GOOGLE_MAPS_API_KEY  — API key restricted to Places API (New)
 *   GOOGLE_PLACE_ID      — e.g. "ChIJc8cN7oDLRIYRY734oDi4Gpo"
 *
 * Persists pulled reviews to GbpReview with inferred segment (wedding / bach
 * / boat / corporate / other) based on simple text heuristics.
 */

import { prisma } from '@/lib/database/client';

export interface GbpInsights {
  reviewCount: number;
  averageRating: number;
  fiveStarPct: number;
  oneStarPct: number;
  latestReviewedAt: string | null;
  totalReviewsOnProfile: number | null; // from Places API (full count on Google, even though we only see 5)
  liveAverageRating: number | null;     // from Places API
}

export interface GbpSegmentSentiment {
  segment: string;
  count: number;
  averageRating: number;
}

interface PlacesReview {
  name: string; // "places/<placeId>/reviews/<reviewId>"
  rating: number;
  text?: { text: string };
  authorAttribution?: { displayName?: string };
  publishTime: string; // ISO
}

interface PlacesDetailsResponse {
  id: string;
  rating?: number;
  userRatingCount?: number;
  reviews?: PlacesReview[];
}

function env(): { apiKey: string; placeId: string } | null {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!apiKey || !placeId) return null;
  return { apiKey, placeId };
}

function inferSegment(text: string | null | undefined): string {
  if (!text) return 'other';
  const t = text.toLowerCase();
  if (/\b(wedding|bride|groom|reception)\b/.test(t)) return 'wedding';
  if (/\b(bachelor|bachelorette|bach party|bach weekend|bach babes)\b/.test(t)) return 'bach';
  if (/\b(boat|lake|party cove|yacht|cruise)\b/.test(t)) return 'boat';
  if (/\b(corporate|office|company event|holiday party|team|tailgate)\b/.test(t)) return 'corporate';
  return 'other';
}

function inferSentiment(rating: number): string {
  if (rating >= 4) return 'positive';
  if (rating === 3) return 'neutral';
  return 'negative';
}

/**
 * Extract just the review-id suffix from the full name path.
 * Places API gives: "places/<placeId>/reviews/<reviewId>"
 */
function extractReviewId(fullName: string): string {
  const parts = fullName.split('/');
  return parts[parts.length - 1];
}

/**
 * Pull the latest reviews (up to 5) from Places API, upsert them.
 * Returns summary + top-level place stats. Null when env isn't configured.
 */
export async function syncGbpReviews(): Promise<{
  pulled: number;
  stored: number;
  profileRating: number | null;
  profileReviewCount: number | null;
} | null> {
  const cfg = env();
  if (!cfg) {
    console.warn('[gbp] GOOGLE_MAPS_API_KEY / GOOGLE_PLACE_ID not set — skipping');
    return null;
  }

  const res = await fetch(`https://places.googleapis.com/v1/places/${cfg.placeId}`, {
    headers: {
      'X-Goog-Api-Key': cfg.apiKey,
      'X-Goog-FieldMask': 'id,rating,userRatingCount,reviews',
    },
  });
  if (!res.ok) {
    console.error('[gbp] Places API fetch failed:', res.status, await res.text());
    return null;
  }

  const data = (await res.json()) as PlacesDetailsResponse;
  const reviews = data.reviews ?? [];
  let stored = 0;

  for (const r of reviews) {
    const reviewId = extractReviewId(r.name);
    const text = r.text?.text ?? null;
    const rating = r.rating ?? 0;
    await prisma.gbpReview.upsert({
      where: { reviewId },
      update: {
        rating,
        text,
        segment: inferSegment(text),
        sentiment: inferSentiment(rating),
      },
      create: {
        reviewId,
        rating,
        text,
        authorName: r.authorAttribution?.displayName ?? null,
        reviewedAt: new Date(r.publishTime),
        segment: inferSegment(text),
        sentiment: inferSentiment(rating),
      },
    });
    stored++;
  }

  return {
    pulled: reviews.length,
    stored,
    profileRating: data.rating ?? null,
    profileReviewCount: data.userRatingCount ?? null,
  };
}

export async function getGbpInsights(windowDays = 30): Promise<GbpInsights> {
  const since = new Date();
  since.setDate(since.getDate() - windowDays);
  const reviews = await prisma.gbpReview.findMany({
    where: { reviewedAt: { gte: since } },
    select: { rating: true, reviewedAt: true },
    orderBy: { reviewedAt: 'desc' },
  });
  const count = reviews.length;
  const average = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  const five = reviews.filter((r) => r.rating === 5).length;
  const one = reviews.filter((r) => r.rating === 1).length;

  // Also surface the live profile-wide stats (Places API caches these in the
  // segmentData on snapshot, but we also expose here as a convenience).
  let profileCount: number | null = null;
  let profileAvg: number | null = null;
  const cfg = env();
  if (cfg) {
    try {
      const res = await fetch(`https://places.googleapis.com/v1/places/${cfg.placeId}`, {
        headers: {
          'X-Goog-Api-Key': cfg.apiKey,
          'X-Goog-FieldMask': 'rating,userRatingCount',
        },
      });
      if (res.ok) {
        const json = (await res.json()) as PlacesDetailsResponse;
        profileCount = json.userRatingCount ?? null;
        profileAvg = json.rating ?? null;
      }
    } catch {
      // Profile stats are optional
    }
  }

  return {
    reviewCount: count,
    averageRating: Number(average.toFixed(2)),
    fiveStarPct: count ? Math.round((five / count) * 1000) / 10 : 0,
    oneStarPct: count ? Math.round((one / count) * 1000) / 10 : 0,
    latestReviewedAt: reviews[0]?.reviewedAt.toISOString() ?? null,
    totalReviewsOnProfile: profileCount,
    liveAverageRating: profileAvg,
  };
}

export async function getSegmentSentiment(windowDays = 365): Promise<GbpSegmentSentiment[]> {
  const since = new Date();
  since.setDate(since.getDate() - windowDays);
  const grouped = await prisma.gbpReview.groupBy({
    by: ['segment'],
    where: { reviewedAt: { gte: since }, segment: { not: null } },
    _count: { _all: true },
    _avg: { rating: true },
  });
  return grouped.map((g) => ({
    segment: g.segment ?? 'other',
    count: g._count._all,
    averageRating: Number((g._avg.rating ?? 0).toFixed(2)),
  }));
}
