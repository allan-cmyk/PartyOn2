'use client';

import { ReactElement, useState, useRef, useCallback } from 'react';
import { ImageCard } from './ImageCard';
import { ImageEditModal } from './ImageEditModal';

interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  position: number;
  width?: number | null;
  height?: number | null;
}

interface ImageManagerProps {
  productId: string;
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
  disabled?: boolean;
}

/**
 * Complete image management component with upload, delete, reorder, and edit
 */
export function ImageManager({
  productId,
  images,
  onImagesChange,
  disabled = false,
}: ImageManagerProps): ReactElement {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState<ProductImage | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sortedImages = [...images].sort((a, b) => a.position - b.position);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0 || disabled) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    const newImages: ProductImage[] = [];
    const totalFiles = files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError(`Invalid file type: ${file.name}. Supported: JPEG, PNG, WebP, GIF`);
        continue;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(`File too large: ${file.name}. Max size: 5MB`);
        continue;
      }

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('productId', productId);
        formData.append('position', String(images.length + i));

        const response = await fetch('/api/v1/admin/products/images', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!result.success) {
          setError(result.error || 'Failed to upload image');
          continue;
        }

        if (result.data.image) {
          newImages.push(result.data.image);
        }

        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
      } catch (err) {
        console.error('Upload error:', err);
        setError(`Failed to upload ${file.name}`);
      }
    }

    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages]);
    }

    setIsUploading(false);
    setUploadProgress(0);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [productId, images, onImagesChange, disabled]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDelete = async (imageId: string) => {
    try {
      const response = await fetch(`/api/v1/admin/products/images/${imageId}?deleteFromStorage=true`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete image');
      }

      // Remove from local state and reindex positions
      const remainingImages = images
        .filter((img) => img.id !== imageId)
        .map((img, idx) => ({ ...img, position: idx }));

      onImagesChange(remainingImages);

      // Update positions in database
      if (remainingImages.length > 0) {
        await fetch(`/api/v1/admin/products/${productId}/images/reorder`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            images: remainingImages.map((img) => ({ id: img.id, position: img.position })),
          }),
        });
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete image');
    }
  };

  const handleEdit = (imageId: string) => {
    const image = images.find((img) => img.id === imageId);
    if (image) {
      setEditingImage(image);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveAltText = async (imageId: string, altText: string) => {
    const response = await fetch(`/api/v1/admin/products/images/${imageId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ altText }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to update alt text');
    }

    // Update local state
    const updatedImages = images.map((img) =>
      img.id === imageId ? { ...img, altText } : img
    );
    onImagesChange(updatedImages);
  };

  const handleSetMain = async (imageId: string) => {
    // Move selected image to position 0, shift others up
    const newOrder = [...images];
    const selectedIndex = newOrder.findIndex((img) => img.id === imageId);
    if (selectedIndex === -1) return;

    const [selected] = newOrder.splice(selectedIndex, 1);
    newOrder.unshift(selected);

    // Assign new positions
    const reorderedImages = newOrder.map((img, idx) => ({ ...img, position: idx }));

    // Optimistically update UI
    onImagesChange(reorderedImages);

    // Save to database
    try {
      await fetch(`/api/v1/admin/products/${productId}/images/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: reorderedImages.map((img) => ({ id: img.id, position: img.position })),
        }),
      });
    } catch (err) {
      console.error('Reorder error:', err);
      setError('Failed to set main image');
    }
  };

  const handleMoveUp = async (imageId: string) => {
    const idx = sortedImages.findIndex((img) => img.id === imageId);
    if (idx <= 0) return;

    const newOrder = [...sortedImages];
    [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];

    const reorderedImages = newOrder.map((img, i) => ({ ...img, position: i }));
    onImagesChange(reorderedImages);

    try {
      await fetch(`/api/v1/admin/products/${productId}/images/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: reorderedImages.map((img) => ({ id: img.id, position: img.position })),
        }),
      });
    } catch (err) {
      console.error('Reorder error:', err);
    }
  };

  const handleMoveDown = async (imageId: string) => {
    const idx = sortedImages.findIndex((img) => img.id === imageId);
    if (idx === -1 || idx >= sortedImages.length - 1) return;

    const newOrder = [...sortedImages];
    [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];

    const reorderedImages = newOrder.map((img, i) => ({ ...img, position: i }));
    onImagesChange(reorderedImages);

    try {
      await fetch(`/api/v1/admin/products/${productId}/images/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: reorderedImages.map((img) => ({ id: img.id, position: img.position })),
        }),
      });
    } catch (err) {
      console.error('Reorder error:', err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
          ${disabled ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300 hover:border-yellow-500 hover:bg-yellow-50'}
          ${isUploading ? 'border-yellow-500 bg-yellow-50' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />

        {isUploading ? (
          <div className="space-y-2">
            <div className="w-8 h-8 mx-auto border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-600">Uploading... {uploadProgress}%</p>
            <div className="w-full max-w-xs mx-auto h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-brand-yellow">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">JPEG, PNG, WebP, or GIF (max 5MB)</p>
          </>
        )}
      </div>

      {/* Image Grid */}
      {sortedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedImages.map((image, idx) => (
            <ImageCard
              key={image.id}
              id={image.id}
              url={image.url}
              altText={image.altText}
              position={image.position}
              isMain={image.position === 0}
              isFirst={idx === 0}
              isLast={idx === sortedImages.length - 1}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onSetMain={handleSetMain}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              disabled={disabled}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {sortedImages.length === 0 && !isUploading && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm">No images yet</p>
          <p className="text-xs mt-1">Upload images to get started</p>
        </div>
      )}

      {/* Edit Modal */}
      <ImageEditModal
        image={editingImage}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingImage(null);
        }}
        onSave={handleSaveAltText}
      />
    </div>
  );
}
