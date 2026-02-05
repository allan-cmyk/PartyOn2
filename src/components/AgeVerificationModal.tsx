'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'

interface AgeVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onVerify: () => void
}

export default function AgeVerificationModal({ isOpen, onClose, onVerify }: AgeVerificationModalProps) {
  // Lock body scroll when modal is open
  useBodyScrollLock(isOpen);
  const handleYes = () => {
    localStorage.setItem('age_verified', 'true')
    onVerify()
    onClose()
  }

  const handleNo = () => {
    onClose()
    // Optionally redirect to a different page
    window.location.href = 'https://www.google.com'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white max-w-md w-full mx-4 border border-brand-yellow/20 shadow-2xl"
          >
            {/* Elegant Header */}
            <div className="bg-gradient-to-b from-gray-50 to-white px-12 pt-12 pb-8">
              <div className="text-center">
                <div className="font-heading text-5xl text-gray-900 tracking-[0.25em] mb-2" aria-label="Party On Delivery">
                  PARTYON
                </div>
                <div className="w-20 h-px bg-brand-yellow mx-auto"></div>
              </div>
            </div>

            {/* Content */}
            <div className="px-12 pb-12">
              <div className="text-center mb-10">
                <div className="w-20 h-20 mx-auto mb-6 bg-yellow-50 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" 
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                
                <h2 className="font-heading text-2xl text-gray-900 tracking-[0.1em] mb-4">
                  Age Verification
                </h2>
                
                <p className="text-gray-600 leading-relaxed">
                  Premium spirits and fine wines require verification
                </p>
              </div>

              {/* Question */}
              <div className="bg-gray-50 py-8 px-6 mb-8 text-center">
                <p className="text-lg text-gray-800 font-light tracking-wide">
                  Are you 21 years of age or older?
                </p>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleYes}
                  className="py-4 bg-brand-yellow text-gray-900 font-medium tracking-[0.15em] text-sm hover:bg-yellow-600 transition-colors"
                >
                  YES, I AM 21+
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNo}
                  className="py-4 border border-gray-300 text-gray-700 font-medium tracking-[0.15em] text-sm hover:bg-gray-50 transition-colors"
                >
                  NO
                </motion.button>
              </div>

              {/* Legal Text */}
              <p className="mt-8 text-xs text-gray-500 text-center leading-relaxed px-4">
                By entering this site, you agree to our{' '}
                <Link href="/terms" className="underline hover:text-brand-yellow">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="underline hover:text-brand-yellow">Privacy Policy</Link>,
                and confirm that you are of legal drinking age in your jurisdiction.
              </p>
            </div>

            {/* Decorative Bottom Border */}
            <div className="h-1 bg-gradient-to-r from-yellow-500 via-brand-yellow to-yellow-500"></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}