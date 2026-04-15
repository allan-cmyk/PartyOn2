/**
 * Premier Party Cruises -- Google Sheet Parser
 *
 * Two-layer architecture:
 *   Layer 1 (extractRawRows): Reads sheet cells, identifies day blocks, extracts raw row arrays
 *   Layer 2 (normalizeBookings): Maps raw rows into typed booking objects with validation
 *
 * The Premier sheet layout (04-PVT tab):
 *   - Date row: "April 2, 2026" in col A, "THURS" in col B, "REGULAR WEEK" in col D
 *   - Header row: CAPT/CREW | TIME | ADJ. TIP | BOAT | CLIENT | PHONE | ADD-ON'S | DJ/PHOTOGRAPHER | AVE AGE | OCCASION | PPL | TIP | $ | POD
 *   - Data rows: one per boat per time slot. 4 boats: Clever Girl, Meseeks, The Irony, Day Tripper
 *   - Each day can have multiple time slot groups (e.g. 12-4 and 4:30-8:30)
 *   - Blank rows between groups
 *
 * The 04-DSC tab (Disco Cruises) has a different layout:
 *   - Sections for BACHELORETTE and BACHELOR within each date
 *   - CLIENT NAME | PHONE | PACKAGE | BOAT ASSIGNMENT | ADD-ONS | $ | COUNT | 1F | POD
 */

import { google } from 'googleapis';

// ============================================
// Types
// ============================================

export interface RawDayBlock {
  date: string;
  dayOfWeek: string;
  weekType: string;
  captainCrew: string;
  headerRow: string[];
  dataRows: {
    rowIndex: number;
    cells: string[];
  }[];
}

export interface ParsedBooking {
  sheetTab: string;
  cruiseDate: string;
  dayOfWeek: string;
  weekType: string;
  timeSlot: string;
  boat: string;
  clientName: string | null;
  clientPhone: string | null;
  normalizedName: string | null;
  normalizedPhone: string | null;
  package: string | null;
  addOns: string | null;
  occasion: string | null;
  avgAge: string | null;
  headcount: number | null;
  dj: string | null;
  photographer: string | null;
  tip: number | null;
  amount: number | null;
  podFlag: boolean;
  captainCrew: string | null;
  sheetRow: number;
  rawData: Record<string, string>;
}

export interface ParseWarning {
  row: number;
  message: string;
  severity: 'info' | 'warn' | 'error';
}

export interface ParseResult {
  bookings: ParsedBooking[];
  warnings: ParseWarning[];
}

// ============================================
// Constants
// ============================================

const KNOWN_BOATS = ['clever girl', 'meseeks', 'the irony', 'day tripper'];

const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

const DAYS_OF_WEEK = ['MON', 'TUES', 'WED', 'THURS', 'FRI', 'SAT', 'SUN'];

// ============================================
// Google Sheets fetch
// ============================================

const SHEETS_SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

export async function readGoogleSheet(tabName: string): Promise<string[][]> {
  const email = process.env.PREMIER_SHEET_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.PREMIER_SHEET_SERVICE_ACCOUNT_KEY;
  const sheetId = process.env.PREMIER_SHEET_ID;

  if (!email || !privateKey || !sheetId) {
    throw new Error(
      'Missing Premier sheet env vars. Required: PREMIER_SHEET_ID, PREMIER_SHEET_SERVICE_ACCOUNT_EMAIL, PREMIER_SHEET_SERVICE_ACCOUNT_KEY',
    );
  }

  // Handle escaped newlines in the private key (common when stored in env vars)
  const formattedKey = privateKey.replace(/\\n/g, '\n');

  const auth = new google.auth.JWT({
    email,
    key: formattedKey,
    scopes: SHEETS_SCOPES,
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `'${tabName}'`,
    valueRenderOption: 'FORMATTED_VALUE',
  });

  return (response.data.values || []) as string[][];
}

// ============================================
// Layer 1: Raw Extraction
// ============================================

