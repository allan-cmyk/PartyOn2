'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCustomerContext } from '@/contexts/CustomerContext'

interface AccountLayoutProps {
  children: React.ReactNode
  title?: string
}

export default function AccountLayout({ children, title }: AccountLayoutProps) {
  const pathname = usePathname()
  const { customer } = useCustomerContext()
  
  const navigation = [
    { 
      href: '/account', 
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      href: '/account/orders', 
      label: 'Order History',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    },
    { 
      href: '/account/addresses', 
      label: 'Addresses',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    { 
      href: '/account/preferences', 
      label: 'Preferences',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ]
  
  const getInitials = (firstName?: string, lastName?: string) => {
    const f = firstName?.charAt(0) || ''
    const l = lastName?.charAt(0) || ''
    return (f + l).toUpperCase() || 'U'
  }
  
  const getMemberSince = () => {
    if (!customer?.createdAt) return 'New Member'
    const date = new Date(customer.createdAt)
    return `Member since ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-24">
      {/* Header with Profile */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-white text-2xl font-cormorant">
                  {getInitials(customer?.firstName, customer?.lastName)}
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              
              {/* User Info */}
              <div>
                <h1 className="text-2xl font-cormorant text-gray-900">
                  {customer?.firstName || customer?.lastName 
                    ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
                    : 'Welcome Back'}
                </h1>
                <p className="text-sm text-gray-500">{customer?.email}</p>
                <p className="text-xs text-gray-400 mt-1">{getMemberSince()}</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden md:flex items-center space-x-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{customer?.orders?.edges?.length || 0}</p>
                <p className="text-xs text-gray-500 tracking-[0.1em]">ORDERS</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">Gold</p>
                <p className="text-xs text-gray-500 tracking-[0.1em]">MEMBER</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-xs text-gray-500 tracking-[0.1em]">SAVED ADDRESSES</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-gold-600 text-gold-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {item.icon}
                  <span className="tracking-[0.1em]">{item.label.toUpperCase()}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
      
      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {title && (
          <h2 className="text-3xl font-cormorant text-gray-900 mb-6 tracking-[0.1em]">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  )
}