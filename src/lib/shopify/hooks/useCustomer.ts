import { useState, useEffect, useCallback } from 'react';
import { shopifyFetch } from '../client';
import { 
  CREATE_CUSTOMER_MUTATION, 
  CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION,
  CUSTOMER_ACCESS_TOKEN_DELETE_MUTATION,
  CUSTOMER_UPDATE_MUTATION,
  CUSTOMER_RECOVER_MUTATION
} from '../mutations/customer';
import { CUSTOMER_QUERY } from '../queries/customer';
import { ShopifyCustomer, CustomerAccessToken, CustomerUserError } from '../types';

const CUSTOMER_TOKEN_KEY = 'shopify_customer_token';
const TOKEN_EXPIRY_KEY = 'shopify_token_expiry';

interface UseCustomerReturn {
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

export function useCustomer(): UseCustomerReturn {
  const [customer, setCustomer] = useState<ShopifyCustomer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Get stored token
  const getStoredToken = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem(CUSTOMER_TOKEN_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    
    if (!token || !expiry) return null;
    
    // Check if token is expired
    if (new Date(expiry) < new Date()) {
      localStorage.removeItem(CUSTOMER_TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      return null;
    }
    
    return token;
  }, []);

  // Store token
  const storeToken = useCallback((token: CustomerAccessToken) => {
    localStorage.setItem(CUSTOMER_TOKEN_KEY, token.accessToken);
    localStorage.setItem(TOKEN_EXPIRY_KEY, token.expiresAt);
  }, []);

  // Clear token
  const clearToken = useCallback(() => {
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  }, []);

  // Fetch customer data
  const fetchCustomer = useCallback(async (token: string) => {
    try {
      const response = await shopifyFetch<{ customer: ShopifyCustomer }>({
        query: CUSTOMER_QUERY,
        variables: { customerAccessToken: token }
      });
      
      if (response.customer) {
        setCustomer(response.customer);
        setIsAuthenticated(true);
        setError(null);
      } else {
        // Token might be invalid
        clearToken();
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Error fetching customer:', err);
      setError('Failed to fetch customer data');
      clearToken();
      setIsAuthenticated(false);
    }
  }, [clearToken]);

  // Initialize on mount
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      fetchCustomer(token);
    } else {
      setLoading(false);
    }
  }, [getStoredToken, fetchCustomer]);

  // Login
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Trim and lowercase email
      const cleanEmail = email.trim().toLowerCase();
      
      const response = await shopifyFetch<{
        customerAccessTokenCreate: {
          customerAccessToken: CustomerAccessToken | null;
          customerUserErrors: CustomerUserError[];
        };
      }>({
        query: CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION,
        variables: {
          input: { email: cleanEmail, password }
        }
      });
      
      const { customerAccessToken, customerUserErrors } = response.customerAccessTokenCreate;
      
      if (customerUserErrors.length > 0) {
        setLoading(false);
        return { success: false, errors: customerUserErrors };
      }
      
      if (customerAccessToken) {
        storeToken(customerAccessToken);
        await fetchCustomer(customerAccessToken.accessToken);
        setLoading(false);
        return { success: true };
      }
      
      setLoading(false);
      return { success: false };
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to login');
      setLoading(false);
      return { success: false };
    }
  }, [storeToken, fetchCustomer]);

  // Logout
  const logout = useCallback(async () => {
    const token = getStoredToken();
    
    if (token) {
      try {
        await shopifyFetch({
          query: CUSTOMER_ACCESS_TOKEN_DELETE_MUTATION,
          variables: { customerAccessToken: token }
        });
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    
    clearToken();
    setCustomer(null);
    setIsAuthenticated(false);
    setError(null);
  }, [getStoredToken, clearToken]);

  // Register
  const register = useCallback(async (input: RegisterInput) => {
    setLoading(true);
    setError(null);
    
    try {
      // Clean and format input data
      const formattedInput = { ...input };
      
      // Trim whitespace from text fields
      if (input.email) formattedInput.email = input.email.trim().toLowerCase();
      if (input.firstName) formattedInput.firstName = input.firstName.trim();
      if (input.lastName) formattedInput.lastName = input.lastName.trim();
      
      // Format phone number to E.164 if provided
      if (input.phone) {
        // Remove all non-digit characters
        const digits = input.phone.replace(/\D/g, '');
        
        // Add US country code if not present
        if (digits.length === 10) {
          formattedInput.phone = `+1${digits}`;
        } else if (digits.length === 11 && digits.startsWith('1')) {
          formattedInput.phone = `+${digits}`;
        } else if (!digits.startsWith('1')) {
          // Assume it's already international format
          formattedInput.phone = `+${digits}`;
        }
      }
      
      const createResponse = await shopifyFetch<{
        customerCreate: {
          customer: ShopifyCustomer | null;
          customerUserErrors: CustomerUserError[];
        };
      }>({
        query: CREATE_CUSTOMER_MUTATION,
        variables: { input: formattedInput }
      });
      
      const { customer: newCustomer, customerUserErrors: createErrors } = createResponse.customerCreate;
      
      if (createErrors.length > 0) {
        setLoading(false);
        return { success: false, errors: createErrors };
      }
      
      if (newCustomer) {
        // Auto-login after registration
        return await login(input.email, input.password);
      }
      
      setLoading(false);
      return { success: false };
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to register');
      setLoading(false);
      return { success: false };
    }
  }, [login]);

  // Update customer
  const update = useCallback(async (input: UpdateInput) => {
    const token = getStoredToken();
    if (!token) return { success: false };
    
    setLoading(true);
    setError(null);
    
    try {
      // Clean and format input data
      const formattedInput = { ...input };
      
      // Trim whitespace from text fields
      if (input.firstName) formattedInput.firstName = input.firstName.trim();
      if (input.lastName) formattedInput.lastName = input.lastName.trim();
      
      // Format phone number to E.164 if provided
      if (input.phone) {
        // Remove all non-digit characters
        const digits = input.phone.replace(/\D/g, '');
        
        // Add US country code if not present
        if (digits.length === 10) {
          formattedInput.phone = `+1${digits}`;
        } else if (digits.length === 11 && digits.startsWith('1')) {
          formattedInput.phone = `+${digits}`;
        } else if (!digits.startsWith('1')) {
          // Assume it's already international format
          formattedInput.phone = `+${digits}`;
        }
      }
      
      const response = await shopifyFetch<{
        customerUpdate: {
          customer: ShopifyCustomer | null;
          customerAccessToken: CustomerAccessToken | null;
          customerUserErrors: CustomerUserError[];
        };
      }>({
        query: CUSTOMER_UPDATE_MUTATION,
        variables: {
          customerAccessToken: token,
          customer: formattedInput
        }
      });
      
      const { customer: updatedCustomer, customerAccessToken, customerUserErrors } = response.customerUpdate;
      
      if (customerUserErrors.length > 0) {
        setLoading(false);
        return { success: false, errors: customerUserErrors };
      }
      
      if (updatedCustomer) {
        setCustomer(updatedCustomer);
        if (customerAccessToken) {
          storeToken(customerAccessToken);
        }
        setLoading(false);
        return { success: true };
      }
      
      setLoading(false);
      return { success: false };
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update customer');
      setLoading(false);
      return { success: false };
    }
  }, [getStoredToken, storeToken]);

  // Recover password
  const recoverPassword = useCallback(async (email: string) => {
    try {
      const response = await shopifyFetch<{
        customerRecover: {
          customerUserErrors: CustomerUserError[];
        };
      }>({
        query: CUSTOMER_RECOVER_MUTATION,
        variables: { email }
      });
      
      const { customerUserErrors } = response.customerRecover;
      
      if (customerUserErrors.length > 0) {
        return { success: false, errors: customerUserErrors };
      }
      
      return { success: true };
    } catch (err) {
      console.error('Password recovery error:', err);
      return { success: false };
    }
  }, []);

  // Refresh customer data
  const refreshCustomer = useCallback(async () => {
    const token = getStoredToken();
    if (token) {
      await fetchCustomer(token);
    }
  }, [getStoredToken, fetchCustomer]);

  return {
    customer,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    register,
    update,
    recoverPassword,
    refreshCustomer
  };
}