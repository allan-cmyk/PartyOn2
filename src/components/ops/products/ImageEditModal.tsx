'use client';

import { ReactElement, useState, useEffect } from 'react';
import Image from 'next/image';

interface ImageData {
  id: string;
  url: string;
  altText: string | null;
}

interface ImageEditModalProps {
  image: ImageData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, altText: string) => Promise<void>;
}

/**
 * Modal for editing product image alt text
 */
export function ImageEditModal({
  image,
  isOpen,
  onClose,
  onSave,
}: ImageEditModalProps): ReactElement | null {
  const [altText, setAltText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (image) {
      setAltText(image.altText || '');
      setError(null);
    }
  }, [image]);

  if (!isOpen || !image) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await onSave(image.id, altText);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Edit Image Alt Text</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Image Preview */}
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-4">
            <Image
              src={image.url}
              alt={image.altText || 'Product image'}
              fill
              className="object-contain"
              sizes="400px"
            />
          </div>

          {/* Alt Text Input */}
          <div>
            <label htmlFor="altText" className="block text-sm font-medium text-gray-700 mb-2">
              Alt Text
            </label>
            <textarea
              id="altText"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe this image for accessibility and SEO..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
            />
            <p className="mt-1.5 text-xs text-gray-500">
              Good alt text describes the image content. This helps with accessibility and SEO.
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
