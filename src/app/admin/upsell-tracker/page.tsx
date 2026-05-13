/**
 * Admin · Upsell Tracker
 *
 * A/B test scoreboard for the pre-checkout upsell overlay shown on the
 * landing pages. For each variant (A-control, B-margaritas-first, C-mixed)
 * we surface:
 *
 *   - draft orders shown that variant
 *   - draft orders that ended up with at least one upsell item
 *   - total upsell revenue + share of total order revenue
 *   - top upsell items per variant
 *
 * Data source: live Postgres. Counted via DraftOrder.upsellVariantId and
 * the `viaUpsell: true` flag baked into each DraftOrder.items[] entry.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/database/client';
import { UPSELL_VARIANTS } from '@/lib/landing/getUpsellProducts';

export const metadata: Metadata = {
  title: "Upsell Tracker — Brian's Stuff",
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type Item = {
  title?: string;
  quantity?: number;
  price?: number;
  viaUpsell?: boolean;
};

type Row = {
  variantId: string;
  label: string;
  orders: number;
  ordersWithUpsell: number;
  totalRevenue: number;
  upsellRevenue: number;
  attachRate: number; // ordersWithUpsell / orders
  upsellShare: number; // upsellRevenue / totalRevenue
  topUpsells: Array<{ title: string; quantity: number; revenue: number }>;
};

async function loadStats(): Promise<Row[]> {
  const orders = await prisma.draftOrder.findMany({
    where: { upsellVariantId: { not: null } },
    select: {
      id: true,
      upsellVariantId: true,
      total: true,
      items: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 1000,
  });

  // Bucket by variant
  const buckets: Record<string, ReturnType<typeof emptyBucket>> = {};
  function emptyBucket() {
    return {
      orders: 0,
      ordersWithUpsell: 0,
      totalRevenue: 0,
      upsellRevenue: 0,
      itemTotals: new Map<string, { qty: number; rev: number }>(),
    };
  }

  for (const o of orders) {
    const vid = o.upsellVariantId!;
    if (!buckets[vid]) buckets[vid] = emptyBucket();
    const b = buckets[vid];
    b.orders++;
    b.totalRevenue += Number(o.total);

    const items = Array.isArray(o.items) ? (o.items as Item[]) : [];
    let orderHasUpsell = false;
    for (const it of items) {
      if (!it.viaUpsell) continue;
      orderHasUpsell = true;
      const rev = (it.price ?? 0) * (it.quantity ?? 1);
      b.upsellRevenue += rev;
      const cur = b.itemTotals.get(it.title ?? 'Unknown') ?? { qty: 0, rev: 0 };
      cur.qty += it.quantity ?? 1;
      cur.rev += rev;
      b.itemTotals.set(it.title ?? 'Unknown', cur);
    }
    if (orderHasUpsell) b.ordersWithUpsell++;
  }

  // Combine with the variant definitions so empty variants still appear
  return UPSELL_VARIANTS.map((v) => {
    const b = buckets[v.id] ?? emptyBucket();
    const topUpsells = Array.from(b.itemTotals.entries())
      .map(([title, { qty, rev }]) => ({ title, quantity: qty, revenue: rev }))
      .sort((a, c) => c.revenue - a.revenue)
      .slice(0, 5);
    return {
      variantId: v.id,
      label: v.label,
      orders: b.orders,
      ordersWithUpsell: b.ordersWithUpsell,
      totalRevenue: b.totalRevenue,
      upsellRevenue: b.upsellRevenue,
      attachRate: b.orders > 0 ? b.ordersWithUpsell / b.orders : 0,
      upsellShare: b.totalRevenue > 0 ? b.upsellRevenue / b.totalRevenue : 0,
      topUpsells,
    };
  });
}

function fmt(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}
function dollars(n: number): string {
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}
function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

export default async function Page() {
  const stats = await loadStats();

  const total = stats.reduce(
    (acc, r) => ({
      orders: acc.orders + r.orders,
      withUpsell: acc.withUpsell + r.ordersWithUpsell,
      revenue: acc.revenue + r.totalRevenue,
      upsellRevenue: acc.upsellRevenue + r.upsellRevenue,
    }),
    { orders: 0, withUpsell: 0, revenue: 0, upsellRevenue: 0 },
  );

  // Pick a "leader" — the variant with the highest upsell revenue, if any
  const leader = [...stats].sort((a, b) => b.upsellRevenue - a.upsellRevenue)[0];

  return (
    <div className="max-w-6xl">
      <header className="mb-8">
        <p className="text-xs font-bold tracking-[0.22em] text-purple-700 mb-1">
          A/B TRACKER
        </p>
        <h1 className="text-3xl font-bold text-gray-900 leading-tight">
          Upsell Performance
        </h1>
        <p className="text-gray-600 mt-2 max-w-2xl">
          Three different arrangements of the pre-checkout upsell overlay are
          rotated at random for every landing-page visit. This page rolls up
          which variant converts best — measured by upsell-revenue share and
          attach rate (% of orders that took at least one upsell).
        </p>
      </header>

      {/* Top-line metrics */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Stat label="Orders with variant shown" value={fmt(total.orders)} />
        <Stat label="Orders with ≥1 upsell" value={fmt(total.withUpsell)} />
        <Stat label="Upsell revenue" value={dollars(total.upsellRevenue)} />
        <Stat
          label="Upsell share of revenue"
          value={total.revenue > 0 ? pct(total.upsellRevenue / total.revenue) : '—'}
        />
      </section>

      {total.orders === 0 && (
        <div className="rounded-xl p-6 bg-amber-50 border border-amber-200 mb-8 text-sm text-amber-900">
          No upsell-tagged orders yet. Once customers convert through the
          landing-page popup, attribution rolls up here automatically.
        </div>
      )}

      {leader && leader.orders > 0 && (
        <div className="rounded-xl p-5 bg-purple-50 border border-purple-200 mb-8 flex items-center gap-4">
          <div
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-lg"
            style={{ background: '#7C3AED' }}
          >
            ★
          </div>
          <div>
            <div className="text-xs font-bold tracking-widest text-purple-700 uppercase">
              Current leader
            </div>
            <div className="text-lg font-bold text-gray-900">
              {leader.variantId} — {leader.label}
            </div>
            <div className="text-sm text-gray-700">
              {dollars(leader.upsellRevenue)} in upsell revenue across{' '}
              {fmt(leader.orders)} {leader.orders === 1 ? 'order' : 'orders'} ·{' '}
              {pct(leader.attachRate)} attach rate
            </div>
          </div>
        </div>
      )}

      {/* Per-variant table */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left p-3">Variant</th>
              <th className="text-right p-3">Orders shown</th>
              <th className="text-right p-3">Took upsell</th>
              <th className="text-right p-3">Attach rate</th>
              <th className="text-right p-3">Upsell $</th>
              <th className="text-right p-3">Upsell share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stats.map((r) => (
              <tr key={r.variantId} className="hover:bg-gray-50">
                <td className="p-3">
                  <div className="font-semibold text-gray-900">{r.variantId}</div>
                  <div className="text-xs text-gray-500">{r.label}</div>
                </td>
                <td className="p-3 text-right font-medium">{fmt(r.orders)}</td>
                <td className="p-3 text-right">{fmt(r.ordersWithUpsell)}</td>
                <td className="p-3 text-right font-medium">
                  {r.orders > 0 ? pct(r.attachRate) : '—'}
                </td>
                <td className="p-3 text-right font-bold text-purple-700">
                  {dollars(r.upsellRevenue)}
                </td>
                <td className="p-3 text-right">
                  {r.totalRevenue > 0 ? pct(r.upsellShare) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Top items per variant */}
      <section className="mt-8 grid md:grid-cols-3 gap-4">
        {stats.map((r) => (
          <div
            key={`top-${r.variantId}`}
            className="bg-white rounded-xl border border-gray-200 p-4"
          >
            <div className="text-xs font-bold tracking-widest text-purple-700 mb-2">
              {r.variantId} · TOP UPSELLS
            </div>
            {r.topUpsells.length === 0 ? (
              <p className="text-sm text-gray-400">No upsell sales yet.</p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {r.topUpsells.map((it) => (
                  <li
                    key={it.title}
                    className="flex justify-between gap-3 text-gray-700"
                  >
                    <span className="flex-1 truncate">
                      <strong>{it.quantity}×</strong> {it.title}
                    </span>
                    <span className="font-bold whitespace-nowrap text-gray-900">
                      {dollars(it.revenue)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      <footer className="mt-10 text-xs text-gray-500">
        Variants are defined in{' '}
        <code className="px-1 py-0.5 bg-gray-100 rounded">
          src/lib/landing/getUpsellProducts.ts
        </code>
        . To add a new arrangement, append to{' '}
        <code className="px-1 py-0.5 bg-gray-100 rounded">UPSELL_VARIANTS</code>{' '}
        and redeploy — the rotation picks one at random per request.
        <br />
        See also:{' '}
        <Link href="/admin/brians-stuff" className="text-purple-700 underline">
          Brian&apos;s Stuff
        </Link>{' '}
        · order list:{' '}
        <Link href="/ops/orders?view=invoices" className="text-purple-700 underline">
          Invoices
        </Link>
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
        {label}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
