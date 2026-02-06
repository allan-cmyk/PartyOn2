'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCartContext } from '@/contexts/CartContext'
import Cart from '@/components/shopify/Cart'

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const { cart, openCart } = useCartContext()
  const pathname = usePathname()
  
  const cartItemCount = cart?.lines.edges.reduce((total, edge) => total + edge.node.quantity, 0) || 0
  
  // Check if we're on a page that needs solid navigation
  const needsSolidNav = pathname?.startsWith('/account') ||
                        pathname?.startsWith('/products') ||
                        pathname?.startsWith('/cart') ||
                        pathname?.startsWith('/checkout') ||
                        pathname?.startsWith('/order') ||
                        pathname?.startsWith('/partners') ||
                        pathname?.startsWith('/contact') ||
                        pathname?.startsWith('/about')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    
    // Set initial scroll state
    handleScroll()
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/about', label: 'ABOUT' },
    { href: '/services', label: 'SERVICES' },
    { href: '/products', label: 'PRODUCTS' },
    { href: '/contact', label: 'CONTACT' },
    { href: '/partners', label: 'PARTNERS' },
  ]

  // Determine if navigation should be solid
  const isSolid = needsSolidNav || isScrolled

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isSolid
          ? 'bg-white shadow-sm py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-blue to-brand-yellow blur-lg opacity-0 group-hover:opacity-50 transition-opacity" />
              <div className="relative flex flex-col items-center leading-none">
                <span className="font-heading text-2xl lg:text-3xl text-gradient-primary">
                  PARTY ON
                </span>
                <span className={`font-sans font-bold text-xs lg:text-sm mt-1 ${
                  isSolid ? 'text-gray-700' : 'text-white'
                }`}>
                  DELIVERY
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8 flex-1 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-sans font-medium text-xs xl:text-sm tracking-[0.15em] transition-all duration-300 relative group whitespace-nowrap ${
                  isSolid
                    ? 'text-gray-700 hover:text-brand-yellow'
                    : 'text-white hover:text-brand-yellow'
                }`}
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-yellow transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>
          
          {/* Right Side Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Cart Icon */}
            <button
              onClick={openCart}
              className={`relative p-2 transition-all duration-300 ${
                isSolid ? 'text-gray-700 hover:text-brand-yellow' : 'text-white hover:text-brand-yellow'
              }`}
              aria-label="Shopping Cart"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-yellow text-gray-900 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden relative w-10 h-10 flex flex-col items-center justify-center ${
              isSolid ? 'text-gray-700' : 'text-white'
            }`}
            aria-label="Toggle menu"
          >
            <span
              className={`absolute h-0.5 w-6 bg-current transform transition-all duration-300 ${
                isMobileMenuOpen ? 'rotate-45' : '-translate-y-2'
              }`}
            />
            <span
              className={`absolute h-0.5 w-6 bg-current transition-all duration-300 ${
                isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`absolute h-0.5 w-6 bg-current transform transition-all duration-300 ${
                isMobileMenuOpen ? '-rotate-45' : 'translate-y-2'
              }`}
            />
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden fixed inset-0 top-[72px] bg-white transition-transform duration-300 ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-3 text-sm font-sans font-medium tracking-[0.15em] text-gray-700 hover:text-brand-yellow transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-gray-200 space-y-3">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  openCart()
                }}
                className="flex items-center justify-between w-full py-3 text-sm font-medium tracking-[0.15em] text-gray-700 hover:text-brand-yellow"
              >
                <span>CART ({cartItemCount})</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Cart renders itself via context */}
      <Cart />
    </nav>
  )
}