export function extractRawRows(sheetData: string[][]): { blocks: RawDayBlock[]; warnings: ParseWarning[] } {
  const blocks: RawDayBlock[] = [];
  const warnings: ParseWarning[] = [];
  let i = 0;

  while (i < sheetData.length) {
    const row = sheetData[i] || [];
    const dateInfo = parseDateRow(row);

    if (dateInfo) {
      const block: RawDayBlock = {
        date: dateInfo.date,
        dayOfWeek: dateInfo.dayOfWeek,
        weekType: dateInfo.weekType,
        captainCrew: '',
        headerRow: [],
        dataRows: [],
      };

      i++;

      while (i < sheetData.length) {
        const nextRow = sheetData[i] || [];

        if (parseDateRow(nextRow)) break;

        if (isHeaderRow(nextRow)) {
          block.headerRow = nextRow.map(c => String(c || '').trim());
          i++;
          continue;
        }

        const boatName = findBoatInRow(nextRow);
        if (boatName) {
          const colA = String(nextRow[0] || '').trim();
          if (colA && !KNOWN_BOATS.includes(colA.toLowerCase())) {
            block.captainCrew = colA;
          }

          block.dataRows.push({
            rowIndex: i + 1,
            cells: nextRow.map(c => String(c || '').trim()),
          });
        }

        i++;
      }

      if (block.dataRows.length === 0) {
        warnings.push({ row: i, message: `Date block "${block.date}" has no data rows`, severity: 'warn' });
      }

      blocks.push(block);
    } else {
      i++;
    }
  }

  return { blocks, warnings };
}

// ============================================
// Layer 2: Normalization
// ============================================

// PVT tab columns (0-indexed)
const PVT_COLUMNS = {
  captCrew: 0, time: 1, adjTip: 2, boat: 3, client: 4, phone: 5,
  addOns: 6, djPhotographer: 7, avgAge: 8, occasion: 9, ppl: 10,
  tip: 11, pod: 12, amount: 13,
};

// DSC tab columns (0-indexed) -- within bachelorette/bachelor sections
// Note: col 5 header says "$" but sheet actually stores the POD flag there ("F" = true).
// Col 7 is the TIP. Col 8 is an unused duplicate POD column.
const DSC_COLUMNS = {
  clientName: 0, phone: 1, package: 2, boatAssignment: 3,
  addOns: 4, pod: 5, count: 6, tip: 7,
};

// Used for PVT tabs only. DSC tabs go through parseDSCTab() directly (see parseSheet).
export function normalizeBookings(
  blocks: RawDayBlock[], sheetTab: string, extractionWarnings: ParseWarning[],
): ParseResult {
  const bookings: ParsedBooking[] = [];
  const warnings: ParseWarning[] = [...extractionWarnings];

  for (const block of blocks) {
    const isoDate = parseToISO(block.date);
    if (!isoDate) {
      warnings.push({ row: 0, message: `Could not parse date: "${block.date}"`, severity: 'error' });
      continue;
    }

    for (const dataRow of block.dataRows) {
      try {
        const booking = normalizePVTRow(
          dataRow.cells, block, isoDate, sheetTab, dataRow.rowIndex,
        );
        if (booking) bookings.push(booking);
      } catch (err) {
        warnings.push({
          row: dataRow.rowIndex,
          message: `Error normalizing row: ${err instanceof Error ? err.message : String(err)}`,
          severity: 'error',
        });
      }
    }
  }

  return { bookings, warnings };
}

function normalizePVTRow(
  cells: string[], block: RawDayBlock, isoDate: string, sheetTab: string, rowIndex: number,
): ParsedBooking | null {
  const c = PVT_COLUMNS;
  const boat = cells[c.boat] || '';
  if (!boat) return null;

  const rawData: Record<string, string> = {};
  for (const [key, idx] of Object.entries(c)) {
    rawData[key] = cells[idx] || '';
  }

  return {
    sheetTab,
    cruiseDate: isoDate,
    dayOfWeek: block.dayOfWeek,
    weekType: block.weekType,
    timeSlot: cells[c.time] || '',
    boat,
    clientName: cells[c.client] || null,
    clientPhone: cells[c.phone] || null,
    normalizedName: normalizeName(cells[c.client]),
    normalizedPhone: normalizePhone(cells[c.phone]),
    package: null,
    addOns: cells[c.addOns] || null,
    occasion: cells[c.occasion] || null,
    avgAge: cells[c.avgAge] || null,
    headcount: parseIntSafe(cells[c.ppl]),
    dj: extractDJ(cells[c.djPhotographer]),
    photographer: extractPhotographer(cells[c.djPhotographer]),
    tip: parseMoney(cells[c.tip]),
    amount: parseMoney(cells[c.amount]),
    podFlag: isPodYes(cells[c.pod]),
    captainCrew: block.captainCrew || null,
    sheetRow: rowIndex,
    rawData,
  };
}

