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
  /** Variant ID for the arrangement shown — captured on the resulting order. */
  variantId?: string;
};

/**
 * A/B variants for the upsell overlay. Each variant is a specific arrangement
 * of the 12 products. The overlay picks one at random per modal-open, records
 * the variantId on the resulting draft order, and the /admin/upsell-tracker
 * page rolls up conversion rate + revenue per variant.
 *
 * Three deliberately different orderings:
 *   - control: cheap-first (gateway items lead so customers say "sure, $7.99")
 *   - margaritas-first: high-AOV items lead (banks on the impulse buy)
 *   - mixed: alternating high/low to test pacing
 */
export type UpsellVariant = {
  id: string;
  label: string;
  addonHandles: string[];
  topSellerHandles: string[];
};

export const UPSELL_VARIANTS: UpsellVariant[] = [
  {
    id: 'A-control',
    label: 'Control · cheap-first',
    addonHandles: [
      'solo-cups-18oz-50pcs',
      '120qt-cooler-rental',
      'aperol-spritz-party-pitcher-kit-16-drinks',
      'lady-bird-margarita-serves-16',
      'cucumber-crush-margarita-serves-16',
      'perfect-paloma-cocktail-kit',
    ],
    topSellerHandles: [
      'high-noon-vodka-soda-combo-3-each-grapefruit-9-pineapple-9-black-cherry-9-watermelon-9-355ml-12-pack',
      'modelo-especial-24pack-12oz-cans',
      'titos-handmade-vodka-80-1lt',
      'espolon-tequila-blanco-80-1l',
      'surfside-lemonade-variety-pack-8-pack-12oz-can',
      'miller-lite-24-pack-12oz-can',
    ],
  },
  {
    id: 'B-margaritas-first',
    label: 'Margaritas-first',
    addonHandles: [
      'lady-bird-margarita-serves-16',
      'cucumber-crush-margarita-serves-16',
      'perfect-paloma-cocktail-kit',
      'aperol-spritz-party-pitcher-kit-16-drinks',
      '120qt-cooler-rental',
      'solo-cups-18oz-50pcs',
    ],
    topSellerHandles: [
      'titos-handmade-vodka-80-1lt',
      'espolon-tequila-blanco-80-1l',
      'high-noon-vodka-soda-combo-3-each-grapefruit-9-pineapple-9-black-cherry-9-watermelon-9-355ml-12-pack',
      'modelo-especial-24pack-12oz-cans',
      'miller-lite-24-pack-12oz-can',
      'surfside-lemonade-variety-pack-8-pack-12oz-can',
    ],
  },
  {
    id: 'C-mixed',
    label: 'High/low alternating',
    addonHandles: [
      '120qt-cooler-rental',
      'lady-bird-margarita-serves-16',
      'solo-cups-18oz-50pcs',
      'perfect-paloma-cocktail-kit',
      'cucumber-crush-margarita-serves-16',
      'aperol-spritz-party-pitcher-kit-16-drinks',
    ],
    topSellerHandles: [
      'modelo-especial-24pack-12oz-cans',
      'titos-handmade-vodka-80-1lt',
      'surfside-lemonade-variety-pack-8-pack-12oz-can',
      'espolon-tequila-blanco-80-1l',
      'high-noon-vodka-soda-combo-3-each-grapefruit-9-pineapple-9-black-cherry-9-watermelon-9-355ml-12-pack',
      'miller-lite-24-pack-12oz-can',
    ],
  },
];

/** Pick a variant for this modal-open. Server-side random so the result is
 *  consistent for the page render (modal pulls from the same lists). */
export function pickRandomUpsellVariant(): UpsellVariant {
  return UPSELL_VARIANTS[Math.floor(Math.random() * UPSELL_VARIANTS.length)];
}

function clean(title: string): { name: string; detail?: string } {
  const [name, detail] = title.split(' • ').map((s) => s.trim());
  return { name: name || title, detail: detail || undefined };
}

export async function getUpsellProducts(): Promise<UpsellProducts & { variantId: string }> {
  // Pick a variant for this page render. Each landing page request gets a
  // random arrangement so we can A/B test which order converts best.
  const variant = pickRandomUpsellVariant();
  const allHandles = [...variant.addonHandles, ...variant.topSellerHandles];

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
    addons: pick(variant.addonHandles),
    topSellers: pick(variant.topSellerHandles),
    variantId: variant.id,
  };
}
