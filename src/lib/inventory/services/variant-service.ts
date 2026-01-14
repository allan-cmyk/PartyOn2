/**
 * Product Variant Service
 * Business logic for variant management
 */

import { prisma } from '@/lib/database/client';
import { Prisma, ProductVariant } from '@prisma/client';
import type { VariantCreateInput, VariantUpdateInput } from '../types';

/**
 * Get all variants for a product
 */
export async function getVariantsByProduct(
  productId: string
): Promise<ProductVariant[]> {
  return prisma.productVariant.findMany({
    where: { productId },
    orderBy: { createdAt: 'asc' },
  });
}

/**
 * Get single variant by ID
 */
export async function getVariant(id: string): Promise<ProductVariant | null> {
  return prisma.productVariant.findUnique({ where: { id } });
}

/**
 * Get variant by SKU
 */
export async function getVariantBySku(sku: string): Promise<ProductVariant | null> {
  return prisma.productVariant.findUnique({ where: { sku } });
}

/**
 * Create a new variant
 */
export async function createVariant(
  input: VariantCreateInput
): Promise<ProductVariant> {
  return prisma.productVariant.create({
    data: {
      productId: input.productId,
      sku: input.sku,
      title: input.title || 'Default',
      price: new Prisma.Decimal(input.price),
      compareAtPrice: input.compareAtPrice
        ? new Prisma.Decimal(input.compareAtPrice)
        : null,
      option1Name: input.option1Name,
      option1Value: input.option1Value,
      option2Name: input.option2Name,
      option2Value: input.option2Value,
      option3Name: input.option3Name,
      option3Value: input.option3Value,
      inventoryQuantity: input.inventoryQuantity ?? 0,
      trackInventory: input.trackInventory ?? true,
      allowBackorder: input.allowBackorder ?? false,
      weight: input.weight,
      weightUnit: input.weightUnit || 'g',
    },
  });
}

/**
 * Update a variant
 */
export async function updateVariant(
  input: VariantUpdateInput
): Promise<ProductVariant> {
  const { id, ...data } = input;

  const updateData: Prisma.ProductVariantUpdateInput = {};

  if (data.sku !== undefined) updateData.sku = data.sku;
  if (data.title !== undefined) updateData.title = data.title;
  if (data.price !== undefined) updateData.price = new Prisma.Decimal(data.price);
  if (data.compareAtPrice !== undefined) {
    updateData.compareAtPrice = data.compareAtPrice
      ? new Prisma.Decimal(data.compareAtPrice)
      : null;
  }
  if (data.option1Name !== undefined) updateData.option1Name = data.option1Name;
  if (data.option1Value !== undefined) updateData.option1Value = data.option1Value;
  if (data.option2Name !== undefined) updateData.option2Name = data.option2Name;
  if (data.option2Value !== undefined) updateData.option2Value = data.option2Value;
  if (data.option3Name !== undefined) updateData.option3Name = data.option3Name;
  if (data.option3Value !== undefined) updateData.option3Value = data.option3Value;
  if (data.inventoryQuantity !== undefined) {
    updateData.inventoryQuantity = data.inventoryQuantity;
  }
  if (data.trackInventory !== undefined) updateData.trackInventory = data.trackInventory;
  if (data.allowBackorder !== undefined) updateData.allowBackorder = data.allowBackorder;
  if (data.weight !== undefined) updateData.weight = data.weight;
  if (data.weightUnit !== undefined) updateData.weightUnit = data.weightUnit;

  return prisma.productVariant.update({
    where: { id },
    data: updateData,
  });
}

/**
 * Delete a variant
 */
export async function deleteVariant(id: string): Promise<void> {
  await prisma.productVariant.delete({ where: { id } });
}

/**
 * Bulk update variant prices
 */
export async function bulkUpdatePrices(
  updates: Array<{ id: string; price: number; compareAtPrice?: number | null }>
): Promise<number> {
  let updated = 0;

  for (const update of updates) {
    await prisma.productVariant.update({
      where: { id: update.id },
      data: {
        price: new Prisma.Decimal(update.price),
        compareAtPrice: update.compareAtPrice
          ? new Prisma.Decimal(update.compareAtPrice)
          : null,
      },
    });
    updated++;
  }

  return updated;
}

/**
 * Get variants with low inventory
 */
export async function getLowInventoryVariants(
  threshold = 10
): Promise<Array<ProductVariant & { product: { title: string } }>> {
  return prisma.productVariant.findMany({
    where: {
      trackInventory: true,
      inventoryQuantity: { lte: threshold },
      product: { status: 'ACTIVE' },
    },
    include: {
      product: { select: { title: true } },
    },
    orderBy: { inventoryQuantity: 'asc' },
  });
}
