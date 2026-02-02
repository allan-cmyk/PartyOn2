'use client';

import { ReactElement } from 'react';
import type { DraftCartItemView } from '@/lib/group-orders-v2/types';

interface Props {
  item: DraftCartItemView;
  isOwner: boolean;
  isHost: boolean;
  onUpdateQty?: (itemId: string, qty: number) => void;
  onRemove?: (itemId: string) => void;
}

export default function DraftCartItemRow({
  item,
  isOwner,
  isHost,
  onUpdateQty,
  onRemove,
}: Props): ReactElement {
  const canEdit = (isOwner || isHost) && !!onUpdateQty && !!onRemove;
  const lineTotal = (Number(item.price) * Number(item.quantity)).toFixed(2);

  return (
    <div className="flex items-center gap-3 py-3 border-b border-v2-border last:border-0">
      {/* Image */}
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-12 h-12 rounded-lg object-cover bg-gray-100"
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
      )}

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-v2-text truncate">
            {item.title}
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-v2-bgSoft text-v2-muted whitespace-nowrap">
            {item.addedBy?.name ?? 'Unknown'}
          </span>
        </div>
        {item.variantTitle && (
          <p className="text-xs text-gray-500">{item.variantTitle}</p>
        )}
        <p className="text-sm text-gray-700">${Number(item.price).toFixed(2)} each</p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        {canEdit ? (
          <div className="flex items-center border border-v2-border rounded-lg">
            <button
              onClick={() =>
                item.quantity > 1
                  ? onUpdateQty(item.id, item.quantity - 1)
                  : onRemove(item.id)
              }
              className="px-2 py-1 text-gray-500 hover:text-gray-700"
            >
              -
            </button>
            <span className="px-2 text-sm font-medium text-v2-text">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQty(item.id, item.quantity + 1)}
              className="px-2 py-1 text-gray-500 hover:text-gray-700"
            >
              +
            </button>
          </div>
        ) : (
          <span className="text-sm text-gray-500">x{item.quantity}</span>
        )}
      </div>

      {/* Line Total + Remove */}
      <div className="text-right">
        <p className="text-sm font-medium text-v2-text">${lineTotal}</p>
        {canEdit && (
          <button
            onClick={() => onRemove(item.id)}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
