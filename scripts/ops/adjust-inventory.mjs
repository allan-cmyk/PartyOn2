#!/usr/bin/env node
/**
 * Adjust inventory for a product
 * Usage: node scripts/ops/adjust-inventory.mjs <product-id> <quantity-change> <reason> [variant-id]
 *
 * Examples:
 *   node scripts/ops/adjust-inventory.mjs abc123 +10 "Received shipment"
 *   node scripts/ops/adjust-inventory.mjs abc123 -2 "Damaged" def456
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const productId = process.argv[2];
const quantity = parseInt(process.argv[3]);
const reason = process.argv[4];
const variantId = process.argv[5] || null;

if (!productId || isNaN(quantity) || !reason) {
  console.error('Usage: node scripts/ops/adjust-inventory.mjs <product-id> <quantity> <reason> [variant-id]');
  process.exit(1);
}

// Get default location
const location = await prisma.inventoryLocation.findFirst({
  where: { isActive: true, isDefault: true },
});

if (!location) {
  console.error(JSON.stringify({ success: false, error: 'No default inventory location found' }));
  process.exit(1);
}

// Get or create inventory item
let item = await prisma.inventoryItem.findFirst({
  where: { productId, locationId: location.id, variantId },
});

if (!item) {
  item = await prisma.inventoryItem.create({
    data: { productId, locationId: location.id, variantId, quantity: 0 },
  });
}

const previousQuantity = item.quantity;
const newQuantity = previousQuantity + quantity;

await prisma.inventoryItem.update({
  where: { id: item.id },
  data: { quantity: newQuantity },
});

await prisma.inventoryMovement.create({
  data: {
    inventoryItemId: item.id,
    type: quantity > 0 ? 'RECEIVED' : 'ADJUSTMENT',
    quantity,
    previousQuantity,
    newQuantity,
    reason,
  },
});

if (variantId) {
  await prisma.productVariant.update({
    where: { id: variantId },
    data: { inventoryQuantity: newQuantity },
  });
}

const product = await prisma.product.findUnique({
  where: { id: productId },
  select: { title: true },
});

console.log(JSON.stringify({
  success: true,
  product: product?.title || productId,
  location: location.name,
  previousQuantity,
  change: quantity > 0 ? `+${quantity}` : `${quantity}`,
  newQuantity,
  reason,
}, null, 2));

await prisma.$disconnect();
