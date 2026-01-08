'use client';

import { useEffect, ReactElement } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Admin landing page - redirects to appropriate dashboard based on role
 */
export default function AdminPage(): ReactElement {
  const router = useRouter();

  useEffect(() => {
    // Check if authenticated and get role
    const authenticated = sessionStorage.getItem('admin_authenticated');
    const role = sessionStorage.getItem('admin_role');

    if (authenticated === 'true') {
      // Redirect based on role
      if (role === 'admin') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/admin/orders');
      }
    }
    // If not authenticated, the layout will show the login form
  }, [router]);

  // Show loading while checking auth / redirecting
  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-gray-100">
      <div className="text-gray-500">Loading...</div>
    </div>
  );
}
