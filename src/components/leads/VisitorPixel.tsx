'use client';

/**
 * Site-wide visitor pixel. Mounted once in the root layout.
 *
 * Fires a PAGE_VIEW beacon on every Next.js navigation (initial load +
 * client-side route changes). Server sets the `pod_vsid` cookie on the
 * first beacon if the visitor doesn't have one yet.
 *
 * Best-effort: failures are swallowed inside fireVisitorPixel().
 */
import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { fireVisitorPixel } from '@/lib/leads/client';

export default function VisitorPixel() {
  const pathname = usePathname();
  const search = useSearchParams();
  const lastFired = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    const key = `${pathname}?${search?.toString() ?? ''}`;
    if (lastFired.current === key) return;
    lastFired.current = key;
    void fireVisitorPixel(pathname);
  }, [pathname, search]);

  return null;
}
