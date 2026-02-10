import { prisma } from '@/lib/database/client';
import type {
  CollectionView,
  CollectionListItem,
  CollectionProductView,
  CreateCollectionInput,
  UpdateCollectionInput,
} from './types';

// ---------------------------------------------------------------------------
// Serialization helpers
// ---------------------------------------------------------------------------

function serializeCollectionList(
  cat: { id: string; handle: string; title: string; imageUrl: string | null; parentId: string | null; position: number; _count: { products: number } }
): CollectionListItem {
  return {
    id: cat.id,
    handle: cat.handle,
    title: cat.title,
    imageUrl: cat.imageUrl,
    parentId: cat.parentId,
    position: cat.position,
    productCount: cat._count.products,
  };
}

function serializeCollectionFull(
  cat: {
    id: string; handle: string; title: string; description: string | null;
    imageUrl: string | null; parentId: string | null; position: number;
    shopifyCollectionId: string | null; createdAt: Date; updatedAt: Date;
    _count: { products: number };
    children: Array<{ id: string; handle: string; title: string; imageUrl: string | null; parentId: string | null; position: number; _count: { products: number } }>;
  }
): CollectionView {
  return {
    id: cat.id,
    handle: cat.handle,
    title: cat.title,
    description: cat.description,
    imageUrl: cat.imageUrl,
    parentId: cat.parentId,
    position: cat.position,
    shopifyCollectionId: cat.shopifyCollectionId,
    productCount: cat._count.products,
    children: cat.children.map(serializeCollectionList),
    createdAt: cat.createdAt.toISOString(),
    updatedAt: cat.updatedAt.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Collection CRUD
// ---------------------------------------------------------------------------

export async function createCollection(input: CreateCollectionInput): Promise<CollectionView> {
  const existing = await prisma.category.findUnique({ where: { handle: input.handle } });
  if (existing) {
    throw new Error(`Collection with handle "${input.handle}" already exists`);
  }

  if (input.parentId) {
    const parent = await prisma.category.findUnique({ where: { id: input.parentId } });
    if (!parent) throw new Error('Parent collection not found');
  }

  const cat = await prisma.category.create({
    data: {
      handle: input.handle,
      title: input.title,
      description: input.description ?? null,
      imageUrl: input.imageUrl ?? null,
      parentId: input.parentId ?? null,
      position: input.position ?? 0,
    },
    include: {
      children: { include: { _count: { select: { products: true } } } },
      _count: { select: { products: true } },
    },
  });

  return serializeCollectionFull(cat);
}

export async function getAllCollections(parentId?: string | null): Promise<CollectionListItem[]> {
  const where = parentId !== undefined ? { parentId } : {};

  const cats = await prisma.category.findMany({
    where,
    orderBy: { position: 'asc' },
    include: { _count: { select: { products: true } } },
  });

  return cats.map(serializeCollectionList);
}

export async function getCollectionByHandle(handle: string): Promise<CollectionView | null> {
  const cat = await prisma.category.findUnique({
    where: { handle },
    include: {
      children: {
        orderBy: { position: 'asc' },
        include: { _count: { select: { products: true } } },
      },
      _count: { select: { products: true } },
    },
  });

  if (!cat) return null;
  return serializeCollectionFull(cat);
}

export async function getCollectionById(id: string): Promise<CollectionView | null> {
  const cat = await prisma.category.findUnique({
    where: { id },
    include: {
      children: {
        orderBy: { position: 'asc' },
        include: { _count: { select: { products: true } } },
      },
      _count: { select: { products: true } },
    },
  });

  if (!cat) return null;
  return serializeCollectionFull(cat);
}

export async function updateCollection(id: string, input: UpdateCollectionInput): Promise<CollectionView> {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw new Error('Collection not found');

  if (input.handle && input.handle !== existing.handle) {
    const conflict = await prisma.category.findUnique({ where: { handle: input.handle } });
    if (conflict) throw new Error(`Collection with handle "${input.handle}" already exists`);
  }

  if (input.parentId) {
    if (input.parentId === id) throw new Error('Collection cannot be its own parent');
    const parent = await prisma.category.findUnique({ where: { id: input.parentId } });
    if (!parent) throw new Error('Parent collection not found');
  }

  const cat = await prisma.category.update({
    where: { id },
    data: {
      ...(input.handle !== undefined && { handle: input.handle }),
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
      ...(input.parentId !== undefined && { parentId: input.parentId }),
      ...(input.position !== undefined && { position: input.position }),
    },
    include: {
      children: {
        orderBy: { position: 'asc' },
        include: { _count: { select: { products: true } } },
      },
      _count: { select: { products: true } },
    },
  });

  return serializeCollectionFull(cat);
}

export async function deleteCollection(id: string): Promise<void> {
  const cat = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { children: true } } },
  });

  if (!cat) throw new Error('Collection not found');
  if (cat._count.children > 0) {
    throw new Error('Cannot delete collection with child collections. Remove children first.');
  }

  await prisma.category.delete({ where: { id } });
}

// ---------------------------------------------------------------------------
// Product assignment
// ---------------------------------------------------------------------------

export async function addProductsToCollection(
  collectionId: string,
  productIds: string[]
): Promise<{ added: number }> {
  const cat = await prisma.category.findUnique({ where: { id: collectionId } });
  if (!cat) throw new Error('Collection not found');

  const maxPos = await prisma.productCategory.aggregate({
    where: { categoryId: collectionId },
    _max: { position: true },
  });

  let nextPos = (maxPos._max.position ?? -1) + 1;

  const result = await prisma.productCategory.createMany({
    data: productIds.map((pid) => ({
      productId: pid,
      categoryId: collectionId,
      position: nextPos++,
    })),
    skipDuplicates: true,
  });

  return { added: result.count };
}

export async function removeProductsFromCollection(
  collectionId: string,
  productIds: string[]
): Promise<{ removed: number }> {
  const result = await prisma.productCategory.deleteMany({
    where: {
      categoryId: collectionId,
      productId: { in: productIds },
    },
  });

  return { removed: result.count };
}

export async function getCollectionProducts(
  collectionId: string,
  opts: { limit?: number; offset?: number } = {}
): Promise<{ products: CollectionProductView[]; total: number }> {
  const { limit = 50, offset = 0 } = opts;

  const [total, rows] = await Promise.all([
    prisma.productCategory.count({ where: { categoryId: collectionId } }),
    prisma.productCategory.findMany({
      where: { categoryId: collectionId },
      orderBy: { position: 'asc' },
      skip: offset,
      take: limit,
      include: {
        product: {
          include: {
            images: { take: 1, orderBy: { position: 'asc' } },
          },
        },
      },
    }),
  ]);

  const products: CollectionProductView[] = rows.map((r) => ({
    id: r.product.id,
    shopifyId: r.product.shopifyId,
    handle: r.product.handle,
    title: r.product.title,
    vendor: r.product.vendor,
    productType: r.product.productType,
    basePrice: Number(r.product.basePrice),
    compareAtPrice: r.product.compareAtPrice ? Number(r.product.compareAtPrice) : null,
    currencyCode: r.product.currencyCode,
    imageUrl: r.product.images[0]?.url ?? null,
    imageAlt: r.product.images[0]?.altText ?? null,
    position: r.position,
  }));

  return { products, total };
}

export async function reorderCollectionProducts(
  collectionId: string,
  productIds: string[]
): Promise<void> {
  await prisma.$transaction(
    productIds.map((pid, idx) =>
      prisma.productCategory.update({
        where: { productId_categoryId: { productId: pid, categoryId: collectionId } },
        data: { position: idx },
      })
    )
  );
}
