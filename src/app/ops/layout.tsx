'use client';

import { useState, useEffect, ReactElement } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface OpsLayoutProps {
  children: React.ReactNode;
}

export default function OpsLayout({ children }: OpsLayoutProps): ReactElement {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check if already authenticated in this session
    const authenticated = sessionStorage.getItem('ops_authenticated');
    if (authenticated === 'true') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success && (data.role === 'admin' || data.role === 'employee')) {
        sessionStorage.setItem('ops_authenticated', 'true');
        sessionStorage.setItem('ops_role', data.role);
        setIsAuthenticated(true);
        if (pathname === '/ops') {
          router.push('/ops/inventory');
        }
      } else {
        setError(data.error || 'Invalid password');
        setPassword('');
      }
    } catch {
      setError('Failed to verify password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/ops/logout', { method: 'POST' });
    } catch {
      // Best-effort cookie clear
    }
    sessionStorage.removeItem('ops_authenticated');
    sessionStorage.removeItem('ops_role');
    setIsAuthenticated(false);
    setPassword('');
  };

  // Still checking auth status
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Not authenticated - show password form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Party On Operations
            </h1>
            <p className="text-gray-500 text-sm mt-1">Inventory Management System</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password"
                required
                autoFocus
              />
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Navigation items for ops (day-to-day operational tasks)
  const navItems = [
    { href: '/ops/inventory', label: 'Inventory' },
    { href: '/ops/inventory/count', label: 'AI Count' },
    { href: '/ops/inventory/predictions', label: 'Predictions' },
    { href: '/ops/products', label: 'Products' },
    { href: '/ops/orders', label: 'Orders' },
    { href: '/ops/group-orders', label: 'Group Orders' },
    { href: '/ops/collections', label: 'Collections' },
  ];

  // Authenticated - render with navigation
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <nav className="bg-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-8">
              <Link href="/ops/inventory" className="font-semibold text-blue-200">
                Party On Ops
              </Link>
              <div className="flex gap-1">
                {navItems.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === item.href ||
                      (item.href === '/ops/inventory' && pathname === '/ops/inventory') ||
                      (item.href !== '/ops/inventory' && pathname?.startsWith(item.href))
                        ? 'bg-blue-800 text-white'
                        : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/dashboard"
                className="text-sm text-blue-300 hover:text-white transition-colors"
              >
                ← Admin Portal
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-blue-300 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {children}
    </div>
  );
}
