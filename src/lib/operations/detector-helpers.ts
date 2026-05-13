/**
 * Shared helpers used by the drift detectors.
 *
 * Group-label resolution mirrors `scripts/ops/_group-label.mjs:resolveGroupLabel`
 * — kept in TS here so the cron route doesn't depend on the .mjs script.
 * If you change the strip suffixes here, mirror the change in the .mjs.
 */

import { prisma } from '@/lib/database/client';

export const HOUR_MS = 60 * 60 * 1000;
export const DAY_MS = 24 * HOUR_MS;

const SUFFIX_PATTERNS: RegExp[] = [
  / Drink Delivery!?$/i,
  / Bach Drink Delivery!?$/i,
  / Cruise Drink Delivery!?$/i,
  /'s Party$/i,
  /'s Cruise$/i,
];

const PLACEHOLDER_HOST_NAMES = new Set(['party host', 'host', 'unknown', '']);

function stripSuffix(name: string | null | undefined): string | null {
  if (!name) return null;
  let trimmed = name.trim();
  for (const re of SUFFIX_PATTERNS) trimmed = trimmed.replace(re, '').trim();
  return trimmed.length ? trimmed : null;
}

export interface OrderLabel {
  customerName: string;
  manifestName: string | null;
  payerDiffers: boolean;
}

export async function resolveOrderLabel(orderId: string): Promise<OrderLabel> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      customerName: true,
      groupOrderV2: { select: { name: true, hostName: true, shareCode: true } },
    },
  });
  if (!order) return { customerName: '(unknown)', manifestName: null, payerDiffers: false };
  const customerName = order.customerName ?? '(unknown)';
  if (!order.groupOrderV2) return { customerName, manifestName: null, payerDiffers: false };
  const stripped = stripSuffix(order.groupOrderV2.name);
  const hostName = order.groupOrderV2.hostName?.trim() ?? '';
  const hostIsPlaceholder = PLACEHOLDER_HOST_NAMES.has(hostName.toLowerCase());
  const manifestName = stripped ?? (hostIsPlaceholder ? null : hostName) ?? null;
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
  const payerDiffers =
    !!manifestName &&
    norm(customerName) !== norm(manifestName) &&
    !norm(manifestName).includes(norm(customerName)) &&
    !norm(customerName).includes(norm(manifestName));
  return { customerName, manifestName, payerDiffers };
}

export function formatGroupLabel(opts: OrderLabel): string {
  if (opts.manifestName && opts.payerDiffers) return `${opts.manifestName} (paid by ${opts.customerName})`;
  return opts.manifestName ?? opts.customerName;
}
