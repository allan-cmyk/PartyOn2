'use client';

import { ReactElement, useState } from 'react';

interface PartnershipInfoTabProps {
  affiliate: {
    code: string;
    hasPassword?: boolean;
  };
  hasPassword: boolean;
}

export default function PartnershipInfoTab({
  affiliate,
  hasPassword,
}: PartnershipInfoTabProps): ReactElement {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://partyondelivery.com';
  const partnerPageLink = `${origin}/partners/${affiliate.code.toLowerCase()}`;
  const referralLink = `${origin}/partners/${affiliate.code.toLowerCase()}?ref=${affiliate.code}`;

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMessage('');

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch('/api/v1/affiliate/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      const result = await res.json();
      if (result.success) {
        setPasswordMessage('Password saved. You can now log in with your email and password.');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(result.error || 'Failed to set password');
      }
    } catch {
      setPasswordError('Network error. Please try again.');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Partner Page */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="font-semibold text-gray-800 mb-2">Your Partner Page</h2>
        <p className="text-sm text-gray-600 mb-3">
          A branded landing page for your business. Share it on social media, in text messages, or directly with customers.
        </p>
        <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm text-[#D4AF37] font-mono break-all">
          {partnerPageLink}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Customers can enter your referral code <span className="font-mono font-bold">{affiliate.code}</span> at checkout to get their discount.
        </p>
      </div>

      {/* Website Referral Link */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="font-semibold text-gray-800 mb-2">Website Referral Link</h2>
        <p className="text-sm text-gray-600 mb-3">
          Embed this on your website, booking confirmations, or email signatures. When someone clicks, they are automatically tagged as your referral for 30 days -- no code needed.
        </p>
        <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm text-[#D4AF37] font-mono break-all">
          {referralLink}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="font-semibold text-gray-800 mb-3">How It Works</h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span className="text-gray-400 shrink-0">&#8226;</span>
            Your customers get <strong className="text-gray-800">free delivery</strong> when they order through your partner page
          </li>
          <li className="flex gap-2">
            <span className="text-gray-400 shrink-0">&#8226;</span>
            You earn a <strong className="text-gray-800">commission</strong> on every order placed through your referral
          </li>
          <li className="flex gap-2">
            <span className="text-gray-400 shrink-0">&#8226;</span>
            The more revenue you refer, the <strong className="text-gray-800">higher your commission rate</strong> grows
          </li>
        </ul>
      </div>

      {/* Commission Tiers */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="font-semibold text-gray-800 mb-3">Commission Tiers</h2>
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1a1a1a]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#D4AF37] tracking-wide">TIER</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#D4AF37] tracking-wide">ANNUAL REVENUE</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#D4AF37] tracking-wide">COMMISSION</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="px-4 py-3 text-gray-700">Starter</td>
                <td className="px-4 py-3 text-center text-gray-500">$0 - $10k</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">5%</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="px-4 py-3 text-gray-700">Growth</td>
                <td className="px-4 py-3 text-center text-gray-500">$10k - $20k</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">8%</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-700">Pro</td>
                <td className="px-4 py-3 text-center text-gray-500">$20k+</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">10%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout Schedule */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="font-semibold text-gray-800 mb-2">Payout Schedule</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Tiers are based on your annual referred revenue, starting from your join date and resetting each year on that anniversary. Commissions are paid out monthly by the <strong>15th of the following month</strong>. You can track your earnings in real time from your partner dashboard.
        </p>
      </div>

      {/* Marketing Tips */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="font-semibold text-gray-800 mb-3">Marketing Tips</h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span className="text-gray-400 shrink-0">&#8226;</span>
            Add your referral link to your website and booking confirmations
          </li>
          <li className="flex gap-2">
            <span className="text-gray-400 shrink-0">&#8226;</span>
            Share your partner page on social media and in your bio
          </li>
          <li className="flex gap-2">
            <span className="text-gray-400 shrink-0">&#8226;</span>
            Mention the <strong className="text-gray-800">free delivery perk</strong> -- it is a great selling point
          </li>
        </ul>
      </div>

      {/* Password Setup */}
      {!hasPassword && (
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="font-semibold text-gray-800 mb-2">Account Password</h2>
          <p className="text-sm text-gray-500 mb-4">
            Set a password to log in directly instead of using an email link each time.
          </p>
          <form onSubmit={handleSetPassword} className="space-y-3 max-w-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="At least 8 characters"
                minLength={8}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Re-enter password"
                minLength={8}
                required
              />
            </div>
            {passwordError && (
              <div className="p-2 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                {passwordError}
              </div>
            )}
            {passwordMessage && (
              <div className="p-2 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
                {passwordMessage}
              </div>
            )}
            <button
              type="submit"
              disabled={passwordSaving}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {passwordSaving ? 'Saving...' : 'Set Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
