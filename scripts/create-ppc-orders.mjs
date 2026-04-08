/**
 * Create Party On Delivery order dashboards for Premier Party Cruises bookings.
 *
 * Usage:
 *   # First 10 rows (test):
 *   node scripts/create-ppc-orders.mjs
 *
 *   # All rows:
 *   node scripts/create-ppc-orders.mjs --all
 *
 *   # Backfill host claim tokens for already-created orders:
 *   node scripts/create-ppc-orders.mjs --backfill-tokens
 *
 * Requires .env.local with POSTGRES_URL set.
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const CSV_PATH = path.resolve('Xola Bkgs a_o 3_1_26 - PPC Bkgs a_o 3_5_26.csv');
const AFFILIATE_ID = 'd21bac1a-3f99-489c-89fd-e1980c264a8d';
const ANDERSON_MILL_ADDRESS = {
  address1: '13993 FM 2769',
  city: 'Leander',
  province: 'TX',
  zip: '78641',
  country: 'US',
};
const DELIVERY_FEE = 40; // Extended Austin zone

// PPC perks: free mocktail is offered via PremierPerksBanner in the dashboard UI
// (customer self-claims one of 4 mocktails after hitting subtotal threshold).
// Do NOT auto-add the Welcome to Austin Survival Package or any other freebie here.

// Share code generation (mirrors src/lib/group-orders-v2/utils.ts)
function generateShareCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(6);
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

// Generate a host claim token (UUID v4)
function generateClaimToken() {
  return crypto.randomUUID();
}

// Parse CSV handling quoted fields with commas
function parseCSV(text) {
  const lines = text.split('\n').filter(l => l.trim());
  const rows = [];
  for (const line of lines) {
    const fields = [];
    let current = '';
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    fields.push(current.trim());
    rows.push(fields);
  }
  return rows;
}

// Parse "Mar 6, 2026" -> Date at noon UTC
function parseCruiseDate(dateStr) {
  const d = new Date(dateStr);
  // Normalize to noon UTC
  d.setUTCHours(12, 0, 0, 0);
  return d;
}

// Parse "12:00 PM - 4:00 PM" -> { startHour, startMinute }
function parseCruiseTime(timeStr) {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;
  let hour = parseInt(match[1]);
  const minute = parseInt(match[2]);
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;
  return { startHour: hour, startMinute: minute };
}

// Format hour:minute as "11:00 AM"
function formatTime(hour, minute) {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${h}:${String(minute).padStart(2, '0')} ${ampm}`;
}

// Extract share code from a dashboard URL like https://partyondelivery.com/dashboard/JQ44ZG
function extractShareCode(url) {
  const match = url.match(/\/dashboard\/([A-Z0-9]+)/);
  return match ? match[1] : null;
}

async function backfillTokens() {
  const csvText = fs.readFileSync(CSV_PATH, 'utf-8');
  const rows = parseCSV(csvText);
  const header = rows[0];
  const dataRows = rows.slice(1);

  const colIndex = {};
  header.forEach((h, i) => { colIndex[h] = i; });

  const dashCol = header.indexOf('Order Dashboard');
  if (dashCol === -1) {
    console.log('No "Order Dashboard" column found. Nothing to backfill.');
    return;
  }

  // Ensure "Host Link" column exists
  const outputHeader = [...header];
  let hostLinkCol = outputHeader.indexOf('Host Link');
  if (hostLinkCol === -1) {
    outputHeader.push('Host Link');
    hostLinkCol = outputHeader.length - 1;
  }

  const outputRows = [outputHeader];
  let backfilled = 0;

  for (let i = 0; i < dataRows.length; i++) {
    const row = [...dataRows[i]];
    while (row.length < outputHeader.length) row.push('');

    const dashUrl = row[dashCol];
    const existingHostLink = row[hostLinkCol];

    // Only backfill rows that have a dashboard URL but no host link
    if (dashUrl?.startsWith('https://') && !existingHostLink?.startsWith('https://')) {
      const shareCode = extractShareCode(dashUrl);
      if (shareCode) {
        const order = await prisma.groupOrderV2.findUnique({ where: { shareCode } });
        if (order) {
          let token = order.hostClaimToken;
          if (!token) {
            token = generateClaimToken();
            await prisma.groupOrderV2.update({
              where: { id: order.id },
              data: { hostClaimToken: token },
            });
          }
          row[hostLinkCol] = `https://partyondelivery.com/dashboard/${shareCode}?claim=${token}`;
          backfilled++;
          console.log(`  ${row[colIndex['Name']]} -> token added`);
        }
      }
    }

    outputRows.push(row);
  }

  const csvOutput = outputRows.map(row =>
    row.map(field => (field.includes(',') ? `"${field}"` : field)).join(',')
  ).join('\n');

  fs.writeFileSync(CSV_PATH, csvOutput + '\n', 'utf-8');
  console.log(`\nBackfilled ${backfilled} host claim tokens.`);
}

async function main() {
  const doAll = process.argv.includes('--all');
  const doBackfill = process.argv.includes('--backfill-tokens');

  if (doBackfill) {
    await backfillTokens();
    await prisma.$disconnect();
    return;
  }

  const limit = doAll ? Infinity : 10;

  const csvText = fs.readFileSync(CSV_PATH, 'utf-8');
  const rows = parseCSV(csvText);
  const header = rows[0];
  const dataRows = rows.slice(1);

  // Find column indices
  const colIndex = {};
  header.forEach((h, i) => { colIndex[h] = i; });

  const created = [];
  const processCount = Math.min(dataRows.length, limit);

  console.log(`Processing ${processCount} of ${dataRows.length} bookings...\n`);

  // Check for existing "Order Dashboard" column to skip already-processed rows
  const existingDashCol = header.indexOf('Order Dashboard');

  for (let i = 0; i < processCount; i++) {
    const row = dataRows[i];

    // Skip rows that already have a dashboard URL
    if (existingDashCol !== -1 && row[existingDashCol]?.startsWith('https://')) {
      console.log(`  ${i + 1}. ${row[colIndex['Name']]} -> SKIPPED (already has dashboard URL)`);
      continue;
    }

    const name = row[colIndex['Name']];
    const email = row[colIndex['Email']];
    const phone = row[colIndex['Phone']] || null;
    const cruiseDateStr = row[colIndex['Cruise Date']];
    const timeStr = row[colIndex['Time']];

    // Parse dates and times
    const cruiseDate = parseCruiseDate(cruiseDateStr);
    const timeInfo = parseCruiseTime(timeStr);
    if (!timeInfo) {
      console.error(`  Row ${i + 1}: Could not parse time "${timeStr}", skipping`);
      continue;
    }

    // Delivery = 1 hour before cruise start
    const deliveryHour = timeInfo.startHour - 1;
    const deliveryTimeStr = formatTime(deliveryHour, timeInfo.startMinute);

    // Order deadline = delivery date - 4 hours (set on the delivery date at delivery time - 4h)
    const deadlineBoat = new Date(cruiseDate);
    deadlineBoat.setUTCHours(deliveryHour - 4, timeInfo.startMinute, 0, 0);

    const deadlineHouse = new Date(cruiseDate);
    deadlineHouse.setUTCHours(deliveryHour - 4, timeInfo.startMinute, 0, 0);

    // Generate unique share code
    let shareCode;
    let attempts = 0;
    while (true) {
      shareCode = generateShareCode();
      const existing = await prisma.groupOrderV2.findUnique({ where: { shareCode } });
      if (!existing) break;
      attempts++;
      if (attempts > 10) throw new Error('Failed to generate unique share code');
    }

    // Generate host claim token
    const hostClaimToken = generateClaimToken();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Create GroupOrderV2 with tabs, host participant, and claim token
    const groupOrder = await prisma.groupOrderV2.create({
      data: {
        name,
        hostName: name,
        hostEmail: email,
        hostPhone: phone,
        shareCode,
        hostClaimToken,
        partyType: 'BOAT',
        affiliateId: AFFILIATE_ID,
        source: 'PARTNER_PAGE',
        expiresAt,
        tabs: {
          create: [
            {
              name: 'Boat Cruise Drinks',
              position: 0,
              deliveryDate: cruiseDate,
              deliveryTime: deliveryTimeStr,
              deliveryAddress: ANDERSON_MILL_ADDRESS,
              orderType: 'boat',
              deliveryContextType: 'BOAT',
              orderDeadline: deadlineBoat,
              deliveryFee: DELIVERY_FEE,
            },
            {
              name: 'House/BnB Drinks',
              position: 1,
              deliveryDate: cruiseDate,
              deliveryTime: '',
              deliveryAddress: {},
              orderType: 'house',
              deliveryContextType: 'HOUSE',
              orderDeadline: deadlineHouse,
              deliveryFee: DELIVERY_FEE,
            },
          ],
        },
        participants: {
          create: [
            {
              guestName: name,
              guestEmail: email,
              guestPhone: phone,
              isHost: true,
              ageVerified: true,
            },
          ],
        },
      },
      include: { tabs: true, participants: true },
    });

    const dashboardUrl = `https://partyondelivery.com/dashboard/${shareCode}`;
    const hostLink = `https://partyondelivery.com/dashboard/${shareCode}?claim=${hostClaimToken}`;
    created.push({ rowIndex: i, shareCode, dashboardUrl, hostLink, name, email });

    console.log(`  ${i + 1}. ${name} -> ${dashboardUrl}`);
    console.log(`     Host link: ${hostLink}`);
    console.log(`     Email: ${email} | Cruise: ${cruiseDateStr} ${timeStr} | Deliver: ${deliveryTimeStr}`);
  }

  // Write dashboard URLs and host links back to CSV
  const outputHeader = [...header];
  let dashColIndex = outputHeader.indexOf('Order Dashboard');
  if (dashColIndex === -1) {
    outputHeader.push('Order Dashboard');
    dashColIndex = outputHeader.length - 1;
  }
  let hostLinkColIndex = outputHeader.indexOf('Host Link');
  if (hostLinkColIndex === -1) {
    outputHeader.push('Host Link');
    hostLinkColIndex = outputHeader.length - 1;
  }

  const outputRows = [outputHeader];
  for (let i = 0; i < dataRows.length; i++) {
    const row = [...dataRows[i]];
    // Pad row to match header length
    while (row.length < outputHeader.length) row.push('');
    // Set dashboard URL and host link if this row was processed
    const match = created.find(c => c.rowIndex === i);
    if (match) {
      row[dashColIndex] = match.dashboardUrl;
      row[hostLinkColIndex] = match.hostLink;
    }
    outputRows.push(row);
  }

  // Write CSV back, quoting fields that contain commas
  const csvOutput = outputRows.map(row =>
    row.map(field => (field.includes(',') ? `"${field}"` : field)).join(',')
  ).join('\n');

  fs.writeFileSync(CSV_PATH, csvOutput + '\n', 'utf-8');

  console.log(`\nDone! Created ${created.length} order dashboards.`);
  console.log(`CSV updated with "Order Dashboard" and "Host Link" columns.`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
