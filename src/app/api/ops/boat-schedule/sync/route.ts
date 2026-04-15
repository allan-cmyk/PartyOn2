/**
 * POST /api/ops/boat-schedule/sync
 *
 * Reads the Premier Google Sheet, parses into structured data,
 * upserts to `boat_schedule`, and runs auto-matching against orders.
 *
 * Auth: ops session cookie OR x-api-key header matching BOAT_SCHEDULE_SYNC_KEY
 *
 * Body (optional): { "tabs": ["04-PVT", "04-DSC"], "triggeredBy": "cowork" }
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { getOpsSession } from '@/lib/auth/ops-session';
import {
  readGoogleSheet,
  parseSheet,
  type ParsedBooking,
} from '@/lib/premier/sheet-parser';
import { runMatching, insertMatches } from '@/lib/premier/matcher';

const DEFAULT_TABS = ['04-PVT', '04-DSC'];

async function isAuthorized(req: NextRequest): Promise<boolean> {
  const apiKey = req.headers.get('x-api-key');
  const expected = process.env.BOAT_SCHEDULE_SYNC_KEY;
  if (expected && apiKey && apiKey === expected) return true;

  const session = await getOpsSession();
  return session !== null;
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const tabs: string[] = Array.isArray(body.tabs) && body.tabs.length > 0 ? body.tabs : DEFAULT_TABS;
  const triggeredBy: string = body.triggeredBy || 'manual';

  const syncLog = await prisma.syncLog.create({
    data: { triggeredBy, status: 'running' },
  });

  const allBookings: ParsedBooking[] = [];
  const allErrors: Array<Record<string, unknown>> = [];

  try {
    // Read and parse each tab
    for (const tab of tabs) {
      try {
        const sheetData = await readGoogleSheet(tab);
        const { bookings, warnings } = parseSheet(sheetData, tab);
        allBookings.push(...bookings);
        if (warnings.length > 0) allErrors.push({ tab, warnings });
      } catch (err) {
        allErrors.push({ tab, error: err instanceof Error ? err.message : String(err) });
      }
    }

    // Mark existing rows in these tabs as potentially stale
    await prisma.boatSchedule.updateMany({
      where: { sheetTab: { in: tabs } },
      data: { isStale: true },
    });

    // Upsert parsed bookings
    let upserted = 0;
    for (const b of allBookings) {
      try {
        const clientNameKey = b.clientName ?? '';
        await prisma.boatSchedule.upsert({
          where: {
            cruiseDate_timeSlot_boat_clientName: {
              cruiseDate: new Date(b.cruiseDate),
              timeSlot: b.timeSlot,
              boat: b.boat,
              clientName: clientNameKey,
            },
          },
          create: {
            sheetTab: b.sheetTab,
            cruiseDate: new Date(b.cruiseDate),
            dayOfWeek: b.dayOfWeek || null,
            weekType: b.weekType || null,
            timeSlot: b.timeSlot,
            boat: b.boat,
            clientName: clientNameKey,
            clientPhone: b.clientPhone,
            normalizedName: b.normalizedName,
            normalizedPhone: b.normalizedPhone,
            package: b.package,
            addOns: b.addOns,
            occasion: b.occasion,
            avgAge: b.avgAge,
            headcount: b.headcount,
            dj: b.dj,
            photographer: b.photographer,
            tip: b.tip,
            amount: b.amount,
            podFlag: b.podFlag,
            captainCrew: b.captainCrew,
            sheetRow: b.sheetRow,
            rawData: b.rawData,
            isStale: false,
            lastSeenAt: new Date(),
          },
          update: {
            sheetTab: b.sheetTab,
            dayOfWeek: b.dayOfWeek || null,
            weekType: b.weekType || null,
            clientName: clientNameKey,
            clientPhone: b.clientPhone,
            normalizedName: b.normalizedName,
            normalizedPhone: b.normalizedPhone,
            package: b.package,
            addOns: b.addOns,
            occasion: b.occasion,
            avgAge: b.avgAge,
            headcount: b.headcount,
            dj: b.dj,
            photographer: b.photographer,
            tip: b.tip,
            amount: b.amount,
            podFlag: b.podFlag,
            captainCrew: b.captainCrew,
            sheetRow: b.sheetRow,
            rawData: b.rawData,
            isStale: false,
            lastSeenAt: new Date(),
          },
        });
        upserted++;
      } catch (err) {
        allErrors.push({
          row: b.sheetRow,
          booking: `${b.cruiseDate} ${b.boat} ${b.clientName}`,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    const staleCount = await prisma.boatSchedule.count({
      where: { isStale: true, sheetTab: { in: tabs } },
    });

    // Run matching
    let autoMatched = 0;
    let needsReview = 0;
    let unmatchedBookings = 0;
    let unmatchedOrders = 0;

    try {
      const matchResult = await runMatching();
      await insertMatches(matchResult.matches);
      autoMatched = matchResult.matches.filter(m => m.status === 'matched').length;
      needsReview = matchResult.matches.filter(m => m.status === 'needs_review').length;
      unmatchedBookings = matchResult.unmatched.length;
      unmatchedOrders = matchResult.orphanOrders.length;
    } catch (err) {
      allErrors.push({
        phase: 'matching',
        error: err instanceof Error ? err.message : String(err),
      });
    }

    const status = allErrors.length === 0 ? 'success' : 'partial';

    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        completedAt: new Date(),
        status,
        rowsParsed: allBookings.length,
        rowsUpserted: upserted,
        rowsStale: staleCount,
        autoMatched,
        needsReview,
        unmatchedBookings,
        unmatchedOrders,
        errors: allErrors as object,
      },
    });

    return NextResponse.json({
      status,
      syncId: syncLog.id,
      rows_parsed: allBookings.length,
      rows_upserted: upserted,
      rows_stale: staleCount,
      auto_matched: autoMatched,
      needs_review: needsReview,
      unmatched_bookings: unmatchedBookings,
      unmatched_orders: unmatchedOrders,
      errors: allErrors.length > 0 ? allErrors : undefined,
    });
  } catch (err) {
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        completedAt: new Date(),
        status: 'failed',
        errors: [{ fatal: err instanceof Error ? err.message : String(err) }],
      },
    });
    return NextResponse.json(
      { status: 'failed', error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

// GET -- status check
export async function GET(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const lastSync = await prisma.syncLog.findFirst({
    orderBy: { startedAt: 'desc' },
  });

  const [activeCount, staleCount, matchedCount, needsReviewCount] = await Promise.all([
    prisma.boatSchedule.count({ where: { isStale: false } }),
    prisma.boatSchedule.count({ where: { isStale: true } }),
    prisma.scheduleOrderMatch.count({ where: { status: 'matched' } }),
    prisma.scheduleOrderMatch.count({ where: { status: 'needs_review' } }),
  ]);

  return NextResponse.json({
    lastSync,
    schedule: { active: activeCount, stale: staleCount },
    matches: { matched: matchedCount, needs_review: needsReviewCount },
  });
}
