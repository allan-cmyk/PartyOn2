'use client';

import React, { createContext, useContext } from 'react';
import { useCustomer } from '@/lib/shopify/hooks/useCustomer';
import { ShopifyCustomer, CustomerUserError } from '@/lib/shopify/types';

interface CustomerContextValue {
  customer: ShopifyCustomer | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; errors?: CustomerUserError[] }>;
  logout: () => Promise<void>;
  register: (input: RegisterInput) => Promise<{ success: boolean; errors?: CustomerUserError[] }>;
  update: (input: UpdateInput) => Promise<{ success: boolean; errors?: CustomerUserError[] }>;
  recoverPassword: (email: string) => Promise<{ success: boolean; errors?: CustomerUserError[] }>;
  refreshCustomer: () => Promise<void>;
}

interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  acceptsMarketing?: boolean;
}

interface UpdateInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  acceptsMarketing?: boolean;
}

const CustomerContext = createContext<CustomerContextValue | undefined>(undefined);

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const customerData = useCustomer();

  return (
    <CustomerContext.Provider value={customerData}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomerContext() {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomerContext must be used within a CustomerProvider');
  }
  return context;
}