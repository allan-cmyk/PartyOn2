'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomerContext } from '@/contexts/CustomerContext';

interface CustomerAuthProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string;
}

export default function CustomerAuth({ isOpen, onClose, redirectTo }: CustomerAuthProps) {
  const { login, register, recoverPassword } = useCustomerContext();
  const [mode, setMode] = useState<'login' | 'register' | 'recover'>('login');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    acceptsMarketing: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    setSuccessMessage('');

    try {
      if (mode === 'login') {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          onClose();
          if (redirectTo) {
            window.location.href = redirectTo;
          }
        } else if (result.error) {
          setErrors([result.error]);
        }
      } else if (mode === 'register') {
        const result = await register({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          acceptsMarketing: formData.acceptsMarketing
        });
        if (result.success) {
          onClose();
          if (redirectTo) {
            window.location.href = redirectTo;
          }
        } else if (result.error) {
          setErrors([result.error]);
        }
      } else if (mode === 'recover') {
        const result = await recoverPassword(formData.email);
        if (result.success) {
          setSuccessMessage('Password reset instructions have been sent to your email.');
          setTimeout(() => setMode('login'), 3000);
        } else if (result.error) {
          setErrors([result.error]);
        }
      }
    } catch {
      setErrors(['An unexpected error occurred. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    // Format phone number as user types
    if (name === 'phone') {
      // Remove all non-digit characters
      const digits = value.replace(/\D/g, '');
      
      // Format as (XXX) XXX-XXXX
      let formatted = '';
      if (digits.length > 0) {
        if (digits.length <= 3) {
          formatted = `(${digits}`;
        } else if (digits.length <= 6) {
          formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        } else if (digits.length <= 10) {
          formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
        } else {
          // Don't allow more than 10 digits
          formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
        }
      }
      
      setFormData(prev => ({
        ...prev,
        phone: formatted
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[60]"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center z-[70] p-4"
          >
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 relative">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>

              <h2 className="font-cormorant text-3xl tracking-[0.15em] text-center mb-8">
                {mode === 'login' && 'Welcome Back'}
                {mode === 'register' && 'Create Account'}
                {mode === 'recover' && 'Reset Password'}
              </h2>

              {errors.length > 0 && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  {errors.map((error, index) => (
                    <p key={index} className="text-red-600 text-sm">{error}</p>
                  ))}
                </div>
              )}

              {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-600 text-sm">{successMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="First Name"
                        required
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500"
                      />
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Last Name"
                        required
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500"
                      />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(XXX) XXX-XXXX"
                      pattern="\([0-9]{3}\) [0-9]{3}-[0-9]{4}"
                      title="Phone number format: (123) 456-7890"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500"
                    />
                  </>
                )}

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email Address"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500"
                />

                {mode !== 'recover' && (
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password (min. 5 characters)"
                    required
                    minLength={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500"
                  />
                )}

                {mode === 'register' && (
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      name="acceptsMarketing"
                      checked={formData.acceptsMarketing}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                    />
                    I want to receive exclusive offers and updates
                  </label>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-yellow-500 hover:text-gray-900 transition-all disabled:opacity-50 tracking-[0.1em] border border-gray-900"
                >
                  {loading ? 'Processing...' : (
                    <>
                      {mode === 'login' && 'Sign In'}
                      {mode === 'register' && 'Create Account'}
                      {mode === 'recover' && 'Send Reset Email'}
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-600">
                {mode === 'login' && (
                  <>
                    <button
                      onClick={() => setMode('recover')}
                      className="text-yellow-500 hover:underline"
                    >
                      Forgot password?
                    </button>
                    <div className="mt-2">
                      Don&apos;t have an account?{' '}
                      <button
                        onClick={() => setMode('register')}
                        className="text-yellow-500 hover:underline"
                      >
                        Sign up
                      </button>
                    </div>
                  </>
                )}
                {mode === 'register' && (
                  <div>
                    Already have an account?{' '}
                    <button
                      onClick={() => setMode('login')}
                      className="text-yellow-500 hover:underline"
                    >
                      Sign in
                    </button>
                  </div>
                )}
                {mode === 'recover' && (
                  <button
                    onClick={() => setMode('login')}
                    className="text-yellow-500 hover:underline"
                  >
                    Back to sign in
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}