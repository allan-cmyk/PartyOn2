import { NextRequest, NextResponse } from 'next/server';
import {
  getCollectionById,
  updateCollection,
  deleteCollection,
} from '@/lib/collections/service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const collection = await getCollectionById(id);

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    return NextResponse.json({ collection });
  } catch (error) {
    console.error('[Collections API] GET [id] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch collection' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { handle, title, description, imageUrl, parentId, position } = body;

    const collection = await updateCollection(id, {
      handle,
      title,
      description,
      imageUrl,
      parentId,
      position,
    });

    return NextResponse.json({ collection });
  } catch (error) {
    console.error('[Collections API] PUT error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update collection';
    const status = message.includes('not found') ? 404
      : message.includes('already exists') ? 409
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await deleteCollection(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Collections API] DELETE error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete collection';
    const status = message.includes('not found') ? 404
      : message.includes('child collections') ? 400
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
