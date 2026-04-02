'use client';

import { useState, useCallback, type ReactElement } from 'react';
import Image from 'next/image';
import type { GroupOrderV2Full, SubOrderFull } from '@/lib/group-orders-v2/types';
import { addDraftItemV2, removeDraftItemV2 } from '@/lib/group-orders-v2/api-client';

/* ------------------------------------------------------------------ */
/*  Mocktail product data (all exist in DB as "Batched Cocktail")     */
/* ------------------------------------------------------------------ */

const MOCKTAILS = [
  {
    productId: '8131cdd2-1293-4316-b0cd-6635d79674c6',
    variantId: 'a8e9aaa5-986d-4ae4-aea1-cf30413f7dcd',
    title: 'Zilker Lime Fizz Mocktail',
    shortName: 'Zilker Lime Fizz',
    image:
      '/images/products/fresh-victor-cocktails/Zilker%20Lime%20Fizz%20Mocktail/Gemini_Generated_Image_y1rb09y1rb09y1rb.png',
  },
  {
    productId: '76e2da61-630c-4d30-8559-fc4d9c6bfb37',
    variantId: 'c2cd6743-9f97-4162-8629-48813dadd24e',
    title: 'Strawberry Sunset Mocktail',
    shortName: 'Strawberry Sunset',
    image:
      '/images/products/fresh-victor-cocktails/Strawberry%20Sunset%20Mocktail/Gemini_Generated_Image_u5znt5u5znt5u5zn.png',
  },
  {
    productId: '3aa1814d-6f68-4ba1-a093-c4a97e405042',
    variantId: '77b1d069-2190-4c3d-a148-46e45b51ea0e',
    title: 'Mint to Be Mocktail',
    shortName: 'Mint to Be',
    image:
      '/images/products/fresh-victor-cocktails/Mint%20to%20Be%20Mocktail/Gemini_Generated_Image_y9nb3ey9nb3ey9nb.png',
  },
  {
    productId: 'afd33998-7bb4-4511-a8ca-61fdc07ec0fd',
    variantId: 'c8d665e1-6c84-481a-99d7-624613262912',
    title: 'Cucumber Lime Spritz Mocktail',
    shortName: 'Cucumber Lime Spritz',
    image:
      '/images/products/fresh-victor-cocktails/Cucumber%20Lime%20Spritz%20Mocktail/Gemini_Generated_Image_rwjg8drwjg8drwjg.png',
  },
] as const;

const MOCKTAIL_VARIANT_IDS = new Set<string>(MOCKTAILS.map((m) => m.variantId));
const UNLOCK_THRESHOLD = 300;

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface Props {
  groupOrder: GroupOrderV2Full;
  activeTab: SubOrderFull;
  participantId: string;
  shareCode: string;
  onItemChanged: () => void;
}

type Mocktail = (typeof MOCKTAILS)[number];

/* ------------------------------------------------------------------ */
/*  SVG Icons                                                         */
/* ------------------------------------------------------------------ */

function DeliveryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21M3.375 14.25h3.006c.12 0 .24-.023.35-.067l3.014-1.206a.75.75 0 00.476-.706V8.625M2.25 14.25V6.375c0-.621.504-1.125 1.125-1.125h7.5c.621 0 1.125.504 1.125 1.125v2.25m0 0h2.25c.424 0 .816.232 1.02.6l1.98 3.6h1.125c.621 0 1.125.504 1.125 1.125v2.7" />
    </svg>
  );
}

function FridgeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="5" y1="10" x2="19" y2="10" />
      <line x1="9" y1="6" x2="9" y2="8" />
      <line x1="9" y1="13" x2="9" y2="16" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  PerkCard                                                          */
/* ------------------------------------------------------------------ */

