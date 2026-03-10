/**
 * Create Whitehaven Sauvignon Blanc product
 * - Creates the product with variant
 * - Adds to "White Wine" category
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Creating Whitehaven Sauvignon Blanc...');

  const product = await prisma.product.upsert({
    where: { handle: 'whitehaven-sauvignon-blanc-750ml' },
    update: {},
    create: {
      title: 'Whitehaven Sauvignon Blanc • 750ml',
      handle: 'whitehaven-sauvignon-blanc-750ml',
      description: 'Whitehaven Sauvignon Blanc 2024 750ml. From Marlborough, New Zealand. A delicious mix of passion fruit, guava, mango and dried pineapple flavors, with notes of crunchy sea salt, lemon and orange blossoms, neroli orange, and wild fennel on a mouthwatering, fresh frame. Crisp, medium-bodied white wine with citrus, lemon, and herb notes.',
      vendor: 'Whitehaven',
      productType: 'White Wine',
      basePrice: 17.99,
      status: 'ACTIVE',
      tags: ['wine', 'white-wine', 'sauvignon-blanc', 'new-zealand', 'marlborough', '750ml'],
      variants: {
        create: {
          title: 'Default',
          price: 17.99,
          sku: 'WHITEHAVEN-SAUV-BLANC-750ML',
          inventoryQuantity: 100,
        },
      },
    },
  });
  console.log(`  ${product.title} (${product.id}) - $${product.basePrice}`);

  // Add to White Wine category
  const category = await prisma.category.findUnique({
    where: { handle: 'white-wine' },
  });

  if (category) {
    // Get next position
    const maxPos = await prisma.productCategory.aggregate({
      where: { categoryId: category.id },
      _max: { position: true },
    });
    const nextPos = (maxPos._max.position ?? 0) + 1;

    await prisma.productCategory.upsert({
      where: {
        productId_categoryId: {
          productId: product.id,
          categoryId: category.id,
        },
      },
      update: {},
      create: {
        productId: product.id,
        categoryId: category.id,
        position: nextPos,
      },
    });
    console.log(`  Added to "${category.title}" at position ${nextPos}`);
  } else {
    console.log('  WARNING: White Wine category not found');
  }

  console.log('\nDone!');
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
