'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function getImpersonatingName(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)admin_impersonating=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default function ImpersonationBanner() {
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    setName(getImpersonatingName());
  }, []);

  if (!name) return null;

  const handleStop = async () => {
    await fetch('/api/admin/affiliates/stop-impersonating', { method: 'POST' });
    router.push('/admin/affiliates');
  };

  return (
    <div className="bg-amber-500 text-white px-4 py-2 text-sm flex items-center justify-between sticky top-0 z-50">
      <span>
        Admin impersonating: <strong>{name}</strong> -- you have full access to their portal
      </span>
      <button
        onClick={handleStop}
        className="px-3 py-1 bg-white text-amber-700 rounded text-xs font-semibold hover:bg-amber-50"
      >
        Stop Impersonating
      </button>
    </div>
  );
}
