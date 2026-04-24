/**
 * POST /api/v1/events/track
 *
 * Accepts a batch of analytics events from the browser. Designed to be hit
 * frequently by the client tracker (every ~5s during a session, plus once on
 * unload via navigator.sendBeacon).
 *
 * Body: { events: [{ name, occurredAt?, sessionId, visitorId?, path?, ... }, ...] }
 *
 * Auth: none (this is public ingest, like a tracking pixel). Per-IP rate
 * limiting can be added later via middleware if abuse becomes an issue.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/database/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const EventSchema = z.object({
  name: z.string().min(1).max(64),
  occurredAt: z.string().datetime().optional(),
  sessionId: z.string().min(1).max(64),
  visitorId: z.string().max(64).optional().nullable(),
  path: z.string().max(512).optional().nullable(),
  fullUrl: z.string().max(2048).optional().nullable(),
  referrer: z.string().max(2048).optional().nullable(),
  utmSource: z.string().max(128).optional().nullable(),
  utmMedium: z.string().max(128).optional().nullable(),
  utmCampaign: z.string().max(128).optional().nullable(),
  experimentId: z.string().max(64).optional().nullable(),
  variantId: z.string().max(64).optional().nullable(),
  customerId: z.string().max(64).optional().nullable(),
  orderId: z.string().max(64).optional().nullable(),
  properties: z.record(z.string(), z.unknown()).optional().nullable(),
});

const BatchSchema = z.object({
  events: z.array(EventSchema).min(1).max(50),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = BatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: 'invalid payload', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    await prisma.analyticsEvent.createMany({
      data: parsed.data.events.map((e) => ({
        name: e.name,
        occurredAt: e.occurredAt ? new Date(e.occurredAt) : new Date(),
        sessionId: e.sessionId,
        visitorId: e.visitorId ?? null,
        path: e.path ?? null,
        fullUrl: e.fullUrl ?? null,
        referrer: e.referrer ?? null,
        utmSource: e.utmSource ?? null,
        utmMedium: e.utmMedium ?? null,
        utmCampaign: e.utmCampaign ?? null,
        experimentId: e.experimentId ?? null,
        variantId: e.variantId ?? null,
        customerId: e.customerId ?? null,
        orderId: e.orderId ?? null,
        properties: (e.properties ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      })),
      skipDuplicates: false,
    });

    return NextResponse.json({ ok: true, count: parsed.data.events.length });
  } catch (err) {
    // Never fail the client; log and 200 — analytics losing a batch is fine.
    console.error('[events/track] write failed:', err);
    return NextResponse.json({ ok: false, error: 'write failed' }, { status: 200 });
  }
}
