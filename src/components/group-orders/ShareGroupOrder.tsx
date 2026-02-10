'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ShareGroupOrderProps {
  isOpen: boolean
  onClose: () => void
  shareCode: string
  eventName: string
}

export default function ShareGroupOrder({ isOpen, onClose, shareCode, eventName }: ShareGroupOrderProps) {
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  
  const shareUrl = `${window.location.origin}/group/${shareCode}`
  
  const shareMessage = `Join our ${eventName} order on PartyOn Delivery!\n\nClick here to add your items: ${shareUrl}\n\nOr use code: ${shareCode}`

  const copyToClipboard = async (text: string, type: 'link' | 'code') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'link') {
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2000)
      } else {
        setCopiedCode(true)
        setTimeout(() => setCopiedCode(false), 2000)
      }
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80] p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500 bg-opacity-10 rounded-full mb-4">
                <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.632 4.316C18.114 15.938 18 15.482 18 15c0-.482.114-.938.316-1.342m0 2.684a3 3 0 110-2.684M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-cormorant mb-2 tracking-[0.1em]">
                GROUP ORDER CREATED
              </h2>
              <p className="text-gray-600">Share with your group to start collecting orders</p>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm tracking-[0.1em] text-gray-600">SHARE CODE</span>
                  <button
                    onClick={() => copyToClipboard(shareCode, 'code')}
                    className="text-sm text-yellow-500 hover:text-brand-yellow transition-colors"
                  >
                    {copiedCode ? 'COPIED!' : 'COPY'}
                  </button>
                </div>
                <div className="text-2xl font-cormorant tracking-[0.1em]">{shareCode}</div>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm tracking-[0.1em] text-gray-600">SHARE LINK</span>
                  <button
                    onClick={() => copyToClipboard(shareUrl, 'link')}
                    className="text-sm text-yellow-500 hover:text-brand-yellow transition-colors"
                  >
                    {copiedLink ? 'COPIED!' : 'COPY'}
                  </button>
                </div>
                <div className="text-sm text-gray-700 break-all">{shareUrl}</div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3 text-center">Share via</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => {
                      const subject = encodeURIComponent(`Join our ${eventName} order`)
                      const body = encodeURIComponent(shareMessage)
                      window.open(`mailto:?subject=${subject}&body=${body}`)
                    }}
                    className="p-3 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                    title="Email"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      const text = encodeURIComponent(shareMessage)
                      window.open(`sms:?body=${text}`)
                    }}
                    className="p-3 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                    title="SMS"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => copyToClipboard(shareMessage, 'link')}
                    className="p-3 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                    title="Copy message"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-gray-900 text-white py-3 tracking-[0.1em] 
                  hover:bg-gold transition-colors"
              >
                DONE
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}