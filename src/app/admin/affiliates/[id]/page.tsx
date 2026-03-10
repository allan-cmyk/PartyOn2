'use client';

import { useState, useEffect, ReactElement } from 'react';
import { useParams, useRouter } from 'next/navigation';


interface Commission {
  id: string;
  orderId: string;
  commissionBaseCents: number;
  commissionAmountCents: number;
  commissionRate: string;
  tierAtTime: string;
  status: string;
  isSelfReferral: boolean;
  deliveredAt: string | null;
  holdUntil: string | null;
  voidedReason: string | null;
  createdAt: string;
}

interface Payout {
  id: string;
  payoutPeriod: string;
  totalAmountCents: number;
  status: string;
  processedAt: string | null;
  createdAt: string;
}

interface AffiliateDetail {
  id: string;
  code: string;
  partnerSlug: string | null;
  status: string;
  category: string;
  contactName: string;
  businessName: string;
  email: string;
  phone: string | null;
  commissionRateOverride: string | null;
  categoryRateOverride: string | null;
  customerPerk: string;
  payoutMethod: string | null;
  payoutDetails: unknown;
  internalNotes: string | null;
  createdAt: string;
  commissions: Commission[];
  payouts: Payout[];
}

export default function AffiliateDetailPage(): ReactElement {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const [affiliate, setAffiliate] = useState<AffiliateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editCode, setEditCode] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editPerk, setEditPerk] = useState('Free Delivery');
  const [editCommissionRate, setEditCommissionRate] = useState('');
  const [editContactName, setEditContactName] = useState('');
  const [editBusinessName, setEditBusinessName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCategory, setEditCategory] = useState('OTHER');
  const [editPartnerSlug, setEditPartnerSlug] = useState('');
  const [editCategoryRateOverride, setEditCategoryRateOverride] = useState('');
  const [editPayoutMethod, setEditPayoutMethod] = useState('');
  const [editPayoutDetails, setEditPayoutDetails] = useState('');
  const [sendingWelcome, setSendingWelcome] = useState(false);
  const [welcomeResult, setWelcomeResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetch(`/api/admin/affiliates/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const d = data.data;
          setAffiliate(d);
          setEditCode(d.code);
          setEditNotes(d.internalNotes || '');
          setEditPerk(d.customerPerk || 'Free Delivery');
          setEditCommissionRate(d.commissionRateOverride ? String(Number(d.commissionRateOverride) * 100) : '');
          setEditContactName(d.contactName || '');
          setEditBusinessName(d.businessName || '');
          setEditPhone(d.phone || '');
          setEditCategory(d.category || 'OTHER');
          setEditPartnerSlug(d.partnerSlug || '');
          setEditCategoryRateOverride(d.categoryRateOverride ? String(Number(d.categoryRateOverride) * 100) : '');
          setEditPayoutMethod(d.payoutMethod || '');
          setEditPayoutDetails(d.payoutDetails ? JSON.stringify(d.payoutDetails, null, 2) : '');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      let parsedPayoutDetails: unknown = undefined;
      if (editPayoutDetails.trim()) {
        try {
          parsedPayoutDetails = JSON.parse(editPayoutDetails);
        } catch {
          parsedPayoutDetails = editPayoutDetails;
        }
      } else {
        parsedPayoutDetails = null;
      }

      const res = await fetch(`/api/admin/affiliates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: editCode !== affiliate?.code ? editCode : undefined,
          contactName: editContactName,
          businessName: editBusinessName,
          phone: editPhone || null,
          category: editCategory,
          partnerSlug: editPartnerSlug || null,
          internalNotes: editNotes,
          customerPerk: editPerk,
          commissionRateOverride: editCommissionRate ? Number(editCommissionRate) / 100 : null,
          categoryRateOverride: editCategoryRateOverride ? Number(editCategoryRateOverride) / 100 : null,
          payoutMethod: editPayoutMethod || null,
          payoutDetails: parsedPayoutDetails,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const d = data.data;
        setAffiliate(d);
        setEditCode(d.code);
        setEditContactName(d.contactName || '');
        setEditBusinessName(d.businessName || '');
        setEditPhone(d.phone || '');
        setEditCategory(d.category || 'OTHER');
        setEditPartnerSlug(d.partnerSlug || '');
        setEditCategoryRateOverride(d.categoryRateOverride ? String(Number(d.categoryRateOverride) * 100) : '');
        setEditPayoutMethod(d.payoutMethod || '');
        setEditPayoutDetails(d.payoutDetails ? JSON.stringify(d.payoutDetails, null, 2) : '');
      } else {
        alert(data.error || 'Failed to save');
      }
    } catch {
      alert('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!affiliate) return;
    const newStatus = affiliate.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/affiliates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) setAffiliate(data.data);
    } catch {
      alert('Network error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;
  if (!affiliate) return <div className="p-8 text-red-600">Affiliate not found</div>;

  const totalCommissionCents = affiliate.commissions
    .filter((c) => c.status !== 'VOID')
    .reduce((sum, c) => sum + c.commissionAmountCents, 0);
  const totalRevenueCents = affiliate.commissions
    .filter((c) => c.status !== 'VOID')
    .reduce((sum, c) => sum + c.commissionBaseCents, 0);
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://partyondelivery.com';
  const slug = affiliate.partnerSlug ?? affiliate.code.toLowerCase();
  const referralLink = `${appUrl}/partners/${slug}`;

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      HELD: 'bg-yellow-100 text-yellow-700',
      HELD_REVIEW: 'bg-orange-100 text-orange-700',
      APPROVED: 'bg-blue-100 text-blue-700',
      PAID: 'bg-green-100 text-green-700',
      VOID: 'bg-red-100 text-red-700',
      PENDING: 'bg-gray-100 text-gray-700',
      COMPLETED: 'bg-green-100 text-green-700',
      FAILED: 'bg-red-100 text-red-700',
    };
    return map[s] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.push('/admin/affiliates')} className="text-blue-600 hover:text-blue-800 text-sm">
          &larr; Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{affiliate.businessName}</h1>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(affiliate.status)}`}>
          {affiliate.status}
        </span>
      </div>

      {/* Info + Edit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Details</h2>
          <div className="text-sm space-y-1 text-gray-500">
            <div>Email: {affiliate.email}</div>
            <div>Joined: {new Date(affiliate.createdAt).toLocaleDateString()}</div>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Contact Name</label>
            <input
              value={editContactName}
              onChange={(e) => setEditContactName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Business Name</label>
            <input
              value={editBusinessName}
              onChange={(e) => setEditBusinessName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Phone</label>
            <input
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              placeholder="(512) 555-1234"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Category</label>
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="BARTENDER">Bartender</option>
              <option value="BOAT">Boat</option>
              <option value="VENUE">Venue</option>
              <option value="PLANNER">Planner</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Referral Code</label>
            <input
              value={editCode}
              onChange={(e) => setEditCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Partner Slug</label>
            <input
              value={editPartnerSlug}
              onChange={(e) => setEditPartnerSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="e.g. cocktail-cowboys"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
            />
            <p className="text-xs text-gray-400 mt-1">URL slug for /partners/[slug]. Leave blank to use code.</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Referral Link</label>
            <div className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded break-all">{referralLink}</div>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Customer Perk</label>
            <input
              value={editPerk}
              onChange={(e) => setEditPerk(e.target.value)}
              placeholder="Free Delivery"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">What the customer gets (e.g. &quot;Free Delivery&quot;, &quot;10% Off&quot;)</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Commission Rate Override (%)</label>
            <input
              type="number"
              value={editCommissionRate}
              onChange={(e) => setEditCommissionRate(e.target.value)}
              placeholder="Progressive tiers"
              min="0"
              max="100"
              step="0.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">Leave blank for default progressive tiers (5%/8%/10%)</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Category Rate Override (%)</label>
            <input
              type="number"
              value={editCategoryRateOverride}
              onChange={(e) => setEditCategoryRateOverride(e.target.value)}
              placeholder="No override"
              min="0"
              max="100"
              step="0.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">Override rate for this affiliate category. Leave blank for default.</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Payout Method</label>
            <input
              value={editPayoutMethod}
              onChange={(e) => setEditPayoutMethod(e.target.value)}
              placeholder="e.g. Venmo, Zelle, Check"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Payout Details</label>
            <textarea
              value={editPayoutDetails}
              onChange={(e) => setEditPayoutDetails(e.target.value)}
              rows={2}
              placeholder='e.g. {"venmo": "@username"}'
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
            />
            <p className="text-xs text-gray-400 mt-1">JSON or plain text with payout info</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Internal Notes</label>
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={handleStatusToggle}
              disabled={saving}
              className={`px-4 py-2 rounded text-sm font-medium disabled:opacity-50 ${
                affiliate.status === 'ACTIVE'
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {affiliate.status === 'ACTIVE' ? 'Pause' : 'Activate'}
            </button>
            <button
              onClick={async () => {
                setSendingWelcome(true);
                setWelcomeResult(null);
                try {
                  const res = await fetch(`/api/admin/affiliates/${id}/send-welcome`, { method: 'POST' });
                  const data = await res.json();
                  if (res.ok && data.success) {
                    setWelcomeResult({ success: true, message: `Welcome email sent to ${affiliate.email}` });
                  } else {
                    setWelcomeResult({ success: false, message: data.error || 'Failed to send' });
                  }
                } catch {
                  setWelcomeResult({ success: false, message: 'Network error' });
                } finally {
                  setSendingWelcome(false);
                }
              }}
              disabled={sendingWelcome}
              className="px-4 py-2 bg-pink-600 text-white rounded text-sm font-medium hover:bg-pink-700 disabled:opacity-50"
            >
              {sendingWelcome ? 'Sending...' : 'Send Welcome Email'}
            </button>
          </div>
          {welcomeResult && (
            <div className={`mt-2 text-sm font-medium ${welcomeResult.success ? 'text-green-600' : 'text-red-600'}`}>
              {welcomeResult.message}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">{affiliate.commissions.length}</div>
              <div className="text-xs text-gray-500">Total Orders</div>
            </div>
            <div className="bg-gray-50 rounded p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">${(totalRevenueCents / 100).toLocaleString()}</div>
              <div className="text-xs text-gray-500">Referred Revenue</div>
            </div>
            <div className="bg-gray-50 rounded p-3 text-center">
              <div className="text-2xl font-bold text-green-700">${(totalCommissionCents / 100).toLocaleString()}</div>
              <div className="text-xs text-gray-500">Total Commission</div>
            </div>
            <div className="bg-gray-50 rounded p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">{affiliate.payouts.length}</div>
              <div className="text-xs text-gray-500">Payouts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Commissions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Commissions</h2>
        {affiliate.commissions.length === 0 ? (
          <div className="text-gray-500 text-sm">No commissions yet.</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Order Base</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Tier</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Commission</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {affiliate.commissions.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right text-gray-700">${(c.commissionBaseCents / 100).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{c.tierAtTime}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">${(c.commissionAmountCents / 100).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(c.status)}`}>
                        {c.status}{c.isSelfReferral ? ' (SELF)' : ''}
                      </span>
                      {c.voidedReason && <span className="text-xs text-red-500 ml-1">{c.voidedReason}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payouts */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Payouts</h2>
        {affiliate.payouts.length === 0 ? (
          <div className="text-gray-500 text-sm">No payouts yet.</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Period</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Processed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {affiliate.payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{p.payoutPeriod}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">${(p.totalAmountCents / 100).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(p.status)}`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.processedAt ? new Date(p.processedAt).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
