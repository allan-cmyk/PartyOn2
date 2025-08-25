'use client'

import { useState } from 'react'

interface AgeVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onVerify: () => void
}

export default function AgeVerificationModal({ isOpen, onClose, onVerify }: AgeVerificationModalProps) {
  const [birthDate, setBirthDate] = useState('')
  const [error, setError] = useState('')

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!birthDate) {
      setError('Please enter your date of birth')
      return
    }

    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    if (age >= 21) {
      localStorage.setItem('ageVerified', 'true')
      onVerify()
      onClose()
    } else {
      setError('You must be 21 or older to purchase alcohol')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95">
      <div className="bg-white max-w-md w-full mx-4 p-12 border border-gray-200">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-5xl text-gray-900 tracking-[0.3em]">
            PARTYON
          </h1>
          <div className="mt-2 w-24 h-px bg-gold-600 mx-auto"></div>
        </div>

        {/* Content */}
        <div className="text-center space-y-4 mb-10">
          <h2 className="font-serif text-2xl text-gray-900 tracking-[0.1em]">
            Age Verification Required
          </h2>
          <p className="text-gray-600 leading-relaxed">
            You must be 21 years or older to join this group order. Please verify your age to continue.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label htmlFor="birthdate" className="block text-sm font-light text-gray-700 mb-2 tracking-[0.1em]">
              DATE OF BIRTH
            </label>
            <input
              type="date"
              id="birthdate"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors"
              required
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center">
              {error}
            </p>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              className="w-full py-4 bg-gold-600 text-white tracking-[0.15em] text-sm hover:bg-gold-700 transition-colors"
            >
              VERIFY AGE
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-4 border border-gray-300 text-gray-700 tracking-[0.15em] text-sm hover:border-gray-400 transition-colors"
            >
              CANCEL
            </button>
          </div>
        </form>

        {/* Legal Text */}
        <p className="mt-8 text-xs text-gray-500 text-center leading-relaxed">
          By verifying your age, you confirm that you are of legal drinking age in your jurisdiction.
        </p>

        {/* Decorative Elements */}
        <div className="mt-8 flex items-center justify-center space-x-4">
          <div className="h-px bg-gray-300 flex-1"></div>
          <svg className="w-6 h-6 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div className="h-px bg-gray-300 flex-1"></div>
        </div>
      </div>
    </div>
  )
}