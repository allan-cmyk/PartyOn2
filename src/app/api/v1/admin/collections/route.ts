import { NextRequest, NextResponse } from 'next/server';
import { getAllCollections, createCollection } from '@/lib/collections/service';

export async function GET(request: NextRequest) {
  try {
    const parentId = request.nextUrl.searchParams.get('parentId');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '100');
    const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0');

    const { collections, total } = await getAllCollections(
      parentId === '' ? null : parentId ?? undefined,
      { limit, offset }
    );
    return NextResponse.json({ collections, total });
  } catch (error) {
    console.error('[Collections API] GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { handle, title, description, imageUrl, parentId, position } = body;

    if (!handle || !title) {
      return NextResponse.json(
        { error: 'handle and title are required' },
        { status: 400 }
      );
    }

    const collection = await createCollection({
      handle,
      title,
      description,
      imageUrl,
      parentId,
      position,
    });

    return NextResponse.json({ collection }, { status: 201 });
  } catch (error) {
    console.error('[Collections API] POST error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create collection';
    const status = message.includes('already exists') ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
