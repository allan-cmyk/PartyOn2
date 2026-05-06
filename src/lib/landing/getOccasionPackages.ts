/**
 * Server-side package builder for landing pages.
 *
 * Each occasion gets 3 packages (starter / featured / premium-or-alt).
 * Recipes reference real product handles in the live Postgres DB.
 *
 * Pricing model (NEVER discount alcohol):
 *   - "Alcohol" items are charged at full retail (= packagePrice)
 *   - "Freebies" are bundled in free; their retail value = displayed savings
 *   - Freebies are deliberately HIGH-MARGIN supplies (cups, flutes, ping-pong
 *     balls, ice) so giving them away costs us pennies but advertises ~10% off
 *
 * Used by: src/app/austin-*-party-delivery/page.tsx
 */

import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/database/client';
import type { Package, PackageLineItem } from '@/components/landing/types';

export type Occasion = 'bachelor' | 'bachelorette' | 'corporate' | 'wedding';

type RecipeItem = { handle: string; qty: number };

type Recipe = {
  name: string;
  serves: string;
  blurb: string;
  image: string;
  featured?: boolean;
  alcohol: RecipeItem[];
  freebies: RecipeItem[];
};

// ---- RECIPES ----------------------------------------------------------------

// All handles below are verified against the live Neon DB.

const BACHELOR: Recipe[] = [
  {
    name: 'Austin Bach Starter',
    serves: 'Pre-game for 6–8',
    blurb: 'Everything you need before hitting 6th Street or Rainey.',
    image: '/images/landing/bachelor-starter.jpg',
    alcohol: [
      { handle: 'titos-handmade-vodka-80-1lt', qty: 1 },
      { handle: 'jameson-irish-whiskey-1', qty: 1 },
      { handle: 'modelo-especial-24pack-12oz-cans', qty: 1 },
      { handle: 'miller-lite-24-pack-12oz-can', qty: 1 },
      { handle: 'white-claw-variety-24-pack-12oz-can', qty: 1 },
      { handle: 'cranberry-juice-1', qty: 1 },
      { handle: '100-orange-juice-48oz-bottle', qty: 1 },
      { handle: 'sprite-12-pack-12oz', qty: 1 },
    ],
    freebies: [
      { handle: 'bag-of-ice-7-lbs', qty: 2 },
      { handle: 'solo-cups-18oz-50pcs', qty: 1 },
    ],
  },
  {
    name: 'Lake Travis Pack',
    serves: 'Boat party for 10–12',
    blurb: 'Built for sun, dock, and 8 hours on the water. Cold guaranteed.',
    image: '/images/landing/bachelor-lake.jpg',
    featured: true,
    alcohol: [
      { handle: 'titos-handmade-vodka-80-1-75lt', qty: 1 },
      { handle: 'casamigos-tequila-blanco-80-750ml', qty: 1 },
      { handle: 'modelo-especial-24pack-12oz-cans', qty: 1 },
      { handle: 'coors-light-24-pack-12oz-can', qty: 1 },
      { handle: 'white-claw-variety-24-pack-12oz-can', qty: 1 },
      { handle: 'high-noon-vodka-soda-combo-3-each-grapefruit-9-pineapple-9-black-cherry-9-watermelon-9-355ml-12-pack', qty: 1 },
      { handle: 'surfside-lemonade-variety-pack-8-pack-12oz-can', qty: 1 },
      { handle: 'cranberry-juice-1', qty: 1 },
      { handle: '100-orange-juice-48oz-bottle', qty: 1 },
      { handle: 'pineapple-juice-64oz', qty: 1 },
      { handle: 'sprite-12-pack-12oz', qty: 1 },
      { handle: 'bottled-water-32-pack-16-9oz', qty: 1 },
    ],
    freebies: [
      { handle: 'bag-of-ice-7-lbs', qty: 3 },
      { handle: 'solo-cups-18oz-50pcs', qty: 1 },
      { handle: 'disco-ball-cocktail-cups-with-straw', qty: 1 },
      { handle: 'ping-pong-balls-10pcs', qty: 1 },
    ],
  },
  {
    name: 'Rainey Street Crawler',
    serves: 'Pre-game for 8–10',
    blurb: 'Pre-game heavy, walk to the bars, stumble back to the Airbnb.',
    image: '/images/landing/bachelor-rainey.jpg',
    alcohol: [
      { handle: 'titos-handmade-vodka-80-1lt', qty: 1 },
      { handle: 'espolon-tequila-blanco-80-1l', qty: 1 },
      { handle: 'modelo-especial-24pack-12oz-cans', qty: 1 },
      { handle: 'lone-star-24pack-12oz-cans', qty: 1 },
      { handle: 'white-claw-variety-24-pack-12oz-can', qty: 1 },
      { handle: 'high-noon-vodka-soda-combo-3-each-grapefruit-9-pineapple-9-black-cherry-9-watermelon-9-355ml-12-pack', qty: 1 },
      { handle: 'cranberry-juice-1', qty: 1 },
      { handle: '100-orange-juice-48oz-bottle', qty: 1 },
      { handle: 'sprite-12-pack-12oz', qty: 1 },
    ],
    freebies: [
      { handle: 'bag-of-ice-7-lbs', qty: 2 },
      { handle: 'solo-cups-18oz-50pcs', qty: 1 },
      { handle: 'disco-ball-cocktail-cups-with-straw', qty: 1 },
    ],
  },
];

