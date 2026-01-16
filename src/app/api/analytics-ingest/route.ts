/**
 * Vercel Web Analytics Drain Endpoint
 *
 * Receives web analytics events from Vercel Drains and stores them in PostgreSQL.
 * Designed for reliability and low latency - ingest first, analyze later.
 *
 * @see https://vercel.com/docs/drains/reference/analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyDrainSignature, generateDedupHash } from '@/lib/vercel/drain-verification';
import type { VercelAnalyticsEvent, AnalyticsIngestResponse } from '@/lib/vercel/types';

/**
 * Handle POST requests from Vercel Analytics Drain
 */
export async function POST(request: NextRequest): Promise<NextResponse<AnalyticsIngestResponse>> {
  const startTime = Date.now();

  try {
    // 1. Get raw body for signature verification
    const rawBody = await request.text();

    // 2. Verify signature if secret is configured
    const signature = request.headers.get('x-vercel-signature');
    const secret = process.env.VERCEL_DRAIN_SECRET;

    if (secret && secret.length > 0) {
      if (!verifyDrainSignature(rawBody, signature, secret)) {
        console.error('[Analytics Ingest] Invalid signature');
        return NextResponse.json(
          { success: false, error: 'invalid_signature' },
          { status: 401 }
        );
      }
    }

    // 3. Parse JSON (handles both array and single object)
    let events: VercelAnalyticsEvent[];
    try {
      const parsed = JSON.parse(rawBody);
      events = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      console.error('[Analytics Ingest] Invalid JSON');
      return NextResponse.json(
        { success: false, error: 'invalid_json' },
        { status: 400 }
      );
    }

    // 4. Store events
    const insertedCount = await storeEvents(events);

    // 5. Return success quickly
    const ms = Date.now() - startTime;
    console.log(`[Analytics Ingest] Stored ${insertedCount} events in ${ms}ms`);

    return NextResponse.json({
      success: true,
      count: insertedCount,
      ms,
    });
  } catch (error) {
    console.error('[Analytics Ingest] Error:', error);

    // Return 200 to prevent Vercel retries - log error for investigation
    // This is intentional: we don't want Vercel to keep retrying failed requests
    return NextResponse.json({
      success: true,
      error: 'logged',
      ms: Date.now() - startTime,
    });
  }
}

/**
 * Only accept POST requests
 */
export async function GET(): Promise<NextResponse<AnalyticsIngestResponse>> {
  return NextResponse.json(
    { success: false, error: 'method_not_allowed' },
    { status: 405 }
  );
}

/**
 * Store analytics events in the database
 */
async function storeEvents(events: VercelAnalyticsEvent[]): Promise<number> {
  if (events.length === 0) {
    return 0;
  }

  const records = events.map((event) => {
    // Parse eventData if it's a JSON string
    let parsedEventData = null;
    if (event.eventData) {
      try {
        parsedEventData = JSON.parse(event.eventData);
      } catch {
        // If parsing fails, store as-is in a wrapper object
        parsedEventData = { raw: event.eventData };
      }
    }

    return {
      eventType: event.eventType || 'unknown',
      eventName: event.eventName || null,
      eventData: parsedEventData,
      timestamp: BigInt(event.timestamp || Date.now()),
      sessionId: event.sessionId ? BigInt(event.sessionId) : null,
      deviceId: event.deviceId ? BigInt(event.deviceId) : null,
      origin: event.origin || null,
      path: event.path || null,
      route: event.route || null,
      referrer: event.referrer || null,
      queryParams: event.queryParams || null,
      country: event.country || null,
      region: event.region || null,
      city: event.city || null,
      deviceType: event.deviceType || null,
      osName: event.osName || null,
      osVersion: event.osVersion || null,
      clientName: event.clientName || null,
      clientVersion: event.clientVersion || null,
      projectId: event.projectId || null,
      deployment: event.deployment || null,
      vercelEnv: event.vercelEnvironment || null,
      rawJson: event as object,
      dedupHash: generateDedupHash(event),
    };
  });

  // Use createMany with skipDuplicates for idempotency
  // If a duplicate dedupHash is found, it's silently skipped
  const result = await prisma.vercelAnalyticsEvent.createMany({
    data: records,
    skipDuplicates: true,
  });

  return result.count;
}
