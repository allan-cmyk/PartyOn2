/**
 * GET /api/public/boat-schedule
 *
 * Read-only public view of the boat schedule. Authenticated via a shared
 * token (PREMIER_SCHEDULE_PUBLIC_KEY env var) rather than ops session
 * so captains can bookmark a URL on their phones.
 *
 * Returns the same schedule structure as /api/ops/boat-schedule but omits
 * internal fields (orphan orders, match confidence/type, match notes).
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function isAuthorized(req: NextRequest): boolean {
  const expected = process.env.PREMIER_SCHEDULE_PUBLIC_KEY;
  if (!expected) return false;
  const header = req.headers.get('x-public-key');
  const query = req.nextUrl.searchParams.get('key');
  const cookie = req.cookies.get('pbs_key')?.value;
  return header === expected || query === expected || cookie === expected;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    // Return 404 so the URL's existence isn't revealed
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  const params = req.nextUrl.searchParams;
  const view = params.get('view') || 'upcoming';
  const from = params.get('from');
  const to = params.get('to');

  let dateFrom: Date;
  let dateTo: Date;

  if (view === 'today') {
    const today = startOfToday();
    dateFrom = today;
    dateTo = today;
  } else if (view === 'upcoming') {
    const today = startOfToday();
    const end = new Date(today);
    end.setDate(today.getDate() + 21);
    dateFrom = today;
    dateTo = end;
  } else if (from && to) {
    dateFrom = new Date(from);
    dateTo = new Date(to);
  } else {
    const now = new Date();
    const dow = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    dateFrom = monday;
    dateTo = sunday;
  }

  const dscEntries = await prisma.boatSchedule.findMany({
    where: {
      isStale: false,
      cruiseDate: { gte: dateFrom, lte: dateTo },
      sheetTab: { contains: 'DSC', mode: 'insensitive' as const },
      clientName: { not: '' },
    },
    include: {
      matches: {
        include: {
          order: {
            select: {
              orderNumber: true,
              fulfillmentStatus: true,
            },
          },
        },
      },
    },
    orderBy: [{ cruiseDate: 'asc' }, { clientName: 'asc' }],
  });

  const dscByDateSlotBoat = new Map<string, typeof dscEntries>();
  const dscUnassignedByDateSlot = new Map<string, typeof dscEntries>();
  for (const d of dscEntries) {
    const slot = (d.timeSlot || '').trim();
    const boatVal = (d.boat || '').trim();
    const iso = toISODate(d.cruiseDate);
    if (boatVal && boatVal.toUpperCase() !== 'UNASSIGNED') {
      const key = `${iso}|${slot}|${boatVal.toLowerCase()}`;
      const existing = dscByDateSlotBoat.get(key);
      if (existing) existing.push(d);
      else dscByDateSlotBoat.set(key, [d]);
    } else {
      const key = `${iso}|${slot}`;
      const existing = dscUnassignedByDateSlot.get(key);
      if (existing) existing.push(d);
      else dscUnassignedByDateSlot.set(key, [d]);
    }
  }

  const entries = await prisma.boatSchedule.findMany({
    where: {
      isStale: false,
      cruiseDate: { gte: dateFrom, lte: dateTo },
      NOT: { sheetTab: { contains: 'DSC', mode: 'insensitive' as const } },
    },
    include: {
      matches: {
        include: {
          order: {
            select: {
              orderNumber: true,
              fulfillmentStatus: true,
            },
          },
        },
      },
    },
    orderBy: [{ cruiseDate: 'asc' }, { timeSlot: 'asc' }, { boat: 'asc' }],
  });

  let filteredEntries = entries;
  if (view === 'upcoming') {
    const datesWithBookings = new Set(
      entries
        .filter(e => e.clientName && e.clientName.trim() !== '')
        .map(e => toISODate(e.cruiseDate)),
    );
    filteredEntries = entries.filter(e => datesWithBookings.has(toISODate(e.cruiseDate)));
  }

  const grouped: Record<string, Record<string, unknown[]>> = {};
  for (const entry of filteredEntries) {
    const d = toISODate(entry.cruiseDate);
    const ts = entry.timeSlot || 'unscheduled';
    if (!grouped[d]) grouped[d] = {};
    if (!grouped[d][ts]) grouped[d][ts] = [];

    const match = entry.matches[0];
    const order = match?.order;

    const isDiscoRow = (entry.clientName || '').trim().toLowerCase() === 'disco';
    let discoBookings: unknown[] = [];
    if (isDiscoRow) {
      const iso = toISODate(entry.cruiseDate);
      const slot = (entry.timeSlot || '').trim();
      const assignedKey = `${iso}|${slot}|${entry.boat.toLowerCase()}`;
      const unassignedKey = `${iso}|${slot}`;
      const matches = [
        ...(dscByDateSlotBoat.get(assignedKey) || []),
        ...(dscUnassignedByDateSlot.get(unassignedKey) || []),
      ];
      discoBookings = matches.map(b => {
        const m = b.matches[0];
        const o = m?.order;
        return {
          id: b.id,
          clientName: b.clientName,
          clientPhone: b.clientPhone,
          headcount: b.headcount,
          package: b.package,
          addOns: b.addOns,
          podFlag: b.podFlag,
          occasion: b.occasion,
          order: o
            ? {
                orderNumber: o.orderNumber,
                fulfillmentStatus: o.fulfillmentStatus,
              }
            : null,
        };
      });
    }

    grouped[d][ts].push({
      id: entry.id,
      boat: entry.boat,
      timeSlot: entry.timeSlot,
      clientName: entry.clientName,
      clientPhone: entry.clientPhone,
      occasion: entry.occasion,
      headcount: entry.headcount,
      addOns: entry.addOns,
      podFlag: entry.podFlag,
      captainCrew: entry.captainCrew,
      dj: entry.dj,
      photographer: entry.photographer,
      avgAge: entry.avgAge,
      type: isDiscoRow ? 'disco' : 'private',
      isDiscoRow,
      discoBookings,
      order: order
        ? {
            orderNumber: order.orderNumber,
            fulfillmentStatus: order.fulfillmentStatus,
          }
        : null,
    });
  }

  return NextResponse.json({
    dateRange: { from: toISODate(dateFrom), to: toISODate(dateTo) },
    schedule: grouped,
  });
}
