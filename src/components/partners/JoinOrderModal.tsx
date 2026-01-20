'use client';

import { useState, type ReactElement, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface JoinOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal for joining an existing group order
 * Accepts a share code/name and redirects to the order page
 */
export default function JoinOrderModal({
  isOpen,
  onClose,
}: JoinOrderModalProps): ReactElement | null {
  const [shareCode, setShareCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useBodyScrollLock(isOpen);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!shareCode.trim()) {
      setError('Please enter an order name or code');
      return;
    }

    setIsLoading(true);

    try {
      // Convert share code to URL-safe format
      const urlSafeCode = shareCode.trim().toLowerCase().replace(/\s+/g, '-');

      // Navigate to the group order page
      router.push(`/group/${encodeURIComponent(urlSafeCode)}`);
      onClose();
    } catch {
      setError('Unable to find that order. Please check the code and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setShareCode('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="bg-white max-w-md w-full rounded-lg shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
              <h2 className="font-serif text-xl text-white tracking-wide">
                Join an Order
              </h2>
              <button
                onClick={handleClose}
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                <label htmlFor="shareCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter the order name or code
                </label>
                <input
                  type="text"
                  id="shareCode"
                  value={shareCode}
                  onChange={(e) => setShareCode(e.target.value)}
                  placeholder="e.g., Sarah's Boat Party"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors text-gray-900 placeholder:text-gray-400"
                  autoComplete="off"
                  autoFocus
                />
                <p className="mt-2 text-sm text-gray-500">
                  Ask the host for the order name they created
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gold-500 hover:bg-gold-600 disabled:bg-gold-300 text-gray-900 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Finding order...</span>
                  </>
                ) : (
                  'Join Order'
                )}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              {/* Start New Order Link */}
              <p className="text-center text-sm text-gray-600">
                Want to start your own order?{' '}
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    document.getElementById('start-order')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-gold-600 hover:text-gold-700 font-medium"
                >
                  Start an order
                </button>
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
