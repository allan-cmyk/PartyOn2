/**
 * Authentication Service
 * Note: Local Customer model not implemented - auth managed via Shopify Customer Accounts API
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Customer with sensitive fields excluded
 */
export interface SafeCustomer {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  emailVerified: boolean;
  ageVerified: boolean;
  acceptsMarketing: boolean;
  createdAt: Date;
}

/**
 * Registration input
 */
export interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  acceptsMarketing?: boolean;
}

/**
 * Login result
 */
export interface LoginResult {
  success: boolean;
  customer?: SafeCustomer;
  error?: string;
  requiresVerification?: boolean;
}

const NOT_IMPLEMENTED_ERROR = 'Authentication managed via Shopify Customer Accounts API - local auth not implemented';

/**
 * Hash a password (stub)
 */
export async function hashPassword(_password: string): Promise<string> {
  throw new Error(NOT_IMPLEMENTED_ERROR);
}

/**
 * Verify a password against a hash (stub)
 */
export async function verifyPassword(_password: string, _hash: string): Promise<boolean> {
  throw new Error(NOT_IMPLEMENTED_ERROR);
}

/**
 * Generate a secure random token (stub)
 */
export function generateToken(_length: number = 32): string {
  throw new Error(NOT_IMPLEMENTED_ERROR);
}

/**
 * Register a new customer (stub)
 */
export async function registerCustomer(_input: RegisterInput): Promise<{
  success: boolean;
  customer?: SafeCustomer;
  verificationToken?: string;
  error?: string;
}> {
  return { success: false, error: NOT_IMPLEMENTED_ERROR };
}

/**
 * Login a customer (stub)
 */
export async function loginCustomer(
  _email: string,
  _password: string
): Promise<LoginResult> {
  return { success: false, error: NOT_IMPLEMENTED_ERROR };
}

/**
 * Verify email with token (stub)
 */
export async function verifyEmail(_token: string): Promise<{
  success: boolean;
  error?: string;
}> {
  return { success: false, error: NOT_IMPLEMENTED_ERROR };
}

/**
 * Request password reset (stub)
 */
export async function requestPasswordReset(_email: string): Promise<{
  success: boolean;
  resetToken?: string;
  error?: string;
}> {
  return { success: false, error: NOT_IMPLEMENTED_ERROR };
}

/**
 * Reset password with token (stub)
 */
export async function resetPassword(
  _token: string,
  _newPassword: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  return { success: false, error: NOT_IMPLEMENTED_ERROR };
}

/**
 * Change password (for logged-in users) (stub)
 */
export async function changePassword(
  _customerId: string,
  _currentPassword: string,
  _newPassword: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  return { success: false, error: NOT_IMPLEMENTED_ERROR };
}

/**
 * Get customer by ID (stub)
 */
export async function getCustomerById(_customerId: string): Promise<SafeCustomer | null> {
  return null;
}

/**
 * Update customer profile (stub)
 */
export async function updateCustomerProfile(
  _customerId: string,
  _data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    acceptsMarketing?: boolean;
  }
): Promise<SafeCustomer | null> {
  return null;
}

/**
 * Verify customer age (stub)
 */
export async function verifyAge(
  _customerId: string,
  _dateOfBirth: Date
): Promise<{
  success: boolean;
  error?: string;
}> {
  return { success: false, error: NOT_IMPLEMENTED_ERROR };
}
