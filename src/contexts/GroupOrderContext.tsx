'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { GroupOrderWithParticipants } from '@/lib/group-orders/types'
import { useGroupOrder } from '@/lib/group-orders/hooks'

interface GroupOrderContextType {
  currentGroupOrder: GroupOrderWithParticipants | null
  isInGroupOrder: boolean
  groupOrderCode: string | null
  isHost: boolean
  setGroupOrderCode: (code: string | null) => void
  clearGroupOrder: () => void
  refreshGroupOrder: () => void
}

const GroupOrderContext = createContext<GroupOrderContextType | undefined>(undefined)

interface GroupOrderProviderProps {
  children: ReactNode
}

export function GroupOrderProvider({ children }: GroupOrderProviderProps) {
  const [groupOrderCode, setGroupOrderCode] = useState<string | null>(null)
  
  const { groupOrder, refresh, error } = useGroupOrder(groupOrderCode)

  // Load saved group order code from localStorage on mount
  useEffect(() => {
    try {
      const savedCode = localStorage.getItem('groupOrderCode')
      if (savedCode) {
        setGroupOrderCode(savedCode)
      }
    } catch {
      // localStorage may be unavailable (SSR, private browsing)
    }
  }, [])

  // Clear invalid group order codes on any error (not just 'not found')
  useEffect(() => {
    if (error && groupOrderCode) {
      setGroupOrderCode(null)
      try { localStorage.removeItem('groupOrderCode') } catch { /* noop */ }
    }
  }, [error, groupOrderCode])

  // Save group order code to localStorage when it changes
  useEffect(() => {
    try {
      if (groupOrderCode) {
        localStorage.setItem('groupOrderCode', groupOrderCode)
      } else {
        localStorage.removeItem('groupOrderCode')
      }
    } catch { /* noop */ }
  }, [groupOrderCode])

  const clearGroupOrder = () => {
    try {
      if (groupOrderCode) {
        localStorage.removeItem(`hostOf_${groupOrderCode}`)
      }
      localStorage.removeItem('groupOrderCode')
    } catch { /* noop */ }
    setGroupOrderCode(null)
  }

  // Check if current user is host of this group order
  let isHost = false
  try {
    isHost = typeof window !== 'undefined' && groupOrderCode
      ? localStorage.getItem(`hostOf_${groupOrderCode}`) === 'true'
      : false
  } catch { /* noop */ }
  const isInGroupOrder = !!groupOrder && groupOrder.status === 'active'

  const value: GroupOrderContextType = {
    currentGroupOrder: groupOrder || null,
    isInGroupOrder,
    groupOrderCode,
    isHost,
    setGroupOrderCode,
    clearGroupOrder,
    refreshGroupOrder: refresh,
  }

  return (
    <GroupOrderContext.Provider value={value}>
      {children}
    </GroupOrderContext.Provider>
  )
}

export function useGroupOrderContext() {
  const context = useContext(GroupOrderContext)
  if (context === undefined) {
    throw new Error('useGroupOrderContext must be used within a GroupOrderProvider')
  }
  return context
}