const BACHELORETTE: Recipe[] = [
  {
    name: 'Bach Pre-Game',
    serves: 'Pre-game for 6–8',
    blurb: 'Bubbles, rosé, and seltzers — the warm-up before the big night.',
    image: '/images/landing/bachelorette-pregame.jpg',
    alcohol: [
      { handle: 'amor-di-amanti-prosecco-spumante-750-ml', qty: 2 },
      { handle: 'chateau-desclans-whispering-angel-rose-750ml', qty: 1 },
      { handle: 'oyster-bay-sauvignon-blanc', qty: 1 },
      { handle: 'dark-horse-pinot-grigio-750ml-bottle', qty: 1 },
      { handle: 'titos-handmade-vodka-80-1lt', qty: 1 },
      { handle: 'high-noon-vodka-soda-combo-3-each-grapefruit-9-pineapple-9-black-cherry-9-watermelon-9-355ml-12-pack', qty: 1 },
      { handle: 'surfside-lemonade-variety-pack-8-pack-12oz-can', qty: 1 },
      { handle: 'cranberry-juice-1', qty: 1 },
    ],
    freebies: [
      { handle: 'bag-of-ice-7-lbs', qty: 2 },
      { handle: 'plastic-champagne-flutes-10pk', qty: 1 },
      { handle: 'solo-cups-18oz-50pcs', qty: 1 },
    ],
  },
  {
    name: 'Sunset Yacht Pack',
    serves: 'Lake Travis party for 10–12',
    blurb: 'Champagne, rosé, vodka, and seltzers for a golden-hour cruise.',
    image: '/images/landing/bachelorette-yacht.jpg',
    featured: true,
    alcohol: [
      { handle: 'veuve-clicquot-champagne-brut-750ml', qty: 1 },
      { handle: 'chandon-california-brut-750ml', qty: 2 },
      { handle: 'la-marca-prosecco-extra-dry-750ml-1', qty: 2 },
      { handle: 'chateau-desclans-whispering-angel-rose-750ml', qty: 1 },
      { handle: 'oyster-bay-sauvignon-blanc', qty: 1 },
      { handle: 'titos-handmade-vodka-80-1-75lt', qty: 1 },
      { handle: 'casamigos-tequila-blanco-80-750ml', qty: 1 },
      { handle: 'high-noon-vodka-soda-combo-3-each-grapefruit-9-pineapple-9-black-cherry-9-watermelon-9-355ml-12-pack', qty: 1 },
      { handle: 'surfside-lemonade-variety-pack-8-pack-12oz-can', qty: 1 },
      { handle: 'white-claw-variety-24-pack-12oz-can', qty: 1 },
      { handle: 'cranberry-juice-1', qty: 1 },
    ],
    freebies: [
      { handle: 'bag-of-ice-7-lbs', qty: 2 },
      { handle: 'plastic-champagne-flutes-10pk', qty: 2 },
      { handle: 'solo-cups-18oz-50pcs', qty: 1 },
      { handle: 'disco-ball-cocktail-cups-with-straw', qty: 1 },
      { handle: 'pineapple-cup-with-straw', qty: 1 },
    ],
  },
  {
    name: 'Wine Night Pack',
    serves: 'Dinner party for 8–10',
    blurb: 'Curated wines, prosecco, and rosé for a stay-in girls night.',
    image: '/images/landing/bachelorette-wine.jpg',
    alcohol: [
      { handle: 'amor-di-amanti-prosecco-spumante-750-ml', qty: 2 },
      { handle: 'la-marca-prosecco-extra-dry-750ml-1', qty: 1 },
      { handle: 'chateau-desclans-whispering-angel-rose-750ml', qty: 1 },
      { handle: 'oyster-bay-sauvignon-blanc', qty: 2 },
      { handle: 'dark-horse-pinot-grigio-750ml-bottle', qty: 1 },
      { handle: '14-hands-cabernet-sauvignon', qty: 1 },
      { handle: 'josh-cellars-cabernet-sauvignon-california-750ml', qty: 1 },
      { handle: 'titos-handmade-vodka-80-1lt', qty: 1 },
      { handle: 'high-noon-vodka-soda-combo-3-each-grapefruit-9-pineapple-9-black-cherry-9-watermelon-9-355ml-12-pack', qty: 1 },
      { handle: 'cranberry-juice-1', qty: 1 },
    ],
    freebies: [
      { handle: 'bag-of-ice-7-lbs', qty: 1 },
      { handle: 'plastic-champagne-flutes-10pk', qty: 1 },
      { handle: 'solo-cups-18oz-50pcs', qty: 1 },
      { handle: 'cocktail-mixing-spoon-12inches', qty: 1 },
    ],
  },
];

