'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/shopify/hooks/useCart'
import OldFashionedNavigation from '@/components/OldFashionedNavigation'
// import { formatPrice } from '@/lib/shopify/utils' // Removed - unused

export default function PaymentPage() {
  const router = useRouter()
  const { cart, clearCart } = useCart()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkoutInfo, setCheckoutInfo] = useState<{
    customer: { firstName: string; lastName: string };
    delivery: { 
      isExpress: boolean;
      address?: string;
      date?: string;
      time?: string;
    };
  } | null>(null)
  
  // Payment form
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [cardName, setCardName] = useState('')
  
  // Load checkout info
  useEffect(() => {
    const stored = localStorage.getItem('checkoutInfo')
    if (stored) {
      const info = JSON.parse(stored)
      setCheckoutInfo(info)
      setCardName(`${info.customer.firstName} ${info.customer.lastName}`)
    } else {
      router.push('/checkout')
    }
  }, [router])
  
  // Calculate totals
  const subtotal = cart?.lines?.edges?.reduce((sum, { node }) => {
    const price = parseFloat(node.merchandise.price.amount) || 0
    return sum + (price * node.quantity)
  }, 0) || 0
  
  const deliveryFee = checkoutInfo?.delivery?.isExpress ? 0 : 25
  const tax = subtotal * 0.0825
  const total = subtotal + deliveryFee + tax
  
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '')
    const chunks = cleaned.match(/.{1,4}/g) || []
    return chunks.join(' ').substr(0, 19)
  }
  
  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + (cleaned.length > 2 ? '/' + cleaned.slice(2, 4) : '')
    }
    return cleaned
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    // Basic validation
    if (!cardNumber || cardNumber.length < 19) {
      setError('Please enter a valid card number')
      setLoading(false)
      return
    }
    
    if (!cardExpiry || cardExpiry.length < 5) {
      setError('Please enter a valid expiry date')
      setLoading(false)
      return
    }
    
    if (!cardCvc || cardCvc.length < 3) {
      setError('Please enter a valid CVC')
      setLoading(false)
      return
    }
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create mock order
      const orderData = {
        orderNumber: `POD${Date.now().toString().slice(-8)}`,
        customer: checkoutInfo!.customer,
        delivery: checkoutInfo!.delivery,
        items: cart?.lines?.edges?.map(({ node }) => ({
          id: node.id,
          title: node.merchandise.product.title,
          variant: node.merchandise.title !== 'Default Title' ? node.merchandise.title : '',
          quantity: node.quantity,
          price: (parseFloat(node.merchandise.price.amount) * node.quantity).toFixed(2),
          image: node.merchandise.product.images?.edges?.[0]?.node.url
        })),
        totals: {
          subtotal: subtotal.toFixed(2),
          delivery: deliveryFee.toFixed(2),
          tax: tax.toFixed(2),
          total: total.toFixed(2)
        },
        payment: {
          last4: cardNumber.replace(/\s/g, '').slice(-4),
          type: 'card'
        },
        createdAt: new Date().toISOString()
      }
      
      // Store order
      localStorage.setItem('lastOrder', JSON.stringify(orderData))
      
      // Clear checkout info
      localStorage.removeItem('checkoutInfo')
      
      // Clear cart (if your hook supports it)
      if (clearCart) {
        await clearCart()
      }
      
      // Redirect to success page
      router.push('/checkout/success')
      
    } catch (err) {
      console.error('Payment error:', err)
      setError('Payment processing failed. Please try again.')
      setLoading(false)
    }
  }
  
  if (!checkoutInfo || !cart) {
    return (
      <>
        <OldFashionedNavigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600"></div>
        </div>
      </>
    )
  }
  
  return (
    <>
      <OldFashionedNavigation />
      
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm">
                  ✓
                </div>
                <span className="ml-3 text-gray-500 tracking-[0.1em] text-sm">CART</span>
              </div>
              <div className="w-16 h-px bg-gray-300 mx-4" />
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm">
                  ✓
                </div>
                <span className="ml-3 text-gray-500 tracking-[0.1em] text-sm">CHECKOUT</span>
              </div>
              <div className="w-16 h-px bg-gray-300 mx-4" />
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gold-600 rounded-full flex items-center justify-center text-white text-sm">
                  3
                </div>
                <span className="ml-3 text-gray-900 font-medium tracking-[0.1em] text-sm">PAYMENT</span>
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-serif text-gray-900 text-center mb-12 tracking-[0.1em]">
            Payment Information
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white p-6 border border-gray-200">
                  <h2 className="font-serif text-2xl text-gray-900 mb-6 tracking-[0.1em]">
                    Card Details
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-light text-gray-700 mb-2 tracking-[0.1em]">
                        CARDHOLDER NAME
                      </label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-gold-600 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-light text-gray-700 mb-2 tracking-[0.1em]">
                        CARD NUMBER
                      </label>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        maxLength={19}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 border border-gray-300 focus:border-gold-600 focus:outline-none"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-light text-gray-700 mb-2 tracking-[0.1em]">
                          EXPIRY DATE
                        </label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                          maxLength={5}
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 border border-gray-300 focus:border-gold-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-light text-gray-700 mb-2 tracking-[0.1em]">
                          CVC
                        </label>
                        <input
                          type="text"
                          required
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          maxLength={4}
                          placeholder="123"
                          className="w-full px-4 py-3 border border-gray-300 focus:border-gold-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Security badges */}
                  <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-200">
                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Secure Payment</p>
                      <p className="text-xs text-gray-500">Your payment info is encrypted and secure</p>
                    </div>
                  </div>
                </div>
                
                {/* Test Card Notice */}
                <div className="bg-blue-50 border border-blue-200 p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Testing Mode:</strong> Use test card 4242 4242 4242 4242 with any future expiry and CVC
                  </p>
                </div>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 p-4">
                    <p className="text-red-600">{error}</p>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gold-600 text-white hover:bg-gold-700 transition-colors tracking-[0.15em] text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      PROCESSING...
                    </span>
                  ) : (
                    `PAY $${total.toFixed(2)}`
                  )}
                </button>
              </form>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 sticky top-32">
                <div className="p-6">
                  <h2 className="font-serif text-2xl text-gray-900 mb-6 tracking-[0.1em]">
                    Order Summary
                  </h2>
                  
                  {/* Delivery Info */}
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-3 tracking-[0.1em]">DELIVERY TO</h3>
                    <p className="text-sm text-gray-600">{checkoutInfo.delivery.address || 'Address not provided'}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      {checkoutInfo.delivery.date ? new Date(checkoutInfo.delivery.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 'Date not selected'}
                    </p>
                    <p className="text-sm text-gray-600">{checkoutInfo.delivery.time || 'Time not selected'}</p>
                  </div>
                  
                  {/* Items */}
                  <div className="space-y-3 mb-6 max-h-48 overflow-y-auto">
                    {cart.lines.edges.map(({ node }) => (
                      <div key={node.id} className="flex items-start space-x-3">
                        {node.merchandise.product.images?.edges?.[0]?.node && (
                          <img
                            src={node.merchandise.product.images?.edges?.[0]?.node.url}
                            alt={node.merchandise.product.title}
                            className="w-12 h-12 object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{node.merchandise.product.title}</p>
                          {node.merchandise.title !== 'Default Title' && (
                            <p className="text-xs text-gray-500">{node.merchandise.title}</p>
                          )}
                          <p className="text-xs text-gray-500">Qty: {node.quantity}</p>
                        </div>
                        <p className="text-sm text-gray-900">
                          ${(parseFloat(node.merchandise.price.amount) * node.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Totals */}
                  <div className="space-y-2 pt-6 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery</span>
                      <span className="text-gray-900">
                        {checkoutInfo.delivery.isExpress ? (
                          <span className="text-green-600">FREE (Express)</span>
                        ) : (
                          `$${deliveryFee.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="text-gray-900">${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-medium text-lg pt-3 border-t border-gray-200">
                      <span className="font-serif tracking-[0.1em]">TOTAL</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}