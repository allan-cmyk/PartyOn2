#!/usr/bin/env node
/**
 * Adjust inventory for a product (physical stock only — committedQuantity is managed by the order lifecycle)
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
  console.error('Usage: node scripts/ops/adjust-inventory.mjs <product-id> <qty> <reason> [variant-id]');
  process.exit(1);
}

// Find the variant to adjust
let variant;
if (variantId) {
  variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { id: true, inventoryQuantity: true, committedQuantity: true },
  });
} else {
  variant = await prisma.productVariant.findFirst({
    where: { productId },
    select: { id: true, inventoryQuantity: true, committedQuantity: true },
  });
}

if (!variant) {
  console.error(JSON.stringify({ success: false, error: 'No variant found for this product' }));
  process.exit(1);
}

const previousQuantity = variant.inventoryQuantity;
const newQuantity = previousQuantity + quantity;

// Update ProductVariant.inventoryQuantity (physical stock only)
await prisma.productVariant.update({
  where: { id: variant.id },
  data: { inventoryQuantity: newQuantity },
});

// Create audit trail
await prisma.inventoryMovement.create({
  data: {
    variantId: variant.id,
    type: quantity > 0 ? 'RECEIVED' : 'ADJUSTMENT',
    quantity,
    previousQuantity,
    newQuantity,
    reason,
  },
});

const product = await prisma.product.findUnique({
  where: { id: productId },
  select: { title: true },
});

const newAvailable = newQuantity - variant.committedQuantity;

console.log(JSON.stringify({
  success: true,
  product: product?.title || productId,
  previousInStock: previousQuantity,
  change: quantity > 0 ? `+${quantity}` : `${quantity}`,
  newInStock: newQuantity,
  committed: variant.committedQuantity,
  available: newAvailable,
  reason,
}, null, 2));

await prisma.$disconnect();
