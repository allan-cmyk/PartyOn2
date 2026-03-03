'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OpsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/ops/orders');
  }, [router]);

  return null;
}
