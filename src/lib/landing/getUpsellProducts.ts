/**
 * Server-side fetcher for the pre-checkout upsell overlay.
 *
 * Returns two 6-product grids:
 *   - "Add to your order" — high-margin add-ons (cups, cooler, cocktail kits,
 *     margarita kits) the customer probably didn't think of
 *   - "Top sellers" — best-moving SKUs in case they want one more case
 *
 * Cached at the request level by Next's data cache (catalog is dynamic so
 * we don't memoize across requests, but the modal pre-loads once).
 */

import { prisma } from '@/lib/database/client';

export type UpsellProduct = {
  handle: string;
  name: string;
  /** Short qualifier — "750ml", "24-pack", etc. */
  detail?: string;
  unitPrice: number;
  image?: string;
};

export type UpsellProducts = {
  addons: UpsellProduct[];
  topSellers: UpsellProduct[];
};

// Stable, hand-picked handles so the upsell experience is consistent across
// page loads. We resolve to the live row in Postgres for current pricing +
// imagery, but the SKU list itself doesn't shuffle.
const ADDON_HANDLES = [
  'solo-cups-18oz-50pcs',
  '120qt-cooler-rental',
  'aperol-spritz-party-pitcher-kit-16-drinks',
  'lady-bird-margarita-serves-16',
  'cucumber-crush-margarita-serves-16',
  'perfect-paloma-cocktail-kit',
];

const TOP_SELLER_HANDLES = [
  'high-noon-vodka-soda-combo-3-each-grapefruit-9-pineapple-9-black-cherry-9-watermelon-9-355ml-12-pack',
  'modelo-especial-24pack-12oz-cans',
  'titos-handmade-vodka-80-1lt',
  'espolon-tequila-blanco-80-1l',
  'surfside-lemonade-variety-pack-8-pack-12oz-can',
  'miller-lite-24-pack-12oz-can',
];

function clean(title: string): { name: string; detail?: string } {
  const [name, detail] = title.split(' • ').map((s) => s.trim());
  return { name: name || title, detail: detail || undefined };
}

export async function getUpsellProducts(): Promise<UpsellProducts> {
  const allHandles = [...ADDON_HANDLES, ...TOP_SELLER_HANDLES];

  let products: Array<{
    handle: string;
    title: string;
    basePrice: { toString: () => string };
    images: Array<{ url: string }>;
  }> = [];

  try {
    products = await prisma.product.findMany({
      where: { handle: { in: allHandles }, status: 'ACTIVE' },
      select: {
        handle: true,
        title: true,
        basePrice: true,
        images: { take: 1, orderBy: { position: 'asc' }, select: { url: true } },
      },
    });
  } catch (err) {
    console.error('[getUpsellProducts] DB fetch failed:', err);
  }

  const byHandle = Object.fromEntries(
    products.map((p) => {
      const { name, detail } = clean(p.title);
      return [
        p.handle,
        {
          handle: p.handle,
          name,
          detail,
          unitPrice: Number(p.basePrice.toString()),
          image: p.images[0]?.url,
        } as UpsellProduct,
      ];
    }),
  );

  const pick = (handles: string[]): UpsellProduct[] =>
    handles.map((h) => byHandle[h]).filter((x): x is UpsellProduct => !!x);

  return {
    addons: pick(ADDON_HANDLES),
    topSellers: pick(TOP_SELLER_HANDLES),
  };
}
