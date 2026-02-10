'use client';

import { ReactElement, useState } from 'react';
import Image from 'next/image';

interface ImageCardProps {
  id: string;
  url: string;
  altText: string | null;
  position: number;
  isMain: boolean;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onSetMain: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  isFirst?: boolean;
  isLast?: boolean;
  disabled?: boolean;
}

/**
 * Single product image card with actions for delete, edit, reorder
 */
export function ImageCard({
  id,
  url,
  altText,
  position,
  isMain,
  onDelete,
  onEdit,
  onSetMain,
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false,
  disabled = false,
}: ImageCardProps): ReactElement {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(id);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="relative group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-100">
        <Image
          src={url}
          alt={altText || 'Product image'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 200px"
        />

        {/* Main Badge */}
        {isMain && (
          <div className="absolute top-2 left-2 bg-brand-yellow text-gray-900 text-xs font-semibold px-2 py-1 rounded">
            Main
          </div>
        )}

        {/* Position Badge */}
        <div className="absolute top-2 right-2 bg-gray-900/70 text-white text-xs px-2 py-1 rounded">
          #{position + 1}
        </div>

        {/* Delete Confirmation Overlay */}
        {showConfirm && (
          <div className="absolute inset-0 bg-gray-900/80 flex flex-col items-center justify-center p-4">
            <p className="text-white text-sm text-center mb-3">Delete this image?</p>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Actions Bar */}
      <div className="p-2 border-t border-gray-100">
        {/* Alt Text Preview */}
        <p className="text-xs text-gray-500 truncate mb-2" title={altText || 'No alt text'}>
          {altText || <span className="italic text-gray-400">No alt text</span>}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-1">
          {/* Move Buttons */}
          <div className="flex gap-1">
            <button
              onClick={() => onMoveUp?.(id)}
              disabled={disabled || isFirst}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
              title="Move up"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              onClick={() => onMoveDown?.(id)}
              disabled={disabled || isLast}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
              title="Move down"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Main Actions */}
          <div className="flex gap-1">
            {!isMain && (
              <button
                onClick={() => onSetMain(id)}
                disabled={disabled}
                className="p-1.5 text-gray-500 hover:text-brand-yellow hover:bg-yellow-50 rounded disabled:opacity-50"
                title="Set as main image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </button>
            )}
            <button
              onClick={() => onEdit(id)}
              disabled={disabled}
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
              title="Edit alt text"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              onClick={handleDeleteClick}
              disabled={disabled}
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
              title="Delete image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
