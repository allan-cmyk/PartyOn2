/**
 * Measurement cron — closes the recommendation outcome loop.
 *
 * Runs daily. For every shipped recommendation that has a resultMetricBefore but
 * no resultMetricAfter, and shippedAt is at least MEASUREMENT_WINDOW_DAYS ago,
 * captures a fresh metric snapshot into resultMetricAfter and re-mirrors the file.
 *
 * Auth: Bearer CRON_SECRET (same as other crons).
 *
 * vercel.json: { "path": "/api/cron/measure-recommendations", "schedule": "0 14 * * *" }
 */

import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/database/client';
import { mirrorRecommendation } from '@/lib/analytics/recommendation-mirror';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const MEASUREMENT_WINDOW_DAYS = 14;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - MEASUREMENT_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const due = await prisma.recommendationItem.findMany({
    where: {
      status: 'shipped',
      shippedAt: { lte: cutoff },
      resultMetricBefore: { not: undefined },
      resultMetricAfter: { equals: undefined },
    },
    take: 50,
  });

  if (due.length === 0) {
    return NextResponse.json({ ok: true, measured: 0, note: 'no recommendations due for measurement' });
  }

  const snapshot = await prisma.analyticsSnapshot.findFirst({
    orderBy: { date: 'desc' },
    select: {
      date: true,
      revenue: true,
      orders: true,
      averageOrderValue: true,
      marginData: true,
      segmentData: true,
    },
  });

  if (!snapshot) {
    return NextResponse.json({ ok: false, error: 'no analytics snapshot available for measurement' }, { status: 503 });
  }

  const marginData = (snapshot.marginData ?? {}) as { coveragePct?: number; affiliateRoi?: unknown[] };
  const segmentData = (snapshot.segmentData ?? {}) as { segments?: unknown[] };

  const after: Record<string, unknown> = {
    capturedAt: new Date().toISOString(),
    snapshotDate: snapshot.date.toISOString().slice(0, 10),
    revenue: Number(snapshot.revenue ?? 0),
    orders: snapshot.orders,
    averageOrderValue: Number(snapshot.averageOrderValue ?? 0),
    marginCoveragePct: marginData.coveragePct ?? null,
    affiliateRoi: marginData.affiliateRoi ?? null,
    segments: segmentData.segments ?? null,
  };

  const measured: Array<{ id: string; title: string; mirrored: boolean }> = [];

  for (const rec of due) {
    const updated = await prisma.recommendationItem.update({
      where: { id: rec.id },
      data: { resultMetricAfter: after as Prisma.InputJsonValue },
    });
    const mirror = await mirrorRecommendation(updated, {
      date: new Date().toISOString().slice(0, 10),
      fromStatus: 'shipped',
      toStatus: 'shipped',
      notes: 'Auto-captured 14-day measurement',
      actor: 'cron:measure-recommendations',
    });
    measured.push({ id: rec.id, title: rec.title, mirrored: mirror.mirrored });
  }

  return NextResponse.json({ ok: true, measured: measured.length, items: measured });
}
