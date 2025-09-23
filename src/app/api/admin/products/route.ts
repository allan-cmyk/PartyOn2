import { NextRequest, NextResponse } from 'next/server';
import {
  getAllProducts,
  updateProduct,
  addTagsToProduct,
  removeTagsFromProduct,
  setProductTags,
  bulkAddTags
} from '@/lib/shopify/admin/products';

// GET /api/admin/products - Get all products
export async function GET() {
  try {
    const products = await getAllProducts();
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - Update products
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, productId, productIds, data } = body;

    switch (action) {
      case 'update':
        if (!productId) {
          return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }
        const updatedProduct = await updateProduct(productId, data);
        return NextResponse.json({ product: updatedProduct });

      case 'addTags':
        if (!productId || !data.tags) {
          return NextResponse.json({ error: 'Product ID and tags required' }, { status: 400 });
        }
        const productWithNewTags = await addTagsToProduct(productId, data.tags);
        return NextResponse.json({ product: productWithNewTags });

      case 'removeTags':
        if (!productId || !data.tags) {
          return NextResponse.json({ error: 'Product ID and tags required' }, { status: 400 });
        }
        const productWithRemovedTags = await removeTagsFromProduct(productId, data.tags);
        return NextResponse.json({ product: productWithRemovedTags });

      case 'setTags':
        if (!productId || !data.tags) {
          return NextResponse.json({ error: 'Product ID and tags required' }, { status: 400 });
        }
        const productWithSetTags = await setProductTags(productId, data.tags);
        return NextResponse.json({ product: productWithSetTags });

      case 'bulkAddTags':
        if (!productIds || !data.tags) {
          return NextResponse.json({ error: 'Product IDs and tags required' }, { status: 400 });
        }
        await bulkAddTags(productIds, data.tags);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating products:', error);
    return NextResponse.json(
      { error: 'Failed to update products' },
      { status: 500 }
    );
  }
}