import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Use the actual product ID from the DB query
  const result = await prisma.productCategory.deleteMany({
    where: {
      product: { title: { contains: 'Devils River Barrel Strength' } },
      category: { handle: 'kegs' },
    },
  });
  console.log(`Removed ${result.count} record(s) -- Devils River from kegs`);
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
