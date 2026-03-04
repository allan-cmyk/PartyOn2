'use client';

import { ReactElement, useState } from 'react';
import Link from 'next/link';

interface AffiliateDashboardHeaderProps {
  contactName: string;
  code: string;
  onLogout: () => void;
}

export default function AffiliateDashboardHeader({
  contactName,
  code,
  onLogout,
}: AffiliateDashboardHeaderProps): ReactElement {
  const [copied, setCopied] = useState<'partner' | 'referral' | false>(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://partyondelivery.com';
  const partnerPageLink = `${origin}/partners/${code.toLowerCase()}`;
  const referralLink = `${origin}/partners/${code.toLowerCase()}?ref=${code}`;

  const handleCopy = (type: 'partner' | 'referral') => {
    const link = type === 'partner' ? partnerPageLink : referralLink;
    navigator.clipboard.writeText(link);
    setCopied(type);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="bg-[#1a1a1a] text-white">
      <div className="max-w-5xl mx-auto px-4 py-4">
        {/* Top row: logo + name + logout */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/images/pod-logo-2025.png"
              alt="Party On Delivery"
              className="h-8"
            />
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">{contactName}</span>
            <button
              onClick={onLogout}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Links row */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="flex-1 flex items-center gap-2 bg-[#2a2a2a] rounded-lg px-3 py-2">
            <span className="text-xs text-gray-400 shrink-0">Partner Page:</span>
            <span className="text-sm text-[#D4AF37] font-mono truncate flex-1">{partnerPageLink}</span>
            <button
              onClick={() => handleCopy('partner')}
              className="text-xs px-2.5 py-1 bg-[#D4AF37] text-[#1a1a1a] rounded font-medium hover:bg-[#c9a430] transition-colors shrink-0"
            >
              {copied === 'partner' ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="flex-1 flex items-center gap-2 bg-[#2a2a2a] rounded-lg px-3 py-2">
            <span className="text-xs text-gray-400 shrink-0">Referral Link:</span>
            <span className="text-sm text-[#D4AF37] font-mono truncate flex-1">{referralLink}</span>
            <button
              onClick={() => handleCopy('referral')}
              className="text-xs px-2.5 py-1 bg-[#D4AF37] text-[#1a1a1a] rounded font-medium hover:bg-[#c9a430] transition-colors shrink-0"
            >
              {copied === 'referral' ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Create Order CTA */}
        <Link
          href="/affiliate/dashboard/create-dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-blue text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Client Order
        </Link>
      </div>
    </header>
  );
}
