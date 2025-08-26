import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const customerId = formData.get('customerId') as string;

    if (!file || !customerId) {
      return NextResponse.json(
        { error: 'File and customer ID are required' },
        { status: 400 }
      );
    }

    // If Supabase is not configured, use base64 fallback
    if (!supabase) {
      // Convert to base64 for localStorage fallback
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;
      
      return NextResponse.json({ 
        url: base64,
        storage: 'localStorage' 
      });
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${customerId}/profile.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('profile-images')
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type
      });

    if (error) {
      console.error('Supabase upload error:', error);
      // Fallback to base64 if Supabase fails
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;
      
      return NextResponse.json({ 
        url: base64,
        storage: 'localStorage' 
      });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(data.path);

    return NextResponse.json({ 
      url: publicUrl,
      storage: 'supabase'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customerId');

  if (!customerId) {
    return NextResponse.json(
      { error: 'Customer ID is required' },
      { status: 400 }
    );
  }

  // If Supabase is not configured, return null
  if (!supabase) {
    return NextResponse.json({ url: null });
  }

  try {
    // List files for this customer
    const { data, error } = await supabase.storage
      .from('profile-images')
      .list(customerId);

    if (error || !data || data.length === 0) {
      return NextResponse.json({ url: null });
    }

    // Get public URL for the profile image
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(`${customerId}/${data[0].name}`);

    return NextResponse.json({ url: publicUrl });

  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ url: null });
  }
}