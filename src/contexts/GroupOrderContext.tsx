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
  
  const { groupOrder, refresh } = useGroupOrder(groupOrderCode)

  // Load saved group order code from localStorage on mount
  useEffect(() => {
    const savedCode = localStorage.getItem('groupOrderCode')
    
    if (savedCode) {
      setGroupOrderCode(savedCode)
    }
  }, [])

  // Save group order code to localStorage when it changes
  useEffect(() => {
    if (groupOrderCode) {
      localStorage.setItem('groupOrderCode', groupOrderCode)
    } else {
      localStorage.removeItem('groupOrderCode')
    }
  }, [groupOrderCode])

  const clearGroupOrder = () => {
    setGroupOrderCode(null)
    localStorage.removeItem('groupOrderCode')
  }

  // Get customer ID from localStorage for host check
  const customerId = typeof window !== 'undefined' ? localStorage.getItem('customerId') : null
  const isHost = groupOrder?.hostCustomerId === customerId && !!customerId
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