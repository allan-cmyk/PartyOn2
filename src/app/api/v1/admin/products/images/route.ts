/**
 * Product Image Upload API
 * POST /api/v1/admin/products/images - Upload a product image
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { prisma } from '@/lib/database/client';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const productId = formData.get('productId') as string | null;
    const position = parseInt(formData.get('position') as string) || 0;
    const altText = formData.get('altText') as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Supported: JPEG, PNG, WebP, GIF' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Max size: 5MB' },
        { status: 400 }
      );
    }

    let imageUrl: string;
    let storageType: string;

    // If Supabase is configured, upload there
    if (supabase) {
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = productId
        ? `${productId}/${timestamp}.${fileExt}`
        : `temp/${timestamp}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        // Fallback to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        imageUrl = `data:${file.type};base64,${buffer.toString('base64')}`;
        storageType = 'base64';
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(data.path);
        imageUrl = publicUrl;
        storageType = 'supabase';
      }
    } else {
      // Fallback to base64 for local dev
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      imageUrl = `data:${file.type};base64,${buffer.toString('base64')}`;
      storageType = 'base64';
    }

    // If productId is provided, save to database
    let savedImage = null;
    if (productId) {
      savedImage = await prisma.productImage.create({
        data: {
          productId,
          url: imageUrl,
          altText: altText || null,
          position,
          width: null,
          height: null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        url: imageUrl,
        storage: storageType,
        image: savedImage,
      },
    });
  } catch (error) {
    console.error('[Product Image Upload] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
