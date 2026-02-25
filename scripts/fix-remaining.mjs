import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function removePCat(productId, handle) {
  const cat = await prisma.category.findUnique({ where: { handle } });
  if (!cat) return;
  try {
    await prisma.productCategory.delete({ where: { productId_categoryId: { productId, categoryId: cat.id } } });
    const p = await prisma.product.findUnique({ where: { id: productId }, select: { title: true } });
    console.log(`Removed "${p.title}" from ${handle}`);
  } catch(e) { /* not found */ }
}

async function main() {
  // Sol (Light Beer) in craft-beer -- remove
  await removePCat('bb92f7c6-550d-4ad7-a8ba-a8f9b91094c4', 'craft-beer');

  // Modelo Ranch Water (RTD Cocktail) in craft-beer -- remove
  await removePCat('7c0d1f37-dad3-427f-bfff-9fddea5b2573', 'craft-beer');

  // Hennessy Cognac (Liqueur) in whiskey -- remove
  await removePCat('f0e90e3d-4cff-40b5-839d-bc84d66d252c', 'spirits-whiskey');

  // Treaty Oak Old Fashioned (RTD Cocktail) in whiskey -- remove
  await removePCat('e2e559b4-1c4d-4d59-af35-dca8600a4067', 'spirits-whiskey');
  await removePCat('e2e559b4-1c4d-4d59-af35-dca8600a4067', 'spirits');

  // Treaty Oak Peach Julep (RTD Cocktail) in whiskey -- remove
  await removePCat('4e445664-feaa-4608-8e79-31725fe5a958', 'spirits-whiskey');
  await removePCat('4e445664-feaa-4608-8e79-31725fe5a958', 'spirits');

  // Jim Beam Kentucky Coolers (RTD Cocktail) in whiskey -- remove
  await removePCat('84c69afe-b24b-4b3b-b5f8-b0f24625557f', 'spirits-whiskey');
  await removePCat('84c69afe-b24b-4b3b-b5f8-b0f24625557f', 'spirits');

  // Devils River Bourbon (Whiskey) in kegs -- already removed by prior script, double-check
  await removePCat('dbee023f-c89a-45b1-a40f-a434abce9ee5', 'kegs');

  // Ensure RTD products are in seltzers-rtds if not already
  const seltzerCat = await prisma.category.findUnique({ where: { handle: 'seltzers-rtds' } });
  const rtdIds = [
    '7c0d1f37-dad3-427f-bfff-9fddea5b2573', // Modelo Ranch Water
    'e2e559b4-1c4d-4d59-af35-dca8600a4067', // Treaty Oak Old Fashioned
    '4e445664-feaa-4608-8e79-31725fe5a958', // Treaty Oak Peach Julep
    '84c69afe-b24b-4b3b-b5f8-b0f24625557f', // Jim Beam Kentucky Coolers
  ];
  const maxPos = await prisma.productCategory.aggregate({ where: { categoryId: seltzerCat.id }, _max: { position: true } });
  let pos = maxPos._max.position || 0;
  for (const id of rtdIds) {
    const exists = await prisma.productCategory.findUnique({
      where: { productId_categoryId: { productId: id, categoryId: seltzerCat.id } },
    });
    if (!exists) {
      pos++;
      await prisma.productCategory.create({ data: { productId: id, categoryId: seltzerCat.id, position: pos } });
      const p = await prisma.product.findUnique({ where: { id }, select: { title: true } });
      console.log(`Added "${p.title}" to seltzers-rtds at position ${pos}`);
    }
  }

  // Hennessy should be in spirits-liqueurs if not already
  const liqCat = await prisma.category.findUnique({ where: { handle: 'spirits-liqueurs' } });
  const hennExists = await prisma.productCategory.findUnique({
    where: { productId_categoryId: { productId: 'f0e90e3d-4cff-40b5-839d-bc84d66d252c', categoryId: liqCat.id } },
  });
  if (!hennExists) {
    const maxLiq = await prisma.productCategory.aggregate({ where: { categoryId: liqCat.id }, _max: { position: true } });
    await prisma.productCategory.create({
      data: { productId: 'f0e90e3d-4cff-40b5-839d-bc84d66d252c', categoryId: liqCat.id, position: (maxLiq._max.position || 0) + 1 },
    });
    console.log('Added Hennessy Cognac to spirits-liqueurs');
  }

  console.log('\nDone!');
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
