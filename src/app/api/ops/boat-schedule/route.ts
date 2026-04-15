/**
 * GET /api/ops/boat-schedule -- dashboard data
 * POST /api/ops/boat-schedule -- manual link/unlink/confirm/dismiss
 *
 * Query params: ?view=exceptions|today|weekly ?date=YYYY-MM-DD ?from=YYYY-MM-DD&to=YYYY-MM-DD ?boat=...
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { requireOpsAuth } from '@/lib/auth/ops-session';
import { manualMatch, unmatch, updateMatchStatus } from '@/lib/premier/matcher';

export async function GET(req: NextRequest) {
  const auth = await requireOpsAuth();
  if (auth instanceof NextResponse) return auth;

  const params = req.nextUrl.searchParams;
  const view = params.get('view') || 'weekly';
  const date = params.get('date');
  const from = params.get('from');
  const to = params.get('to');
  const boat = params.get('boat');

  let dateFrom: Date;
  let dateTo: Date;

  if (view === 'today') {
    const today = startOfToday();
    dateFrom = today;
    dateTo = today;
  } else if (view === 'upcoming') {
    // Next 21 days starting today
    const today = startOfToday();
    const end = new Date(today);
    end.setDate(today.getDate() + 21);
    dateFrom = today;
    dateTo = end;
  } else if (date) {
    dateFrom = new Date(date);
    dateTo = new Date(date);
  } else if (from && to) {
    dateFrom = new Date(from);
    dateTo = new Date(to);
  } else {
    // Default: current week (Mon-Sun)
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

  // Fetch all DSC entries for the date range up front (for Disco expansion)
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
              id: true,
              orderNumber: true,
              customerName: true,
              total: true,
              status: true,
              fulfillmentStatus: true,
            },
          },
        },
      },
    },
    orderBy: [{ cruiseDate: 'asc' }, { clientName: 'asc' }],
  });

  // Index DSC entries:
  //   - dscByDateSlotBoat: key "date|slot|boat" for explicit boat assignments
  //   - dscUnassignedByDateSlot: key "date|slot" for bookings without a boat
  // The UI shows unassigned bookings under EVERY PVT Disco row for that (date, slot).
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
      ...(boat ? { boat: { contains: boat, mode: 'insensitive' as const } } : {}),
    },
    include: {
      matches: {
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              customerName: true,
              customerEmail: true,
              total: true,
              deliveryDate: true,
              deliveryTime: true,
              deliveryAddress: true,
              status: true,
              fulfillmentStatus: true,
              items: { select: { id: true } },
            },
          },
        },
      },
    },
    orderBy: [{ cruiseDate: 'asc' }, { timeSlot: 'asc' }, { boat: 'asc' }],
  });

  // Filter for exceptions view
  let filteredEntries = view === 'exceptions'
    ? entries.filter(e =>
        (e.clientName && e.matches.length === 0) ||
        e.matches.some(m => m.status === 'needs_review'),
      )
    : entries;

  // Upcoming view: only dates that have at least one booking with a client name
  if (view === 'upcoming') {
    const datesWithBookings = new Set(
      entries
        .filter(e => e.clientName && e.clientName.trim() !== '')
        .map(e => toISODate(e.cruiseDate)),
    );
    filteredEntries = filteredEntries.filter(e =>
      datesWithBookings.has(toISODate(e.cruiseDate)),
    );
  }

  // Build schedule response
  const grouped: Record<string, Record<string, unknown[]>> = {};
  for (const entry of filteredEntries) {
    const d = toISODate(entry.cruiseDate);
    const ts = entry.timeSlot || 'unscheduled';
    if (!grouped[d]) grouped[d] = {};
    if (!grouped[d][ts]) grouped[d][ts] = [];

    const match = entry.matches[0];
    const order = match?.order;

    // For "Disco" PVT rows, attach DSC bookings for same date + timeSlot + boat
    // PLUS unassigned DSC bookings for that (date, timeSlot) — shown under every PVT Disco row.
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
        const assignedBoat = (b.boat || '').trim();
        const isUnassigned = !assignedBoat || assignedBoat.toUpperCase() === 'UNASSIGNED';
        return {
          id: b.id,
          clientName: b.clientName,
          clientPhone: b.clientPhone,
          headcount: b.headcount,
          package: b.package,
          addOns: b.addOns,
          podFlag: b.podFlag,
          occasion: b.occasion,
          boatAssignment: isUnassigned ? null : assignedBoat,
          matchStatus: m?.status || (b.clientName ? 'unmatched' : 'empty'),
          order: o
            ? {
                id: o.id,
                orderNumber: o.orderNumber,
                customerName: o.customerName,
                total: Number(o.total),
                status: o.status,
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
      package: entry.package,
      addOns: entry.addOns,
      podFlag: entry.podFlag,
      captainCrew: entry.captainCrew,
      dj: entry.dj,
      photographer: entry.photographer,
      avgAge: entry.avgAge,
      amount: entry.amount ? Number(entry.amount) : null,
      type: isDiscoRow ? 'disco' : 'private',
      isDiscoRow,
      discoBookings,
      matchStatus: match?.status || (entry.clientName ? 'unmatched' : 'empty'),
      matchType: match?.matchType || null,
      matchConfidence: match?.matchConfidence ? Number(match.matchConfidence) : null,
      matchNotes: match?.notes || null,
      order: order
        ? {
            id: order.id,
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            total: Number(order.total),
            deliveryDate: order.deliveryDate,
            deliveryTime: order.deliveryTime,
            deliveryAddress: order.deliveryAddress,
            status: order.status,
            fulfillmentStatus: order.fulfillmentStatus,
            itemsCount: order.items.length,
          }
        : null,
    });
  }

  // Orphan orders (Premier-address orders with no match in date range) -- exceptions/today views
  let orphanOrders: unknown[] = [];
  if (view === 'exceptions' || view === 'today') {
    const orphansRaw = await prisma.$queryRaw<Array<{
      id: string;
      order_number: number;
      customer_name: string;
      customer_email: string;
      total: string;
      delivery_date: Date;
      delivery_time: string;
      status: string;
      fulfillment_status: string;
    }>>`
      SELECT o.id, o.order_number, o.customer_name, o.customer_email,
             o.total::text, o.delivery_date, o.delivery_time,
             o.status::text, o.fulfillment_status::text
      FROM orders o
      LEFT JOIN schedule_order_matches som ON som.order_id = o.id
      WHERE o.delivery_address::text ILIKE '%13993%'
        AND o.delivery_address::text ILIKE '%2769%'
        AND o.delivery_date >= ${dateFrom}
        AND o.delivery_date <= ${dateTo}
        AND som.id IS NULL
    `;
    orphanOrders = orphansRaw.map(o => ({
      id: o.id,
      orderNumber: o.order_number,
      customerName: o.customer_name,
      customerEmail: o.customer_email,
      total: Number(o.total),
      deliveryDate: o.delivery_date,
      deliveryTime: o.delivery_time,
      status: o.status,
      fulfillmentStatus: o.fulfillment_status,
    }));
  }

  const lastSync = await prisma.syncLog.findFirst({
    orderBy: { startedAt: 'desc' },
    select: {
      status: true,
      completedAt: true,
      rowsParsed: true,
      autoMatched: true,
      needsReview: true,
      unmatchedBookings: true,
      unmatchedOrders: true,
    },
  });

  return NextResponse.json({
    dateRange: { from: toISODate(dateFrom), to: toISODate(dateTo) },
    schedule: grouped,
    orphanOrders,
    lastSync,
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireOpsAuth();
  if (auth instanceof NextResponse) return auth;

  const body = await req.json().catch(() => ({}));
  const { action, scheduleId, orderId, notes, status } = body;

  if (!action || typeof scheduleId !== 'number' || !orderId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (action === 'link') {
    await manualMatch(scheduleId, orderId, notes);
    return NextResponse.json({ success: true, action: 'linked' });
  }

  if (action === 'unlink') {
    await unmatch(scheduleId, orderId);
    return NextResponse.json({ success: true, action: 'unlinked' });
  }

  if (action === 'status' && typeof status === 'string') {
    await updateMatchStatus(scheduleId, orderId, status, notes);
    return NextResponse.json({ success: true, action: 'status_updated' });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
