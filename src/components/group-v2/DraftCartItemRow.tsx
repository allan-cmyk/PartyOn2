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
    <div className="flex items-center gap-4 py-4 px-5 bg-gray-50 rounded-xl">
      {/* Image */}
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-24 h-24 rounded-xl object-cover bg-gray-200"
        />
      ) : (
        <div className="w-24 h-24 rounded-xl bg-gray-200 flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
      )}

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1.5">
          <span className="text-lg font-semibold text-gray-900 truncate">
            {item.title}
          </span>
          <span className="text-base px-3 py-1 rounded-full bg-gray-200 text-gray-600 whitespace-nowrap">
            {item.addedBy?.name ?? 'Unknown'}
          </span>
        </div>
        {item.variantTitle && (
          <p className="text-base text-gray-500 mb-1">{item.variantTitle}</p>
        )}
        <p className="text-lg text-gray-700 font-medium">${Number(item.price).toFixed(2)} each</p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-3">
        {canEdit ? (
          <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden">
            <button
              onClick={() =>
                item.quantity > 1
                  ? onUpdateQty(item.id, item.quantity - 1)
                  : onRemove(item.id)
              }
              className="px-4 py-2.5 text-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              -
            </button>
            <span className="px-5 py-2.5 text-xl font-bold text-gray-900 bg-white min-w-[56px] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQty(item.id, item.quantity + 1)}
              className="px-4 py-2.5 text-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              +
            </button>
          </div>
        ) : (
          <span className="text-xl font-medium text-gray-600">x{item.quantity}</span>
        )}
      </div>

      {/* Line Total + Remove */}
      <div className="text-right min-w-[90px]">
        <p className="text-2xl font-bold text-gray-900">${lineTotal}</p>
        {canEdit && (
          <button
            onClick={() => onRemove(item.id)}
            className="text-base text-red-500 hover:text-red-700 font-semibold mt-1"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