// ============================================
// Top-level dispatcher
// ============================================

/**
 * Parse a sheet tab end-to-end. Dispatches to PVT or DSC logic based on tab name.
 * This is the preferred entry point for callers.
 */
export function parseSheet(sheetData: string[][], sheetTab: string): ParseResult {
  const isPVT = sheetTab.toUpperCase().includes('PVT');
  if (isPVT) {
    const { blocks, warnings: extractWarnings } = extractRawRows(sheetData);
    return normalizeBookings(blocks, sheetTab, extractWarnings);
  }
  return parseDSCTab(sheetData, sheetTab);
}

// ============================================
// DSC tab parser
// ============================================

/**
 * DSC tabs have a fundamentally different structure than PVT:
 *   - Each date block has header metadata rows (STATUS, Captain, DJ, Photographer)
 *   - Then BACHELORETTE section (header row + data rows)
 *   - Then BACHELOR section (header row + data rows)
 *   - Same date can appear multiple times for different time slots (e.g. 11-3 + 3:30-7:30)
 *   - The time slot is in col 2 of the date row
 *   - Bookings often have blank BOAT ASSIGNMENT — captain assigns them day-of
 *   - Blocks with STATUS = CANCELLED are skipped entirely
 */
function parseDSCTab(sheetData: string[][], sheetTab: string): ParseResult {
  const bookings: ParsedBooking[] = [];
  const warnings: ParseWarning[] = [];

  let i = 0;
  while (i < sheetData.length) {
    const row = sheetData[i] || [];
    const dateInfo = parseDateRow(row);
    if (!dateInfo) {
      i++;
      continue;
    }

    // Date row: col 2 holds the time slot (e.g. "11-3", "3:30-7:30")
    const timeSlot = String(row[2] || '').trim();
    const isoDate = parseToISO(dateInfo.date);
    if (!isoDate) {
      warnings.push({
        row: i + 1,
        message: `Could not parse DSC date: "${dateInfo.date}"`,
        severity: 'error',
      });
      i++;
      continue;
    }

    // Collect block-level metadata + data rows until next date row
    let status = '';
    let captain = '';
    let dj = '';
    let photographer = '';
    let section: 'bachelorette' | 'bachelor' | null = null;
    const dataRows: { section: 'bachelorette' | 'bachelor'; cells: string[]; rowIndex: number }[] = [];

    i++;
    while (i < sheetData.length) {
      const nextRow = sheetData[i] || [];
      if (parseDateRow(nextRow)) break;

      const col0 = String(nextRow[0] || '').trim();
      const col0Upper = col0.toUpperCase();
      const col1 = String(nextRow[1] || '').trim();

      // Metadata label rows
      if (col0Upper === 'STATUS') {
        status = col1;
      } else if (col0Upper === 'CAPTAIN/S' || col0Upper === 'CAPTAIN') {
        captain = col1;
      } else if (col0Upper === 'DJ') {
        dj = col1;
      } else if (col0Upper === 'PHOTOGRAPHER') {
        photographer = col1;
      } else if (col0Upper === 'BACHELORETTE') {
        section = 'bachelorette';
      } else if (col0Upper === 'BACHELOR') {
        section = 'bachelor';
      } else if (col0Upper === 'CLIENT NAME') {
        // Column header row — skip
      } else if (col0Upper.startsWith('CANCELLED')) {
        // Stray "CANCELLED" marker row inside a section — skip the row
      } else if (section && col0 && col0.length > 1) {
        // Data row: non-empty client name
        dataRows.push({ section, cells: nextRow.map(c => String(c || '').trim()), rowIndex: i + 1 });
      }

      i++;
    }

    // Skip cancelled blocks
    if (status.toUpperCase() === 'CANCELLED') continue;

    // Turn raw data rows into bookings
    const c = DSC_COLUMNS;
    for (const dr of dataRows) {
      const clientName = dr.cells[c.clientName] || null;
      if (!clientName) continue;

      const boat = (dr.cells[c.boatAssignment] || '').trim();

      const rawData: Record<string, string> = {
        status,
        timeSlot,
        section: dr.section,
      };
      for (const [key, idx] of Object.entries(c)) {
        rawData[key] = dr.cells[idx] || '';
      }

      bookings.push({
        sheetTab,
        cruiseDate: isoDate,
        dayOfWeek: dateInfo.dayOfWeek,
        weekType: dateInfo.weekType,
        timeSlot,
        boat: boat || 'UNASSIGNED',
        clientName,
        clientPhone: dr.cells[c.phone] || null,
        normalizedName: normalizeName(clientName),
        normalizedPhone: normalizePhone(dr.cells[c.phone]),
        package: dr.cells[c.package] || null,
        addOns: dr.cells[c.addOns] || null,
        occasion: dr.section === 'bachelorette' ? 'Bachelorette' : 'Bachelor',
        avgAge: null,
        headcount: parseIntSafe(dr.cells[c.count]),
        dj: dj || null,
        photographer: photographer || null,
        tip: parseMoney(dr.cells[c.tip]),
        amount: null,
        podFlag: isPodYes(dr.cells[c.pod]),
        captainCrew: captain || null,
        sheetRow: dr.rowIndex,
        rawData,
      });
    }
  }

  return { bookings, warnings };
}

