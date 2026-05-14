/**
 * TS port of scripts/ops/_group-label.mjs.
 *
 * Resolves the "manifest name" / display label for an order's group dashboard.
 * The cruise owner's name is encoded in GroupOrderV2.name as
 * "{name} Drink Delivery!" — we strip that suffix and fall back through
 * other fields if the pattern doesn't apply.
 *
 * Kept in sync with scripts/ops/_group-label.mjs; that .mjs file remains
 * the source of truth for the CLI weekly-summary script.
 */

const SUFFIXES_TO_STRIP: RegExp[] = [
  / Drink Delivery!?$/i,
  / Bach Drink Delivery!?$/i,
  / Cruise Drink Delivery!?$/i,
  /'s Party$/i,
  /'s Cruise$/i,
];

const PLACEHOLDER_HOST_NAMES = new Set(['party host', 'host', 'unknown', '']);

export function stripDashboardSuffix(rawName: string | null | undefined): string | null {
  if (!rawName || typeof rawName !== 'string') return null;
  let name = rawName.trim();
  for (const re of SUFFIXES_TO_STRIP) {
    name = name.replace(re, '').trim();
  }
  return name || null;
}

export interface GroupOrderV2Lite {
  name?: string | null;
  hostName?: string | null;
  shareCode?: string | null;
}

export interface ResolvedGroupLabel {
  isGroupOrder: boolean;
  manifestName: string | null;
  displayLabel: string;
  payerDiffers: boolean;
  hostName: string | null;
  shareCode: string | null;
}

export function resolveGroupLabel(
  groupOrderV2: GroupOrderV2Lite | null | undefined,
  customerName: string = ''
): ResolvedGroupLabel {
  const customer = (customerName || '').trim();

  if (!groupOrderV2) {
    return {
      isGroupOrder: false,
      manifestName: null,
      displayLabel: customer || '(unknown)',
      payerDiffers: false,
      hostName: null,
      shareCode: null,
    };
  }

  const stripped = stripDashboardSuffix(groupOrderV2.name);
  const hostName = (groupOrderV2.hostName || '').trim() || null;
  const hostKey = (hostName || '').toLowerCase();
  const hostIsPlaceholder = PLACEHOLDER_HOST_NAMES.has(hostKey);

  let manifestName: string | null = stripped;
  if (!manifestName && !hostIsPlaceholder) manifestName = hostName;

  const displayLabel = manifestName || hostName || customer || '(unknown)';

  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
  const customerN = norm(customer);
  const manifestN = manifestName ? norm(manifestName) : '';
  const payerDiffers =
    !!manifestN &&
    !!customerN &&
    customerN !== manifestN &&
    !manifestN.includes(customerN) &&
    !customerN.includes(manifestN);

  return {
    isGroupOrder: true,
    manifestName,
    displayLabel,
    payerDiffers,
    hostName,
    shareCode: groupOrderV2.shareCode || null,
  };
}