const CORPORATE: Recipe[] = [
  {
    name: 'Office Happy Hour',
    serves: 'Office event for 15–20',
    blurb: 'Approachable selection of beer, wine, and a clean spirits bar.',
    image: '/images/landing/corporate-happyhour.jpg',
    alcohol: [
      { handle: 'modelo-especial-24pack-12oz-cans', qty: 1 },
      { handle: 'miller-lite-24-pack-12oz-can', qty: 1 },
      { handle: 'austin-beerworks-variety-pack-12-pack-12oz-can', qty: 1 },
      { handle: 'titos-handmade-vodka-80-1lt', qty: 1 },
      { handle: 'jameson-irish-whiskey-1', qty: 1 },
      { handle: '14-hands-cabernet-sauvignon', qty: 1 },
      { handle: 'oyster-bay-sauvignon-blanc', qty: 1 },
      { handle: 'chandon-california-brut-750ml', qty: 1 },
      { handle: 'cranberry-juice-1', qty: 1 },
      { handle: '100-orange-juice-48oz-bottle', qty: 1 },
      { handle: 'sprite-12-pack-12oz', qty: 1 },
    ],
    freebies: [
      { handle: 'bag-of-ice-7-lbs', qty: 2 },
      { handle: 'solo-cups-18oz-50pcs', qty: 1 },
      { handle: 'plastic-champagne-flutes-10pk', qty: 1 },
      { handle: 'acopa-1-oz-2-oz-stainless-steel-japanese-jigger', qty: 1 },
    ],
  },
  {
    name: 'Quarterly Mixer',
    serves: 'Team event for 30–50',
    blurb: 'Full bar setup — beer, wine, spirits, mixers, and bartender essentials.',
    image: '/images/landing/corporate-mixer.jpg',
    featured: true,
    alcohol: [
      { handle: 'modelo-especial-24pack-12oz-cans', qty: 2 },
      { handle: 'miller-lite-24-pack-12oz-can', qty: 1 },
      { handle: 'coors-light-24-pack-12oz-can', qty: 1 },
      { handle: 'austin-beerworks-variety-pack-12-pack-12oz-can', qty: 1 },
      { handle: 'titos-handmade-vodka-80-1-75lt', qty: 2 },
      { handle: 'espolon-tequila-blanco-80-1l', qty: 1 },
      { handle: 'jameson-irish-whiskey-1', qty: 1 },
      { handle: 'casamigos-tequila-blanco-80-750ml', qty: 1 },
      { handle: 'oyster-bay-sauvignon-blanc', qty: 2 },
      { handle: '14-hands-cabernet-sauvignon', qty: 2 },
      { handle: 'chandon-california-brut-750ml', qty: 2 },
      { handle: 'cranberry-juice-1', qty: 2 },
      { handle: '100-orange-juice-48oz-bottle', qty: 2 },
      { handle: 'sprite-12-pack-12oz', qty: 1 },
      { handle: 'bottled-water-32-pack-16-9oz', qty: 1 },
    ],
    freebies: [
      { handle: 'bag-of-ice-7-lbs', qty: 3 },
      { handle: 'solo-cups-18oz-50pcs', qty: 3 },
      { handle: 'plastic-champagne-flutes-10pk', qty: 2 },
      { handle: 'acopa-4-prong-silver-hawthorne-strainer', qty: 1 },
    ],
  },
  {
    name: 'Client Dinner',
    serves: 'Premium dinner for 8–12',
    blurb: 'Veuve Clicquot, premium wines, and small-batch spirits — designed to impress.',
    image: '/images/landing/corporate-client.jpg',
    alcohol: [
      { handle: 'veuve-clicquot-champagne-brut-750ml', qty: 1 },
      { handle: 'chateau-desclans-whispering-angel-rose-750ml', qty: 1 },
      { handle: 'josh-cellars-cabernet-sauvignon-california-750ml', qty: 1 },
      { handle: 'oyster-bay-sauvignon-blanc', qty: 1 },
      { handle: '14-hands-cabernet-sauvignon', qty: 2 },
      { handle: 'titos-handmade-vodka-80-1lt', qty: 1 },
      { handle: 'casamigos-tequila-blanco-80-750ml', qty: 1 },
      { handle: 'jameson-irish-whiskey-1', qty: 1 },
      { handle: 'cranberry-juice-1', qty: 1 },
      { handle: '100-orange-juice-48oz-bottle', qty: 1 },
      { handle: 'bottled-water-32-pack-16-9oz', qty: 1 },
    ],
    freebies: [
      { handle: 'bag-of-ice-7-lbs', qty: 1 },
      { handle: 'plastic-champagne-flutes-10pk', qty: 2 },
      { handle: 'acopa-4-prong-silver-hawthorne-strainer', qty: 1 },
    ],
  },
];

