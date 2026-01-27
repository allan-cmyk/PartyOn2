import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check products with variants and prices
  const productsWithVariants = await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      variants: { some: { availableForSale: true } }
    },
    include: {
      variants: {
        where: { availableForSale: true },
        take: 1
      }
    },
    take: 10,
    orderBy: { title: 'asc' }
  });

  console.log('Sample Products with Active Variants:');
  productsWithVariants.forEach(p => {
    const v = p.variants[0];
    if (v) {
      console.log('  -', p.id.substring(0, 8) + '...', p.title.substring(0, 40).padEnd(40), '| Variant:', v.id.substring(0, 8) + '...', '| Price: $' + Number(v.price).toFixed(2));
    }
  });

  // Check total products available for cart
  const availableCount = await prisma.product.count({
    where: {
      status: 'ACTIVE',
      variants: { some: { availableForSale: true } }
    }
  });
  console.log('\nTotal products available for cart:', availableCount);

  // Check group orders
  const groupOrders = await prisma.groupOrder.findMany({
    include: {
      participants: true
    },
    orderBy: { createdAt: 'desc' },
    take: 3
  });

  console.log('\nRecent Group Orders:');
  groupOrders.forEach(go => {
    console.log('  -', go.shareCode, '| Status:', go.status, '| Participants:', go.participants.length, '| Host:', go.hostName || 'N/A');
  });

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
