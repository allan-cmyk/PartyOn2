#!/usr/bin/env node
/**
 * List active low-stock alerts
 * Usage: node scripts/ops/low-stock.mjs
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const alerts = await prisma.lowStockAlert.findMany({
  where: { status: 'ACTIVE' },
  orderBy: { createdAt: 'desc' },
});

const results = await Promise.all(alerts.map(async (alert) => {
  const product = await prisma.product.findUnique({
    where: { id: alert.productId },
    select: { title: true },
  });
  const variant = alert.variantId
    ? await prisma.productVariant.findUnique({
        where: { id: alert.variantId },
        select: { title: true, sku: true },
      })
    : null;

  return {
    productTitle: product?.title || 'Unknown',
    variant: variant?.title,
    sku: variant?.sku,
    currentQuantity: alert.currentQuantity,
    threshold: alert.threshold,
  };
}));

console.log(JSON.stringify(results, null, 2));
await prisma.$disconnect();
