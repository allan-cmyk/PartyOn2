'use client'

import { useState, useEffect } from 'react'
import AgeVerificationModal from './AgeVerificationModal'

export default function AgeVerification() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already verified age
    const ageVerified = localStorage.getItem('age_verified')
    if (!ageVerified) {
      setIsVisible(true)
    }
  }, [])

  const handleVerify = () => {
    setIsVisible(false)
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  return (
    <AgeVerificationModal 
      isOpen={isVisible}
      onClose={handleClose}
      onVerify={handleVerify}
    />
  )
}