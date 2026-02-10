/**
 * Vercel Blob Storage Module
 * Handles image uploads to Vercel Blob
 */

import { put, del, list, type PutBlobResult } from '@vercel/blob';

export interface UploadResult {
  url: string;
  pathname: string;
  contentType: string;
  size: number;
}

/**
 * Upload a file to Vercel Blob
 */
export async function uploadToBlob(
  file: File | Blob,
  options?: {
    filename?: string;
    folder?: string;
    contentType?: string;
  }
): Promise<UploadResult> {
  const { filename, folder, contentType } = options || {};

  // Generate a unique filename if not provided
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const extension = contentType?.split('/')[1] || 'jpg';
  const finalFilename = filename || `${timestamp}-${randomId}.${extension}`;

  // Build the full path
  const pathname = folder ? `${folder}/${finalFilename}` : finalFilename;

  // Upload to Vercel Blob
  const blob: PutBlobResult = await put(pathname, file, {
    access: 'public',
    contentType: contentType || (file instanceof File ? file.type : 'image/jpeg'),
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
    contentType: blob.contentType,
    size: file.size,
  };
}

/**
 * Upload a product image to Vercel Blob
 */
export async function uploadProductImage(
  file: File,
  productId: string
): Promise<UploadResult> {
  return uploadToBlob(file, {
    folder: `products/${productId}`,
    contentType: file.type,
  });
}

/**
 * Delete a file from Vercel Blob
 */
export async function deleteFromBlob(url: string): Promise<void> {
  await del(url);
}

/**
 * List files in Vercel Blob with prefix
 */
export async function listBlobFiles(prefix: string): Promise<string[]> {
  const { blobs } = await list({ prefix });
  return blobs.map((blob) => blob.url);
}

/**
 * Check if Vercel Blob is configured
 */
export function isBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}
