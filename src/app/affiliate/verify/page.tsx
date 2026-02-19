'use client';

import { useEffect, useState, ReactElement, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function VerifyContent(): ReactElement {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'error'>('verifying');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams?.get('token');
    if (!token) {
      setStatus('error');
      setError('No token provided.');
      return;
    }

    fetch(`/api/v1/affiliate/verify?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          router.push(data.redirect || '/affiliate/dashboard');
        } else {
          setStatus('error');
          setError(data.error || 'Verification failed.');
        }
      })
      .catch(() => {
        setStatus('error');
        setError('Network error. Please try again.');
      });
  }, [searchParams, router]);

  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Verifying your login link...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Verification Failed</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link href="/affiliate/login" className="text-blue-600 hover:text-blue-800 font-medium">
          Request a new login link
        </Link>
      </div>
    </div>
  );
}

export default function AffiliateVerifyPage(): ReactElement {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
