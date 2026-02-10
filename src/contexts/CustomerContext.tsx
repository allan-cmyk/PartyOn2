'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { useAuth, Customer } from '@/lib/auth/hooks/useAuth';
import { mutate } from 'swr';

interface AuthResult {
  success: boolean;
  error?: string;
}

interface CustomerContextValue {
  customer: Customer | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  register: (input: RegisterInput) => Promise<AuthResult>;
  update: (input: UpdateInput) => Promise<AuthResult>;
  recoverPassword: (email: string) => Promise<AuthResult>;
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
  const auth = useAuth();

  const refreshCustomer = useCallback(async () => {
    await mutate('/api/v1/auth/me');
  }, []);

  const contextValue: CustomerContextValue = {
    customer: auth.customer ?? null,
    loading: auth.isLoading,
    error: auth.error,
    isAuthenticated: auth.isAuthenticated,
    login: auth.login,
    logout: auth.logout,
    register: auth.register,
    update: auth.updateProfile,
    recoverPassword: auth.requestPasswordReset,
    refreshCustomer,
  };

  return (
    <CustomerContext.Provider value={contextValue}>
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
