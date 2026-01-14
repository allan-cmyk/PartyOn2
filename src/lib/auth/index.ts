/**
 * Authentication Module
 * Centralized exports for auth functionality
 */

// Auth Service
export {
  registerCustomer,
  loginCustomer,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  changePassword,
  getCustomerById,
  updateCustomerProfile,
  verifyAge,
  hashPassword,
  verifyPassword,
  generateToken,
} from './auth-service';
export type { SafeCustomer, RegisterInput, LoginResult } from './auth-service';

// Session Management
export {
  createSessionToken,
  verifySessionToken,
  setSessionCookie,
  clearSessionCookie,
  getSession,
  requireAuth,
  requireAgeVerification,
} from './session';
export type { SessionPayload } from './session';

// Hooks (client-side)
export { useAuth } from './hooks/useAuth';
export type { Customer } from './hooks/useAuth';
