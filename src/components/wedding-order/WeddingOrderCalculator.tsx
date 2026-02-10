'use client';

import { useState, useMemo, useCallback, type ReactElement } from 'react';
import { useCartContext } from '@/contexts/CartContext';
import type { WeddingTier, SpiritType, WeddingOrderInput } from '@/lib/wedding-packages/types';
import {
  calculateWeddingPackage,
  validateSpiritSelection,
  tierRequiresSpiritPicker,
  DEFAULT_SPIRITS,
  resolveCartItems,
  getChampagneForTier,
} from '@/lib/wedding-packages';
import TierSelector from './TierSelector';
import SpiritPicker from './SpiritPicker';
import PackageBreakdown from './PackageBreakdown';
import RecommendationNotice from './RecommendationNotice';

/**
 * Main wedding order calculator component
 * Combines all inputs and displays calculated package
 */
export default function WeddingOrderCalculator(): ReactElement {
  const { createCartWithItems, openCart, loading: cartLoading } = useCartContext();

  // Form state
  const [guestCount, setGuestCount] = useState(100);
  const [eventHours, setEventHours] = useState(5);
  const [tier, setTier] = useState<WeddingTier>('standard-bar');
  const [selectedSpirits, setSelectedSpirits] = useState<SpiritType[]>(DEFAULT_SPIRITS);
  const [includeChampagneToast, setIncludeChampagneToast] = useState(true);

  // UI state
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Build input object
  const orderInput: WeddingOrderInput = useMemo(
    () => ({
      guestCount,
      eventHours,
      tier,
      selectedSpirits,
      includeChampagneToast,
    }),
    [guestCount, eventHours, tier, selectedSpirits, includeChampagneToast]
  );

  // Calculate package
  const calculation = useMemo(
    () => calculateWeddingPackage(orderInput),
    [orderInput]
  );

  // Validate spirit selection
  const validationError = useMemo(
    () => validateSpiritSelection(tier, selectedSpirits),
    [tier, selectedSpirits]
  );

  // Reset spirits when tier changes if needed
  const handleTierChange = useCallback((newTier: WeddingTier) => {
    setTier(newTier);
    // Reset to default spirits if new tier requires spirit picker
    if (tierRequiresSpiritPicker(newTier)) {
      setSelectedSpirits(DEFAULT_SPIRITS);
    }
  }, []);

  // Add package to cart
  const handleAddToCart = useCallback(async () => {
    if (validationError) return;

    setIsAddingToCart(true);
    try {
      // Resolve product handles to Shopify variant IDs
      const cartItems = await resolveCartItems(calculation.items);

      if (cartItems.length === 0) {
        console.error('No items could be resolved');
        alert('Some products are currently unavailable. Please try again or contact us.');
        return;
      }

      // Create cart with all items
      await createCartWithItems(cartItems);

      // Show success and open cart
      setShowSuccess(true);
      openCart();

      // Hide success message after delay
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Error adding package to cart:', error);
      alert('There was an error adding items to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  }, [calculation.items, createCartWithItems, openCart, validationError]);

  return (
    <div className="space-y-8">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 max-w-sm animate-fade-in">
          <RecommendationNotice />
        </div>
      )}

      {/* Main Grid: 2/3 inputs + 1/3 breakdown on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Left Column: Inputs (takes 2 columns on desktop) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Guest Count & Hours Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Guest Count */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 tracking-[0.1em] uppercase">
                Number of Guests
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min={10}
                  max={500}
                  step={10}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">10</span>
                  <div className="text-center">
                    <span className="text-3xl font-heading text-gray-900">{guestCount}</span>
                    <span className="text-sm text-gray-500 ml-2">guests</span>
                  </div>
                  <span className="text-sm text-gray-500">500</span>
                </div>
              </div>
            </div>

            {/* Event Hours */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 tracking-[0.1em] uppercase">
                Event Duration
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setEventHours((h) => Math.max(1, h - 1))}
                  className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-gray-300 transition-colors"
                  aria-label="Decrease hours"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <div className="flex-1 text-center">
                  <span className="text-3xl font-heading text-gray-900">{eventHours}</span>
                  <span className="text-sm text-gray-500 ml-2">hours</span>
                </div>
                <button
                  onClick={() => setEventHours((h) => Math.min(12, h + 1))}
                  className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-gray-300 transition-colors"
                  aria-label="Increase hours"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Tier Selection */}
          <TierSelector
            selectedTier={tier}
            onTierChange={handleTierChange}
            guestCount={guestCount}
          />

          {/* Spirit Picker (conditional) */}
          <SpiritPicker
            selectedSpirits={selectedSpirits}
            onSpiritsChange={setSelectedSpirits}
            tier={tier}
          />

          {/* Champagne Toast Option */}
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <label className="flex items-start gap-4 cursor-pointer">
              <input
                type="checkbox"
                checked={includeChampagneToast}
                onChange={(e) => setIncludeChampagneToast(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-brand-yellow focus:ring-yellow-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                  </svg>
                  <span className="font-medium text-gray-900">Include Champagne Toast</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Add {getChampagneForTier(tier).name} for a celebratory toast (1 glass per guest)
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Right Column: Results (takes 1 column on desktop) */}
        <div className="lg:col-span-1 lg:sticky lg:top-8 lg:self-start">
          <PackageBreakdown
            calculation={calculation}
            isLoading={isAddingToCart || cartLoading}
            onAddToCart={handleAddToCart}
            validationError={validationError}
          />
        </div>
      </div>

      {/* Bottom Notice */}
      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">How This Works</h4>
            <p className="text-sm text-gray-600">
              This calculator generates a recommended order based on your event details.
              After adding to cart, you can adjust quantities, add or remove items.
              We recommend contacting us before placing your final order to ensure
              everything is perfect for your wedding.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