function PerkCard({
  icon,
  label,
  subtitle,
  locked,
}: {
  icon: ReactElement;
  label: string;
  subtitle: string;
  locked: boolean;
}) {
  return (
    <div className={`flex flex-col items-center text-center transition-all duration-500 ${locked ? 'opacity-60 grayscale-[50%]' : ''}`}>
      <div className="w-10 h-10 sm:w-12 sm:h-12 mb-1.5 text-emerald-600">{icon}</div>
      <span className="text-sm font-semibold text-emerald-900 leading-tight">{label}</span>
      <span className="text-xs text-emerald-700 mt-0.5">{subtitle}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PlusSeparator                                                     */
/* ------------------------------------------------------------------ */

function PlusSeparator({ locked }: { locked: boolean }) {
  return (
    <span
      className={`text-lg font-bold transition-all duration-500 self-center ${
        locked ? 'text-emerald-300' : 'text-emerald-400'
      }`}
    >
      +
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  MocktailSelector                                                  */
/* ------------------------------------------------------------------ */

function MocktailSelector({
  selected,
  onSelect,
  locked,
}: {
  selected: Mocktail;
  onSelect: (m: Mocktail) => void;
  locked: boolean;
}) {
  return (
    <div className="flex flex-col items-center transition-all duration-500">
      <span className={`text-sm font-semibold text-emerald-900 leading-tight mb-2 transition-opacity duration-500 ${locked ? 'opacity-60' : ''}`}>FREE Mocktail</span>
      <div className="flex gap-1.5">
        {MOCKTAILS.map((m) => (
          <button
            key={m.variantId}
            type="button"
            onClick={() => onSelect(m)}
            className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 transition-all duration-200 flex-shrink-0 cursor-pointer ${
              selected.variantId === m.variantId
                ? 'border-emerald-500 ring-2 ring-emerald-300 scale-110'
                : 'border-gray-200 hover:border-emerald-300'
            }`}
            title={m.shortName}
          >
            <Image
              src={m.image}
              alt={m.shortName}
              fill
              className="object-cover"
              sizes="64px"
            />
          </button>
        ))}
      </div>
      <span className="text-xs text-emerald-700 mt-1.5 h-4 truncate max-w-[160px]">
        {selected.shortName}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PremierPerksBanner (main export)                                  */
/* ------------------------------------------------------------------ */

export default function PremierPerksBanner({
  groupOrder,
  activeTab,
  participantId,
  shareCode,
  onItemChanged,
}: Props): ReactElement | null {
  const [selectedMocktail, setSelectedMocktail] = useState<Mocktail>(MOCKTAILS[0]);
  const [adding, setAdding] = useState(false);

  // Derived state (computed before hooks so values are stable)
  const isPremier = groupOrder.affiliate?.code === 'PREMIER';
  const isBoatTab =
    activeTab.deliveryContextType === 'BOAT' || activeTab.partyType === 'BOAT';
  const visible = isPremier && !isBoatTab;

  const claimedItem = groupOrder.tabs
    .flatMap((tab) => tab.draftItems)
    .find((item) => MOCKTAIL_VARIANT_IDS.has(item.variantId) && item.price === 0) ?? null;

  const alreadyClaimed = !!claimedItem;
  const claimedMocktail = alreadyClaimed
    ? MOCKTAILS.find((m) => m.variantId === claimedItem.variantId) ?? null
    : null;

  const subtotal = activeTab.draftItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const isUnlocked = subtotal >= UNLOCK_THRESHOLD;
  const remaining = UNLOCK_THRESHOLD - subtotal;
  const progress = Math.min(subtotal / UNLOCK_THRESHOLD, 1);

  // Claim the selected mocktail
  const handleClaim = useCallback(async () => {
    if (adding || alreadyClaimed || !isUnlocked) return;
    setAdding(true);
    try {
      await addDraftItemV2(shareCode, activeTab.id, {
        participantId,
        productId: selectedMocktail.productId,
        variantId: selectedMocktail.variantId,
        title: selectedMocktail.title,
        price: 0,
        quantity: 1,
        imageUrl: selectedMocktail.image,
      });
      onItemChanged();
    } catch {
      // allow retry
    } finally {
      setAdding(false);
    }
  }, [adding, alreadyClaimed, isUnlocked, shareCode, activeTab.id, participantId, selectedMocktail, onItemChanged]);

  // Swap an already-claimed mocktail for a different one
  const handleSwap = useCallback(
    async (newMocktail: Mocktail) => {
      if (adding || !claimedItem) return;
      setAdding(true);
      try {
        const tabWithClaim = groupOrder.tabs.find((tab) =>
          tab.draftItems.some((item) => item.id === claimedItem.id)
        );
        if (tabWithClaim) {
          await removeDraftItemV2(shareCode, tabWithClaim.id, claimedItem.id, participantId);
        }
        await addDraftItemV2(shareCode, activeTab.id, {
          participantId,
          productId: newMocktail.productId,
          variantId: newMocktail.variantId,
          title: newMocktail.title,
          price: 0,
          quantity: 1,
          imageUrl: newMocktail.image,
        });
        onItemChanged();
      } catch {
        // allow retry
      } finally {
        setAdding(false);
      }
    },
    [adding, claimedItem, groupOrder.tabs, shareCode, activeTab.id, participantId, onItemChanged]
  );

  // Gate: only Premier affiliate, non-boat tabs
  if (!visible) return null;

  /* ---- Already claimed: compact confirmation ---- */

  if (alreadyClaimed && claimedMocktail) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4">
        <div className="flex items-center gap-3">
          <CheckIcon className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-sm text-emerald-800 font-medium">
              Premier Perks unlocked -- FREE delivery, fridge stocking &amp; {claimedMocktail.shortName}
            </span>
          </div>
          <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-emerald-400 flex-shrink-0">
            <Image
              src={claimedMocktail.image}
              alt={claimedMocktail.shortName}
              fill
              className="object-cover"
              sizes="36px"
            />
          </div>
        </div>
        {/* Swap option */}
        <div className="flex items-center gap-1.5 mt-2 ml-8">
          <span className="text-xs text-emerald-600">Swap:</span>
          {MOCKTAILS.filter((m) => m.variantId !== claimedMocktail.variantId).map((m) => (
            <button
              key={m.variantId}
              type="button"
              disabled={adding}
              onClick={() => handleSwap(m)}
              className="relative w-7 h-7 rounded-full overflow-hidden border border-gray-200 hover:border-emerald-400 transition-colors disabled:opacity-50"
              title={`Swap to ${m.shortName}`}
            >
              <Image src={m.image} alt={m.shortName} fill className="object-cover" sizes="28px" />
            </button>
          ))}
          {adding && (
            <span className="text-xs text-emerald-600 animate-pulse ml-1">Swapping...</span>
          )}
        </div>
      </div>
    );
  }

  /* ---- Main banner: locked or unlocked ---- */

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-heading font-semibold tracking-[0.08em] text-emerald-900 uppercase">
          Premier Perks
        </h3>
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
          $100+ value
        </span>
      </div>

      {/* 3-perk row */}
      <div className="flex items-start justify-center gap-3 sm:gap-4">
        <PerkCard
          icon={<DeliveryIcon className="w-full h-full" />}
          label="FREE Delivery"
          subtitle="$50 value"
          locked={!isUnlocked && !alreadyClaimed}
        />
        <PlusSeparator locked={!isUnlocked && !alreadyClaimed} />
        <PerkCard
          icon={<FridgeIcon className="w-full h-full" />}
          label="FREE Stock the Fridge"
          subtitle=""
          locked={!isUnlocked && !alreadyClaimed}
        />
        <PlusSeparator locked={!isUnlocked && !alreadyClaimed} />
        <MocktailSelector
          selected={selectedMocktail}
          onSelect={setSelectedMocktail}
          locked={!isUnlocked}
        />
      </div>

      {/* Progress bar (locked) or Claim button (unlocked) */}
      {!isUnlocked ? (
        <div className="mt-4">
          <div className="h-2 bg-emerald-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <p className="text-xs text-emerald-700 mt-1.5 font-medium text-center">
            Spend ${remaining.toFixed(2)} more to unlock your Premier Perks!
          </p>
        </div>
      ) : (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={handleClaim}
            disabled={adding}
            className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white font-semibold tracking-[0.08em] rounded-lg hover:bg-emerald-700 active:bg-emerald-800 transition-colors text-sm disabled:opacity-60"
          >
            {adding ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Adding...
              </>
            ) : (
              <>
                <CheckIcon className="w-4 h-4" />
                Claim Free {selectedMocktail.shortName}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
