'use client';

import { useState, type ReactElement } from 'react';
import Image from 'next/image';
import type { Product } from '@/lib/types/product';
import type { DraftCartItemView } from '@/lib/group-orders-v2/types';
import {
  addDraftItemV2,
  updateDraftItemV2,
  removeDraftItemV2,
} from '@/lib/group-orders-v2/api-client';
import ProductDetailModal from './ProductDetailModal';

interface Props {
  product: Product;
  shareCode: string;
  tabId: string;
  participantId: string;
  existingItem?: DraftCartItemView;
  isLocked?: boolean;
  onItemChanged: () => void;
}

export default function DashboardProductCard({
  product,
  shareCode,
  tabId,
  participantId,
  existingItem,
  isLocked,
  onItemChanged,
}: Props): ReactElement {
  const [busy, setBusy] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const variant = product.variants.edges[0]?.node;
  if (!variant) return <div />;

  const price = parseFloat(variant.price.amount);
  const imageUrl = product.images.edges[0]?.node.url;
  const variantTitle =
    variant.title !== 'Default Title' && variant.title !== 'Default'
      ? variant.title
      : null;
  const available = variant.availableForSale && product.availableForSale !== false;
  const qty = existingItem?.quantity || 0;

  // Split title into product name and pack info (e.g. "12 Pack 12oz Cans")
  const bulletIndex = product.title.indexOf(' \u2022 ');
  const productName = bulletIndex >= 0 ? product.title.slice(0, bulletIndex) : product.title;
  const packInfo = bulletIndex >= 0 ? product.title.slice(bulletIndex + 3) : null;

  function refreshWithoutScroll() {
    const scrollY = window.scrollY;
    onItemChanged();
    // Restore scroll position after React re-render
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
    });
  }

  async function handleAdd() {
    if (busy || !available) return;
    setBusy(true);
    try {
      await addDraftItemV2(shareCode, tabId, {
        participantId,
        productId: product.id,
        variantId: variant.id,
        title: product.title,
        variantTitle: variantTitle || undefined,
        price,
        imageUrl,
        quantity: 1,
      });
      refreshWithoutScroll();
    } catch (err) {
      console.error('Failed to add item:', err);
    } finally {
      setBusy(false);
    }
  }

  async function handleIncrement() {
    if (busy || !existingItem) return;
    setBusy(true);
    try {
      await updateDraftItemV2(
        shareCode,
        tabId,
        existingItem.id,
        participantId,
        existingItem.quantity + 1
      );
      refreshWithoutScroll();
    } catch (err) {
      console.error('Failed to update item:', err);
    } finally {
      setBusy(false);
    }
  }

  async function handleDecrement() {
    if (busy || !existingItem) return;
    setBusy(true);
    try {
      if (existingItem.quantity <= 1) {
        await removeDraftItemV2(shareCode, tabId, existingItem.id, participantId);
      } else {
        await updateDraftItemV2(
          shareCode,
          tabId,
          existingItem.id,
          participantId,
          existingItem.quantity - 1
        );
      }
      refreshWithoutScroll();
    } catch (err) {
      console.error('Failed to update item:', err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
        {/* Clickable area: image + title/price -> opens detail modal */}
        <button
          type="button"
          onClick={() => setShowDetail(true)}
          className="text-left cursor-pointer"
        >
          <div className="relative aspect-square bg-gray-100">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            {!available && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-500">Out of stock</span>
              </div>
            )}
          </div>

          <div className="p-2 text-center">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
              {productName}
            </h3>
            {packInfo && (
              <p className="text-sm text-gray-500 leading-tight line-clamp-1 mt-0.5">{packInfo}</p>
            )}
            {variantTitle && (
              <p className="text-sm text-gray-500 mt-0.5">{variantTitle}</p>
            )}
            <p className="text-sm font-semibold text-gray-900 mt-1">${price.toFixed(2)}</p>
          </div>
        </button>

        {/* Cart controls -- centered at bottom of card */}
        <div className="px-2 pb-2 mt-auto flex justify-center">
          {isLocked ? (
            qty > 0 ? (
              <div className="text-center text-sm font-medium text-gray-500 py-1.5 w-full">
                {qty} in cart
              </div>
            ) : null
          ) : qty > 0 ? (
            <div className="flex items-center bg-brand-yellow rounded-full shadow-sm">
              <button
                onClick={handleDecrement}
                disabled={busy}
                className="w-8 h-8 flex items-center justify-center text-gray-900 hover:bg-yellow-400 rounded-l-full transition-colors disabled:opacity-50"
              >
                {qty === 1 ? (
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                ) : (
                  <span className="text-base font-bold leading-none">−</span>
                )}
              </button>
              <span className="text-sm font-bold text-gray-900 min-w-[20px] text-center">
                {busy ? (
                  <span className="inline-block w-3 h-3 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  qty
                )}
              </span>
              <button
                onClick={handleIncrement}
                disabled={busy}
                className="w-8 h-8 flex items-center justify-center text-gray-900 hover:bg-yellow-400 rounded-r-full transition-colors disabled:opacity-50"
              >
                <span className="text-base font-bold leading-none">+</span>
              </button>
            </div>
          ) : available ? (
            <button
              onClick={handleAdd}
              disabled={busy}
              className="w-8 h-8 flex items-center justify-center bg-brand-yellow text-gray-900 rounded-full shadow-sm hover:bg-yellow-400 active:bg-yellow-500 transition-colors disabled:opacity-50"
            >
              {busy ? (
                <span className="inline-block w-3 h-3 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="text-xl font-bold leading-none">+</span>
              )}
            </button>
          ) : null}
        </div>
      </div>

      {showDetail && (
        <ProductDetailModal
          product={product}
          onClose={() => setShowDetail(false)}
          onAddToCart={handleAdd}
          qty={qty}
          busy={busy}
          available={available}
          isLocked={isLocked}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
        />
      )}
    </>
  );
}