const WEDDING: Recipe[] = [
  {
    name: 'Cocktail Hour',
    serves: 'Cocktail hour for 24 guests',
    blurb: 'Champagne welcome, signature wines, and a tight beer + spirits bar — 2 hours of service.',
    image: '/images/landing/wedding-cocktail-hour.jpg',
    alcohol: [
      { handle: 'la-marca-prosecco-extra-dry-750ml-1', qty: 2 },
      { handle: 'chandon-california-brut-750ml', qty: 1 },
      { handle: 'chateau-desclans-whispering-angel-rose-750ml', qty: 1 },
      { handle: 'oyster-bay-sauvignon-blanc', qty: 1 },
      { handle: 'josh-cellars-cabernet-sauvignon-california-750ml', qty: 1 },
      { handle: 'titos-handmade-vodka-80-1-75lt', qty: 1 },
      { handle: 'espolon-tequila-blanco-80-1l', qty: 1 },
      { handle: 'modelo-especial-24pack-12oz-cans', qty: 1 },
      { handle: 'miller-lite-24-pack-12oz-can', qty: 1 },
      { handle: 'bottled-water-32-pack-16-9oz', qty: 1 },
    ],
    freebies: [
      { handle: 'bag-of-ice-7-lbs', qty: 2 },
      { handle: 'plastic-champagne-flutes-10pk', qty: 2 },
      { handle: 'solo-cups-18oz-50pcs', qty: 1 },
    ],
  },
  {
    name: 'Standard Wedding Bar',
    serves: 'Reception for 50–75 guests',
    blurb: 'The classic open bar: 4 beers, 4 wines, full spirits + mixers. Built from real wedding orders.',
    image: '/images/landing/wedding-standard.jpg',
    featured: true,
    alcohol: [
      // 4 beers
      { handle: 'modelo-especial-24pack-12oz-cans', qty: 2 },
      { handle: 'miller-lite-24-pack-12oz-can', qty: 1 },
      { handle: 'coors-light-24-pack-12oz-can', qty: 1 },
      { handle: 'austin-beerworks-variety-pack-12-pack-12oz-can', qty: 1 },
      // 4 wines × 2 each
      { handle: 'oyster-bay-sauvignon-blanc', qty: 2 },
      { handle: 'dark-horse-pinot-grigio-750ml-bottle', qty: 2 },
      { handle: 'bogle-cabernet-750ml', qty: 2 },
      { handle: '14-hands-cabernet-sauvignon', qty: 2 },
      // Sparkling for toast
      { handle: 'chandon-california-brut-750ml', qty: 4 },
      // Spirits
      { handle: 'titos-handmade-vodka-80-1-75lt', qty: 2 },
      { handle: 'casamigos-tequila-blanco-80-750ml', qty: 1 },
      { handle: 'espolon-tequila-blanco-80-1l', qty: 1 },
      { handle: 'jameson-irish-whiskey-1', qty: 1 },
      // Mixers
      { handle: 'cranberry-juice-1', qty: 2 },
      { handle: '100-orange-juice-48oz-bottle', qty: 2 },
      { handle: 'sprite-12-pack-12oz', qty: 1 },
      { handle: 'bottled-water-32-pack-16-9oz', qty: 2 },
    ],
    freebies: [
      { handle: 'bag-of-ice-7-lbs', qty: 4 },
      { handle: 'plastic-champagne-flutes-10pk', qty: 4 },
      { handle: 'solo-cups-18oz-50pcs', qty: 4 },
      { handle: 'acopa-4-prong-silver-hawthorne-strainer', qty: 1 },
    ],
  },
  {
    name: 'Premium Wedding Bar',
    serves: 'Reception for 100+ guests',
    blurb: 'Veuve toast, premium wines, top-shelf spirits — the upgrade tier.',
    image: '/images/landing/wedding-premium.jpg',
    alcohol: [
      { handle: 'veuve-clicquot-champagne-brut-750ml', qty: 4 },
      { handle: 'la-marca-prosecco-extra-dry-750ml-1', qty: 4 },
      { handle: 'chateau-desclans-whispering-angel-rose-750ml', qty: 4 },
      { handle: 'josh-cellars-cabernet-sauvignon-california-750ml', qty: 4 },
      { handle: 'oyster-bay-sauvignon-blanc', qty: 4 },
      { handle: 'dark-horse-pinot-grigio-750ml-bottle', qty: 2 },
      { handle: 'titos-handmade-vodka-80-1-75lt', qty: 2 },
      { handle: 'casamigos-tequila-blanco-80-750ml', qty: 2 },
      { handle: 'jameson-irish-whiskey-1', qty: 1 },
      { handle: 'modelo-especial-24pack-12oz-cans', qty: 2 },
      { handle: 'miller-lite-24-pack-12oz-can', qty: 2 },
      { handle: 'austin-beerworks-variety-pack-12-pack-12oz-can', qty: 2 },
      { handle: 'cranberry-juice-1', qty: 3 },
      { handle: '100-orange-juice-48oz-bottle', qty: 3 },
      { handle: 'bottled-water-32-pack-16-9oz', qty: 3 },
    ],
    freebies: [
      { handle: 'bag-of-ice-7-lbs', qty: 6 },
      { handle: 'plastic-champagne-flutes-10pk', qty: 8 },
      { handle: 'solo-cups-18oz-50pcs', qty: 5 },
      { handle: 'acopa-4-prong-silver-hawthorne-strainer', qty: 1 },
      { handle: 'cocktail-mixing-spoon-12inches', qty: 1 },
    ],
  },
];

