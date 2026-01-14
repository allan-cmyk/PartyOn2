/**
 * Authentication Hook
 * Client-side auth state management
 */

'use client';

import { useState, useCallback } from 'react';
import useSWR, { mutate } from 'swr';

/**
 * Customer type (safe version)
 */
export interface Customer {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  emailVerified: boolean;
  ageVerified: boolean;
  acceptsMarketing: boolean;
  createdAt: string;
}

/**
 * Auth response types
 */
interface AuthResponse {
  success: boolean;
  data?: {
    customer?: Customer;
    message?: string;
    requiresVerification?: boolean;
  };
  error?: string;
}

// SWR fetcher
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 401) {
      return { success: false, data: null };
    }
    throw new Error('Failed to fetch');
  }
  return res.json();
};

/**
 * Authentication hook for client components
 */
export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current user with SWR
  const { data, error: swrError, isValidating } = useSWR<AuthResponse>(
    '/api/v1/auth/me',
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  const customer = data?.success ? data.data?.customer : null;
  const isAuthenticated = !!customer;

  /**
   * Register a new account
   */
  const register = useCallback(async (input: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    acceptsMarketing?: boolean;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const result: AuthResponse = await res.json();

      if (!result.success) {
        setError(result.error || 'Registration failed');
        return { success: false, error: result.error };
      }

      // Refresh user data
      await mutate('/api/v1/auth/me');

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Login with email and password
   */
  const login = useCallback(async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; requiresVerification?: boolean }> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result: AuthResponse = await res.json();

      if (!result.success) {
        setError(result.error || 'Login failed');
        return { success: false, error: result.error };
      }

      // Refresh user data
      await mutate('/api/v1/auth/me');

      return {
        success: true,
        requiresVerification: result.data?.requiresVerification,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout
   */
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
      await mutate('/api/v1/auth/me', { success: false, data: null }, false);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Request password reset
   */
  const requestPasswordReset = useCallback(async (
    email: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await res.json();

      if (!result.success) {
        setError(result.error || 'Failed to request password reset');
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to request password reset';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Reset password with token
   */
  const resetPassword = useCallback(async (
    token: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const result = await res.json();

      if (!result.success) {
        setError(result.error || 'Failed to reset password');
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reset password';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Change password (logged-in users)
   */
  const changePassword = useCallback(async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/auth/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const result = await res.json();

      if (!result.success) {
        setError(result.error || 'Failed to change password');
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to change password';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Verify age
   */
  const verifyAge = useCallback(async (
    dateOfBirth: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/auth/age-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateOfBirth }),
      });

      const result = await res.json();

      if (!result.success) {
        setError(result.error || 'Age verification failed');
        return { success: false, error: result.error };
      }

      // Refresh user data
      await mutate('/api/v1/auth/me');

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Age verification failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update profile
   */
  const updateProfile = useCallback(async (data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    acceptsMarketing?: boolean;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!result.success) {
        setError(result.error || 'Failed to update profile');
        return { success: false, error: result.error };
      }

      // Refresh user data
      await mutate('/api/v1/auth/me');

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    customer,
    isAuthenticated,
    isLoading: isLoading || isValidating,
    error: error || (swrError ? swrError.message : null),
    register,
    login,
    logout,
    requestPasswordReset,
    resetPassword,
    changePassword,
    verifyAge,
    updateProfile,
    // Computed values
    isEmailVerified: customer?.emailVerified ?? false,
    isAgeVerified: customer?.ageVerified ?? false,
  };
}
