import { NextRequest, NextResponse } from 'next/server';
import {
  getCollectionProducts,
  addProductsToCollection,
  removeProductsFromCollection,
} from '@/lib/collections/service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');
    const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0');

    const result = await getCollectionProducts(id, { limit, offset });
    return NextResponse.json(result);
  } catch (error) {
    console.error('[Collections Products API] GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch collection products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { productIds } = body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'productIds must be a non-empty array' },
        { status: 400 }
      );
    }

    const result = await addProductsToCollection(id, productIds);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('[Collections Products API] POST error:', error);
    const message = error instanceof Error ? error.message : 'Failed to add products';
    const status = message.includes('not found') ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { productIds } = body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'productIds must be a non-empty array' },
        { status: 400 }
      );
    }

    const result = await removeProductsFromCollection(id, productIds);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[Collections Products API] DELETE error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to remove products' },
      { status: 500 }
    );
  }
}