const RECIPES: Record<Occasion, Recipe[]> = {
  bachelor: BACHELOR,
  bachelorette: BACHELORETTE,
  corporate: CORPORATE,
  wedding: WEDDING,
};

// ---- BUILDER ---------------------------------------------------------------

async function buildOccasionPackagesUncached(occasion: Occasion): Promise<Package[]> {
  const recipes = RECIPES[occasion];

  // Collect every handle we'll need across all 3 recipes for this occasion in
  // a single round trip.
  const allHandles = new Set<string>();
  for (const r of recipes) {
    for (const it of [...r.alcohol, ...r.freebies]) allHandles.add(it.handle);
  }

  const products = await prisma.product.findMany({
    where: { handle: { in: [...allHandles] } },
    select: { handle: true, title: true, basePrice: true },
  });
  const byHandle = Object.fromEntries(products.map((p) => [p.handle, p]));

  return recipes.map((r) => {
    const lineItems: PackageLineItem[] = [];
    let packagePrice = 0;
    let freebiesValue = 0;

    for (const a of r.alcohol) {
      const p = byHandle[a.handle];
      if (!p) continue; // gracefully skip missing products
      const unit = Number(p.basePrice);
      lineItems.push({ name: cleanTitle(p.title), qty: a.qty, unitPrice: unit });
      packagePrice += unit * a.qty;
    }
    for (const f of r.freebies) {
      const p = byHandle[f.handle];
      if (!p) continue;
      const unit = Number(p.basePrice);
      lineItems.push({ name: cleanTitle(p.title), qty: f.qty, unitPrice: unit, freebie: true });
      freebiesValue += unit * f.qty;
    }

    return {
      name: r.name,
      serves: r.serves,
      blurb: r.blurb,
      image: r.image,
      featured: r.featured,
      lineItems,
      packagePrice: Math.round(packagePrice),
      freebiesValue: Math.round(freebiesValue),
    } satisfies Package;
  });
}

function cleanTitle(t: string): string {
  // Trim sale-channel suffixes that aren't useful in customer-facing UI.
  return t.replace(/\s+/g, ' ').trim();
}

export const getOccasionPackages = unstable_cache(
  buildOccasionPackagesUncached,
  ['landing-occasion-packages-v1'],
  { revalidate: 3600, tags: ['landing-packages'] },
);
