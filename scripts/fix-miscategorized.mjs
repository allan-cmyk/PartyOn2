/**
 * Fix products that the sales spreadsheet placed in the wrong category,
 * and fix incorrect productType values from the original normalization.
 *
 * Two kinds of fixes:
 * A) productType is wrong (e.g. Dulce Vida Tequila tagged as "Liqueur")
 * B) Category assignment is wrong (e.g. Rambler Sparkling Water in gin)
 *
 * Usage: set -a && source .env.local && set +a && node scripts/fix-miscategorized.mjs
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ── productType fixes ──
// { productId: correctType }
const TYPE_FIXES = {
  // Tequila products wrongly typed
  '56c05c1a-b676-49c5-bf2d-9659a0f3ba05': 'Tequila',   // Dulce Vida Blanco Tequila (was Liqueur)
  '74646bb9-9e98-4f67-9bd3-81f95d6a1a82': 'Tequila',   // Casamigos Blanco 50ml (was Vodka)
  'c5405e3a-9875-4adf-9a16-3baba3a7631c': 'Tequila',   // Del Maguey Vida Mezcal (was Liqueur)
  'bd077f2d-4ec2-4297-b661-0ecad51cc200': 'Tequila',   // 400 Conejos Mezcal (was Liqueur)
  'e5c16a59-ef6e-433f-91d0-7aea3a4911ce': 'Tequila',   // Avion Silver Tequila (was Rum)
  '1b7e042e-c932-43fb-90b1-725434caa938': 'Tequila',   // Desert Door TX Sotol 50ml (was Liqueur)
  '42e7142b-c187-4dda-bbf5-39af16aca5a0': 'Tequila',   // Madre Mezcal (was Liqueur)
  '38451179-9f36-4a3b-9144-ae491bd16c79': 'Tequila',   // Mi Mama Mezcal (was Liqueur)

  // Whiskey/bourbon products wrongly typed
  '4f99f314-07c7-4e2a-9448-33d5b652052c': 'Whiskey',   // Treaty Oak Day Drinker Bourbon (was Liqueur)
  '6d5eda9f-3b62-49ec-b798-d05ccee71f56': 'Whiskey',   // Nine Banded Bourbon (was Liqueur)
  '7cf1581f-6eb9-442e-8040-1e733a97f243': 'Whiskey',   // Bulleit Bourbon 1.75L (was Liqueur)
  '34b4e847-27e3-4a0b-814c-ccac703ee173': 'Whiskey',   // Jameson Irish Whiskey 1.75L (was Liqueur)
  'a0850ca7-dfc7-4f77-af6f-47c8d1e9ef50': 'Whiskey',   // Dewar's White Label Scotch (was Liqueur)
  'f4b388b3-406d-4b50-8213-a661ef9262d3': 'Whiskey',   // Devils River Barrel Strength Bourbon (was Liqueur)

  // Hennessy is a cognac -- keep as Liqueur, that's correct per our taxonomy
  // 'f0e90e3d-4cff-40b5-839d-bc84d66d252c': 'Liqueur', // Hennessy Cognac -- already correct

  // Light Beer products wrongly typed as Craft
  'cdc00e06-a123-4442-b26e-07e849b12d92': 'Light Beer', // Stella Artois (was Craft Beer)
  '6630d9f1-02ed-4371-a16d-0b35f3811426': 'Light Beer', // Pilsner Urquell (was Craft Beer)
  '645b986a-6068-47b7-91bb-bf02d7a88c15': 'Light Beer', // Guinness Draught (was Craft Beer)

  // Craft Beer products wrongly typed as Light
  'fce57a88-8ba4-4daf-8c77-b42b67cb2838': 'Craft Beer', // Saint Arnold's Christmas Ale (was Light Beer)
  'c1d0819c-fd51-4feb-ad9b-01bfa7f84387': 'Craft Beer', // Shiner TexHex Hazy IPA (was Light Beer)
  '64ae20c1-fe6c-451c-86fa-28709e5a577d': 'Craft Beer', // Shiner Summer Shandy (was Light Beer)
  'bb92f7c6-550d-4ad7-a8ba-a8f9b91094c4': 'Light Beer', // Sol -- actually a mass-market Mexican lager, keep in light-beer cat but fix below

  // RTD Cocktail fixes -- canned cocktails that are typed as Mixer or Cocktail Kit
  '1f506623-3abc-46bc-a3b7-4d1f4a2464e4': 'RTD Cocktail', // Cutwater Margarita Variety (was Mixer)
  '14835ebc-8242-4154-be43-18d909db8202': 'RTD Cocktail', // Buzzballz Tequila Rita (was Mixer)
  '4149ff73-9066-46dc-ba7a-8ee6c0b8777d': 'RTD Cocktail', // Twisted Tea Half & Half (was Mixer)
  'bc95a6a2-1ea0-4adf-be79-07e5e79c6fc1': 'RTD Cocktail', // Cutwater Tequila Paloma (was Mixer)
  'cc8340a4-de56-4f8d-9481-70ba7543749d': 'RTD Cocktail', // Big Hat The Margarita (was Cocktail Kit)
  '1d4af3a0-d53e-448f-9240-da30719d17d0': 'RTD Cocktail', // Big Hat Jalapeno Ranch Water (was Cocktail Kit)
  '8d1afc6f-b2b9-4f6c-b809-4fddcc82554e': 'RTD Cocktail', // Cutwater Mango Margarita (was Mixer)
  'cd1d1f87-1c9b-409a-9910-50fe02bb865b': 'RTD Cocktail', // Andre Cocktails Pineapple Mimosa (was Cocktail Kit)
  'deaf5749-5c32-42de-8b2f-2354e21d99e4': 'RTD Cocktail', // Cutwater White Russian (was Cocktail Kit)
  'db7663d9-b56f-49aa-ab26-301b45c5ce58': 'RTD Cocktail', // On The Rocks Cosmopolitan (was Vodka)
  'fc10899e-dd16-4dc0-aba2-279eb0abf605': 'RTD Cocktail', // Cutwater Tropical Tiki Rum Mai Tai (was Mixer)
  '2121a302-c3dc-48a9-94cf-6a3f9829f23d': 'RTD Cocktail', // Cutwater Vodka Mule (was Mixer)
  '550b728d-6b7b-40b6-a2ea-5a57e594662e': 'RTD Cocktail', // Smirnoff Ice Original 12pk (was Vodka)
  'ffcef7a8-4436-4633-af5a-3c0570c344a6': 'RTD Cocktail', // Big Hat Ranch Water (was Cocktail Kit)
  'bc4744fa-f2c6-4682-8a81-983b9d2339e4': 'RTD Cocktail', // Cutwater Espresso Martini (was Mixer)
  'de3390fb-88d9-48c4-8d69-a6fd11ba4888': 'RTD Cocktail', // Big Hat Texas Mule (was Cocktail Kit)
  '392280c2-1f0e-4482-bd41-b71026c1ee72': 'RTD Cocktail', // Andre Cocktails Peach Bellini (was Cocktail Kit)
  '2349fc30-fa73-4ac1-b85f-6e2e03a015a1': 'RTD Cocktail', // Andre Cocktails Mango Mimosa (was Cocktail Kit)
  '8d6ea0b1-9063-4442-89a3-89f10ecba52f': 'RTD Cocktail', // Andre Cocktails Strawberry Mimosa (was Cocktail Kit)
  '84c69afe-b24b-4b3b-b5f8-b0f24625557f': 'RTD Cocktail', // Jim Beam Kentucky Coolers (was Seltzer)
  'e2e559b4-1c4d-4d59-af35-dca8600a4067': 'RTD Cocktail', // Treaty Oak Old Fashioned Cocktail (was Cocktail Kit)
  '4e445664-feaa-4608-8e79-31725fe5a958': 'RTD Cocktail', // Treaty Oak Peach Julep Cocktail (was Cocktail Kit)

  // Sparkling wine fix
  'a3fd11ca-4cb8-4e32-b821-69be70bacc64': 'Sparkling Wine', // Andre Extra Dry (was White Wine)

  // Red wine fix
  'e7c5b3cc-aee7-45ae-970e-6172cec60f6d': 'Red Wine',      // Texas Hills Kick Butt Cab (was White Wine)

  // La Croix is a mixer, not sparkling wine
  '30bd73b0-307e-4e41-995a-5216f09c23e6': 'Mixer',         // La Croix (was Sparkling Wine)

  // Modelo Ranch Water is an RTD
  '7c0d1f37-dad3-427f-bfff-9fddea5b2573': 'RTD Cocktail',  // Modelo Ranch Water (was Weekend Supply)
};

// ── Category assignment removals ──
// Products that need to be REMOVED from a category they don't belong in
// Format: { productId, removeFromHandle, addToHandle (optional) }
const CATEGORY_FIXES = [
  // Gin category: remove non-gin products
  { id: 'b1b3895a-ea26-4dc3-9947-aa74cf707f27', remove: 'spirits-gin' }, // Rambler Sparkling Water (Mixer, already in mixers)
  { id: '6363f52e-506e-4387-9ed0-84ff678721f0', remove: 'spirits-gin' }, // Austin Eastciders (Craft Beer, already in craft-beer)
  { id: '3dee1050-0b62-4f12-9b3d-592ab441c12e', remove: 'spirits-gin' }, // Rambler Sparkling Water 12pk (Mixer, already in mixers)
  { id: 'ec699e9c-e9e5-4fe6-b561-9c089b9a3bc9', remove: 'spirits-gin' }, // Captain Morgan Rum (already in rum)
  { id: 'b1b3895a-ea26-4dc3-9947-aa74cf707f27', remove: 'spirits' },     // Rambler also in spirits parent
  { id: '6363f52e-506e-4387-9ed0-84ff678721f0', remove: 'spirits' },     // Eastciders also in spirits parent
  { id: '3dee1050-0b62-4f12-9b3d-592ab441c12e', remove: 'spirits' },     // Rambler 12pk also in spirits parent

  // Craft beer: remove non-craft products
  { id: 'b1a40153-a95e-46c4-8314-6aff432519e3', remove: 'craft-beer' },  // Fever Tree Ginger Beer (Mixer)

  // Mixers: remove non-mixer
  { id: '61d17890-f549-47b9-8ecb-632ac83dd19e', remove: 'mixers', add: 'weekend-party-supplies' }, // Solo Cups (Weekend Supply)
  { id: 'bc8a8e68-40e1-4c22-bd2b-d4706222179d', remove: 'mixers' },      // Five Flowers Lemonade (Seltzer -- keep in seltzers if there)
  { id: 'f9adf249-21cd-4c36-bbd3-5f02c9ad5f89', remove: 'mixers' },      // Calmezzi Agave Spirit (Tequila)

  // Liqueurs: remove bitters (they're mixers)
  { id: '92ed9194-240e-4ad4-a6ff-a015ddde84f9', remove: 'spirits-liqueurs' }, // Angostura Aromatic Bitters (Mixer)
  { id: '30632aca-c4b6-4f32-96e9-25b2ed9d03ac', remove: 'spirits-liqueurs' }, // Angostura Orange Bitters (Mixer)
  { id: '411ee6dc-a0dd-402e-a30e-c554df094629', remove: 'spirits-liqueurs' }, // Hella Bitters Combo (Mixer)
  { id: '92ed9194-240e-4ad4-a6ff-a015ddde84f9', remove: 'spirits' },          // Angostura also in spirits parent
  { id: '30632aca-c4b6-4f32-96e9-25b2ed9d03ac', remove: 'spirits' },          // Angostura Orange also in spirits parent
  { id: '411ee6dc-a0dd-402e-a30e-c554df094629', remove: 'spirits' },          // Hella also in spirits parent

  // Red wine: remove non-red
  { id: '52245b76-a307-454f-95c4-c1a47c595b25', remove: 'red-wine' },    // Soleto Lambrusco (Sparkling Wine)

  // Kegs: remove non-keg products
  { id: 'dbe8dd96-224b-4e87-81ec-b6ab7dcf15c2', remove: 'kegs' },        // Michelob Ultra 1/2 Barrel -- actually IS a keg
  { id: '6a3f5362-ed1a-4a4e-9a69-b5df38806c5a', remove: 'kegs' },        // Cruzan Rum (Rum, not a keg)
  { id: 'dbee023f-c89a-45b1-a40f-a434abce9ee5', remove: 'kegs' },        // Garrison Bros Whiskey (Whiskey, not a keg)

  // Cocktail kits: remove non-kit items (drinkware/accessories)
  { id: 'b59b640d-987a-4d84-9733-8b712cabcc43', remove: 'cocktail-kits' }, // Plastic Drink Dispenser (Weekend Supply)
  { id: 'e424435f-a818-400c-888f-d2acf5e65152', remove: 'cocktail-kits' }, // Plastic Champagne Flutes (Weekend Supply)
  { id: 'fe41ccb9-d0f6-4e2b-b938-a7e38343a2e2', remove: 'cocktail-kits' }, // Plastic Cocktail Shaker (Weekend Supply)
  { id: '1c7ee4ce-e2b3-4a40-bd8d-76d82efabcf9', remove: 'cocktail-kits' }, // Acopa Jigger (Weekend Supply)
  { id: 'dc4e9fa8-7500-48df-bb80-d106947e4249', remove: 'cocktail-kits' }, // Austin Beers Gift Basket (Weekend Supply)
  { id: 'a4a7edf9-9e55-45e3-aa4f-a8af295e31e7', remove: 'cocktail-kits' }, // Small Corkscrew (Weekend Supply)

  // Weekend party supplies: remove mixers
  { id: 'a3e04123-64c1-46ef-8800-b0e3ef0210e9', remove: 'weekend-party-supplies' }, // WaterBoy Lemon Lime (Mixer)
  { id: '76693a0b-ab6b-4e61-bbdf-cd84aab45c2d', remove: 'weekend-party-supplies' }, // WaterBoy Strawberry (Mixer)
  { id: 'a002c241-09b0-4649-bcd2-b162a4ed9b87', remove: 'weekend-party-supplies' }, // Fancy Pineapple Cups (Mixer)
  { id: 'b5fbb794-5768-4457-8080-a11f6e436b0d', remove: 'weekend-party-supplies' }, // Drinking Buddy Supplement (Mixer)
];

async function main() {
  // Step 1: Fix productType values
  console.log('=== Fixing productType values ===');
  let typeFixed = 0;
  for (const [productId, newType] of Object.entries(TYPE_FIXES)) {
    const product = await prisma.product.findUnique({ where: { id: productId }, select: { title: true, productType: true } });
    if (!product) { console.log(`  WARN: product ${productId} not found`); continue; }
    if (product.productType === newType) { continue; } // already correct
    await prisma.product.update({ where: { id: productId }, data: { productType: newType } });
    console.log(`  ${product.title}: ${product.productType} -> ${newType}`);
    typeFixed++;
  }
  console.log(`Fixed ${typeFixed} productType values\n`);

  // Step 2: Remove wrong category assignments
  console.log('=== Fixing category assignments ===');
  let removed = 0;
  let added = 0;
  for (const fix of CATEGORY_FIXES) {
    const cat = await prisma.category.findUnique({ where: { handle: fix.remove } });
    if (!cat) { console.log(`  WARN: category ${fix.remove} not found`); continue; }

    const existing = await prisma.productCategory.findUnique({
      where: { productId_categoryId: { productId: fix.id, categoryId: cat.id } },
    });
    if (existing) {
      await prisma.productCategory.delete({
        where: { productId_categoryId: { productId: fix.id, categoryId: cat.id } },
      });
      const product = await prisma.product.findUnique({ where: { id: fix.id }, select: { title: true } });
      console.log(`  Removed "${product?.title}" from ${fix.remove}`);
      removed++;
    }

    // Optionally add to correct category
    if (fix.add) {
      const addCat = await prisma.category.findUnique({ where: { handle: fix.add } });
      if (addCat) {
        // Get max position in target category
        const maxPos = await prisma.productCategory.aggregate({
          where: { categoryId: addCat.id },
          _max: { position: true },
        });
        const newPos = (maxPos._max.position || 0) + 1;
        await prisma.productCategory.upsert({
          where: { productId_categoryId: { productId: fix.id, categoryId: addCat.id } },
          update: {},
          create: { productId: fix.id, categoryId: addCat.id, position: newPos },
        });
        console.log(`  Added to ${fix.add} at position ${newPos}`);
        added++;
      }
    }
  }
  console.log(`Removed ${removed} wrong assignments, added ${added} correct ones\n`);

  // Step 3: Handle Michelob Ultra keg -- it IS a keg, fix its productType
  const michKeg = await prisma.product.findUnique({ where: { id: 'dbe8dd96-224b-4e87-81ec-b6ab7dcf15c2' }, select: { title: true, productType: true } });
  if (michKeg && michKeg.productType !== 'Keg') {
    await prisma.product.update({ where: { id: 'dbe8dd96-224b-4e87-81ec-b6ab7dcf15c2' }, data: { productType: 'Keg' } });
    console.log(`Fixed: "${michKeg.title}" type ${michKeg.productType} -> Keg`);
    // Re-add to kegs if we removed it
    const kegCat = await prisma.category.findUnique({ where: { handle: 'kegs' } });
    if (kegCat) {
      await prisma.productCategory.upsert({
        where: { productId_categoryId: { productId: 'dbe8dd96-224b-4e87-81ec-b6ab7dcf15c2', categoryId: kegCat.id } },
        update: {},
        create: { productId: 'dbe8dd96-224b-4e87-81ec-b6ab7dcf15c2', categoryId: kegCat.id, position: 3 },
      });
    }
  }
  // Same for Lone Star Keg
  const lsKeg = await prisma.product.findUnique({ where: { id: '5bd18958-abbe-4999-b3ce-78e29f47e82a' }, select: { title: true, productType: true } });
  if (lsKeg && lsKeg.productType !== 'Keg') {
    await prisma.product.update({ where: { id: '5bd18958-abbe-4999-b3ce-78e29f47e82a' }, data: { productType: 'Keg' } });
    console.log(`Fixed: "${lsKeg.title}" type ${lsKeg.productType} -> Keg`);
  }

  console.log('\n=== Done! ===');
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
