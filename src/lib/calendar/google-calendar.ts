/**
 * Google Calendar Integration
 * Creates calendar events for new orders using a service account
 */

import { google } from 'googleapis';
import type { OrderWithItems } from '@/lib/inventory/services/order-service';

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

function getCalendarClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!email || !privateKey || !calendarId) {
    return null;
  }

  // Handle escaped newlines in the private key (common when stored in env vars)
  const formattedKey = privateKey.replace(/\\n/g, '\n');

  const auth = new google.auth.JWT({
    email,
    key: formattedKey,
    scopes: SCOPES,
  });
  const calendar = google.calendar({ version: 'v3', auth });

  return { calendar, calendarId };
}

interface DeliveryAddress {
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  zip?: string;
}

/**
 * Parse delivery time string like "10:00 AM - 11:00 AM" into start/end ISO strings
 * for a given delivery date.
 */
function parseDeliveryTime(
  deliveryDate: Date,
  deliveryTime: string
): { start: string; end: string } {
  // deliveryTime examples: "10:00 AM - 11:00 AM", "2:00 PM - 3:00 PM", "Morning", "Afternoon"
  const dateStr = deliveryDate.toISOString().split('T')[0]; // YYYY-MM-DD

  const timeRangeMatch = deliveryTime.match(
    /(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i
  );

  if (timeRangeMatch) {
    const startHour = convertTo24(parseInt(timeRangeMatch[1]), timeRangeMatch[3]);
    const startMin = timeRangeMatch[2];
    const endHour = convertTo24(parseInt(timeRangeMatch[4]), timeRangeMatch[6]);
    const endMin = timeRangeMatch[5];

    return {
      start: `${dateStr}T${pad(startHour)}:${startMin}:00`,
      end: `${dateStr}T${pad(endHour)}:${endMin}:00`,
    };
  }

  // Single time match: "10:00 AM"
  const singleTimeMatch = deliveryTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (singleTimeMatch) {
    const startHour = convertTo24(parseInt(singleTimeMatch[1]), singleTimeMatch[3]);
    const startMin = singleTimeMatch[2];
    const endHour = startHour + 1;

    return {
      start: `${dateStr}T${pad(startHour)}:${startMin}:00`,
      end: `${dateStr}T${pad(endHour)}:${startMin}:00`,
    };
  }

  // Fallback for text-based times
  const lowerTime = deliveryTime.toLowerCase();
  if (lowerTime.includes('morning')) {
    return { start: `${dateStr}T09:00:00`, end: `${dateStr}T12:00:00` };
  }
  if (lowerTime.includes('afternoon')) {
    return { start: `${dateStr}T12:00:00`, end: `${dateStr}T17:00:00` };
  }
  if (lowerTime.includes('evening')) {
    return { start: `${dateStr}T17:00:00`, end: `${dateStr}T21:00:00` };
  }

  // Default: all-day style 9-5
  return { start: `${dateStr}T09:00:00`, end: `${dateStr}T17:00:00` };
}

function convertTo24(hour: number, period: string): number {
  const p = period.toUpperCase();
  if (p === 'AM' && hour === 12) return 0;
  if (p === 'PM' && hour !== 12) return hour + 12;
  return hour;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function formatAddress(addr: DeliveryAddress): string {
  const parts: string[] = [];
  if (addr.address1) parts.push(addr.address1);
  if (addr.address2) parts.push(addr.address2);

  const cityStateZip: string[] = [];
  if (addr.city) cityStateZip.push(addr.city);
  if (addr.province) cityStateZip.push(addr.province);
  if (cityStateZip.length > 0) {
    let line = cityStateZip.join(', ');
    if (addr.zip) line += ' ' + addr.zip;
    parts.push(line);
  }

  return parts.join(', ');
}

/**
 * Create a Google Calendar event for a new order.
 * Fire-and-forget -- errors are logged but not thrown.
 */
export async function createOrderCalendarEvent(order: OrderWithItems): Promise<void> {
  const client = getCalendarClient();
  if (!client) {
    console.log('[Google Calendar] Skipping -- missing env vars');
    return;
  }

  try {
    const { calendar, calendarId } = client;
    const addr = (order.deliveryAddress || {}) as DeliveryAddress;
    const location = formatAddress(addr);
    const { start, end } = parseDeliveryTime(order.deliveryDate, order.deliveryTime);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://partyondelivery.com';

    // Build items list
    const itemsList = order.items
      .map((item) => `  - ${item.quantity}x ${item.title}${item.variantTitle ? ` (${item.variantTitle})` : ''}`)
      .join('\n');

    const description = [
      'Items:',
      itemsList,
      '',
      `Subtotal: $${Number(order.subtotal).toFixed(2)}`,
      `Delivery: $${Number(order.deliveryFee).toFixed(2)}`,
      order.discountCode ? `Discount (${order.discountCode}): -$${Number(order.discountAmount).toFixed(2)}` : null,
      `Tax: $${Number(order.taxAmount).toFixed(2)}`,
      `Total: $${Number(order.total).toFixed(2)}`,
      '',
      `Phone: ${order.deliveryPhone || order.customerPhone || 'N/A'}`,
      order.deliveryInstructions ? `Instructions: ${order.deliveryInstructions}` : null,
      '',
      `Dashboard: ${appUrl}/ops/orders/${order.id}`,
    ]
      .filter(Boolean)
      .join('\n');

    await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: `Order #${order.orderNumber} - ${order.customerName}`,
        location,
        description,
        start: {
          dateTime: start,
          timeZone: 'America/Chicago',
        },
        end: {
          dateTime: end,
          timeZone: 'America/Chicago',
        },
      },
    });

    console.log('[Google Calendar] Event created for order:', order.orderNumber);
  } catch (error) {
    console.error('[Google Calendar] Failed to create event:', error);
  }
}
