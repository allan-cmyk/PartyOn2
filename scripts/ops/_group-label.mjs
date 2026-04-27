/**
 * Shared helper: resolve the "manifest name" / display label for an order's
 * group dashboard.
 *
 * The cruise owner's name (the one on the boat manifest) is reliably encoded
 * in GroupOrderV2.name for Premier webhook-created dashboards in the form
 * "{name} Drink Delivery!". We strip that suffix and fall back through other
 * fields if the pattern doesn't apply.
 *
 * Usage:
 *   import { resolveGroupLabel, attachGroupLabels } from './_group-label.mjs';
 *
 *   const lbl = resolveGroupLabel(order.groupOrderV2, order.customerName);
 *   // lbl.manifestName  -> "Cynthia Cruz" (use this to match the boat manifest)
 *   // lbl.displayLabel  -> "Cynthia Cruz" (best human-friendly label, never null)
 *   // lbl.isGroupOrder  -> true if the order is part of a group dashboard
 *   // lbl.payerDiffers  -> true if the payer name != manifest name
 */

const SUFFIXES_TO_STRIP = [
  / Drink Delivery!?$/i,
  / Bach Drink Delivery!?$/i,
  / Cruise Drink Delivery!?$/i,
  /'s Party$/i,
  /'s Cruise$/i,
];

const PLACEHOLDER_HOST_NAMES = new Set([
  'party host',
  'host',
  'unknown',
  '',
]);

/**
 * Strip "Drink Delivery!" / "'s Party" style suffixes from a dashboard name.
 * Returns the cleaned name, or null if nothing meaningful remains.
 */
export function stripDashboardSuffix(rawName) {
  if (!rawName || typeof rawName !== 'string') return null;
  let name = rawName.trim();
  for (const re of SUFFIXES_TO_STRIP) {
    name = name.replace(re, '').trim();
  }
  return name || null;
}

/**
 * Resolve the best label for an order's group context.
 *
 * @param {object|null} groupOrderV2 - The order's groupOrderV2 (may be null)
 * @param {string} customerName - The order's payer name (Order.customerName)
 * @returns {{
 *   isGroupOrder: boolean,
 *   manifestName: string | null,
 *   displayLabel: string,
 *   payerDiffers: boolean,
 *   hostName: string | null,
 *   shareCode: string | null,
 * }}
 */
export function resolveGroupLabel(groupOrderV2, customerName = '') {
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

  // Preference order:
  //   1. Stripped dashboard name (Premier webhook ground truth)
  //   2. hostName if it looks like a real name (not "Party Host" placeholder)
  //   3. customerName (fallback)
  let manifestName = stripped;
  if (!manifestName && !hostIsPlaceholder) manifestName = hostName;

  const displayLabel = manifestName || hostName || customer || '(unknown)';

  // Normalize both for comparison: collapse whitespace + lowercase
  const norm = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim();
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

// Tiny self-test — run with: node scripts/ops/_group-label.mjs
if (import.meta.url === `file://${process.argv[1]}`) {
  const cases = [
    [
      { name: 'Cynthia Cruz Drink Delivery!', hostName: 'Diana', shareCode: 'ZZ3EC4' },
      'Maria Mercado',
      { manifestName: 'Cynthia Cruz', payerDiffers: true },
    ],
    [
      { name: 'Brooke Robbins Drink Delivery!', hostName: 'Brooke Robbins', shareCode: 'KHXAAJ' },
      'Brooke Robbins',
      { manifestName: 'Brooke Robbins', payerDiffers: false },
    ],
    [
      { name: "Mike's Party", hostName: 'Mike', shareCode: 'ABC123' },
      'Mike',
      { manifestName: 'Mike', payerDiffers: false },
    ],
    [
      null,
      'Sherie Tester',
      { manifestName: null, payerDiffers: false, isGroupOrder: false },
    ],
    [
      { name: 'Anna Bach Drink Delivery!', hostName: 'Party Host', shareCode: 'YU3MZX' },
      'Some Guest',
      { manifestName: 'Anna', payerDiffers: true },
    ],
  ];
  let pass = 0, fail = 0;
  for (const [g, payer, expect] of cases) {
    const r = resolveGroupLabel(g, payer);
    const ok = Object.entries(expect).every(([k, v]) => r[k] === v);
    if (ok) { pass++; console.log('PASS', payer, '→', r.displayLabel, r); }
    else { fail++; console.error('FAIL', payer, 'expected', expect, 'got', r); }
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