// ============================================
// Helpers
// ============================================

function parseDateRow(row: string[]): { date: string; dayOfWeek: string; weekType: string } | null {
  if (!row || row.length === 0) return null;
  const firstCell = String(row[0] || '').trim();
  const dateMatch = firstCell.match(
    /^((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s*\d{4})/i,
  );
  if (!dateMatch) return null;

  let dayOfWeek = '';
  let weekType = '';
  for (let j = 1; j < Math.min(row.length, 6); j++) {
    const cell = String(row[j] || '').trim().toUpperCase();
    if (DAYS_OF_WEEK.includes(cell)) dayOfWeek = cell;
    else if (cell.includes('WEEK') || cell.includes('HOLIDAY')) weekType = cell;
  }
  return { date: dateMatch[1].trim(), dayOfWeek, weekType };
}

function isHeaderRow(row: string[]): boolean {
  const joined = row.map(c => String(c || '').toUpperCase()).join(' ');
  return (joined.includes('BOAT') && joined.includes('CLIENT')) ||
         (joined.includes('CAPT') && joined.includes('TIME')) ||
         (joined.includes('CLIENT NAME') && joined.includes('PACKAGE'));
}

function findBoatInRow(row: string[]): string | null {
  for (const cell of row) {
    const val = String(cell || '').trim().toLowerCase();
    if (KNOWN_BOATS.includes(val)) return String(cell).trim();
  }
  return null;
}

function parseToISO(dateStr: string): string | null {
  const match = dateStr.match(/(\w+)\s+(\d{1,2}),?\s*(\d{4})/);
  if (!match) return null;
  const monthIdx = MONTHS.indexOf(match[1].toLowerCase());
  if (monthIdx === -1) return null;
  return `${match[3]}-${String(monthIdx + 1).padStart(2, '0')}-${String(parseInt(match[2])).padStart(2, '0')}`;
}

export function normalizeName(name: string | null | undefined): string | null {
  if (!name) return null;
  return name.toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim() || null;
}

export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 7) return null;
  return digits.slice(-10) || null;
}

function parseMoney(val: string | null | undefined): number | null {
  if (!val) return null;
  const num = parseFloat(val.replace(/[$,]/g, ''));
  return isNaN(num) ? null : num;
}

function parseIntSafe(val: string | null | undefined): number | null {
  if (!val) return null;
  const num = parseInt(val.replace(/\D/g, ''), 10);
  return isNaN(num) ? null : num;
}

function isPodYes(val: string | null | undefined): boolean {
  if (!val) return false;
  const v = val.trim().toUpperCase();
  return v === 'F' || v === 'Y' || v === 'YES' || v === 'TRUE' || v === '1';
}

function extractDJ(val: string | null | undefined): string | null {
  if (!val || val === 'NA' || val === 'None') return null;
  return val.includes('/') ? val.split('/')[0].trim() || null : val.trim() || null;
}

function extractPhotographer(val: string | null | undefined): string | null {
  if (!val || val === 'NA' || val === 'None') return null;
  return val.includes('/') ? val.split('/')[1]?.trim() || null : null;
}
