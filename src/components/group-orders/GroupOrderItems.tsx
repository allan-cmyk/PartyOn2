'use client'

import { ReactElement, useEffect, useState } from 'react'
import Image from 'next/image'
import { AggregatedGroupOrderItem, GroupCheckoutStats } from '@/lib/group-orders/types'

interface GroupOrderItemsProps {
  shareCode: string
  className?: string
}

interface ItemsResponse {
  items: AggregatedGroupOrderItem[]
  stats: GroupCheckoutStats | null
  summary: {
    totalItems: number
    totalValue: number
    uniqueProducts: number
  }
}

/**
 * Displays items purchased in a group order
 * Shows aggregated items (combined by title+variant) from all participants who have checked out
 */
export function GroupOrderItems({ shareCode, className = '' }: GroupOrderItemsProps): ReactElement {
  const [data, setData] = useState<ItemsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(`/api/group-orders/${shareCode}/items`)
        if (!response.ok) {
          throw new Error('Failed to fetch items')
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load items')
      } finally {
        setLoading(false)
      }
    }

    fetchItems()

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchItems, 30000)
    return () => clearInterval(interval)
  }, [shareCode])

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="space-y-3">
            <div className="h-16 bg-gray-100 rounded" />
            <div className="h-16 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    )
  }

  const { items, stats, summary } = data || { items: [], stats: null, summary: { totalItems: 0, totalValue: 0, uniqueProducts: 0 } }

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      {/* Header with stats */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-cormorant text-gray-900">
          What&apos;s Been Ordered
        </h3>
        {stats && (
          <span className="text-sm text-gray-500">
            {stats.checkedOut}/{stats.total} checked out
          </span>
        )}
      </div>

      {/* Summary bar */}
      {summary.totalItems > 0 && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <svg className="w-5 h-5 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-sm font-medium text-gray-900">
            Group has ordered: {summary.totalItems} items
          </span>
          <span className="text-sm text-gray-600">
            ${summary.totalValue.toFixed(2)}
          </span>
        </div>
      )}

      {/* Items list */}
      {items.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p className="text-gray-500 text-sm">No items purchased yet</p>
          <p className="text-gray-400 text-xs mt-1">Items will appear here as participants checkout</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
              {/* Product image */}
              <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Product details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                {item.variantTitle && (
                  <p className="text-xs text-gray-500">{item.variantTitle}</p>
                )}
              </div>

              {/* Quantity and price */}
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-medium text-gray-900">x{item.quantity}</p>
                <p className="text-xs text-gray-500">${item.totalPrice.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default GroupOrderItems
