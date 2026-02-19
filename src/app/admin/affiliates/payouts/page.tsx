'use client';

import { useState, useEffect, useCallback, ReactElement } from 'react';

interface PayoutItem {
  id: string;
  affiliateId: string;
  payoutPeriod: string;
  totalAmountCents: number;
  status: string;
  processedAt: string | null;
  createdAt: string;
  affiliate: { id: string; code: string; contactName: string; businessName: string; email: string };
  _count: { commissions: number };
}

export default function PayoutsPage(): ReactElement {
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [generateYear, setGenerateYear] = useState(new Date().getFullYear());
  const [generateMonth, setGenerateMonth] = useState(new Date().getMonth() || 12); // previous month
  const [generating, setGenerating] = useState(false);

  const fetchPayouts = useCallback(async () => {
    const res = await fetch('/api/admin/affiliates/payouts');
    const data = await res.json();
    if (data.success) setPayouts(data.data);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchPayouts().finally(() => setLoading(false));
  }, [fetchPayouts]);

  const handleGenerate = async () => {
    if (!confirm(`Generate payouts for ${generateYear}-${String(generateMonth).padStart(2, '0')}?`)) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/admin/affiliates/payouts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: generateYear, month: generateMonth }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Created ${data.data.payoutsCreated} payouts for ${data.data.period}`);
        await fetchPayouts();
      } else {
        alert(data.error || 'Failed to generate');
      }
    } catch {
      alert('Network error');
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkCompleted = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/affiliates/payouts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
      const data = await res.json();
      if (data.success) await fetchPayouts();
      else alert(data.error);
    } catch {
      alert('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      COMPLETED: 'bg-green-100 text-green-700',
      FAILED: 'bg-red-100 text-red-700',
    };
    return map[s] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Affiliate Payouts</h1>

      {/* Generate section */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-end gap-4 flex-wrap">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Year</label>
          <input
            type="number"
            value={generateYear}
            onChange={(e) => setGenerateYear(parseInt(e.target.value))}
            className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Month</label>
          <select
            value={generateMonth}
            onChange={(e) => setGenerateMonth(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {generating ? 'Generating...' : 'Run Monthly Payout'}
        </button>
      </div>

      {/* Payout list */}
      {loading ? (
        <div className="text-gray-500 py-8 text-center">Loading...</div>
      ) : payouts.length === 0 ? (
        <div className="text-gray-500 py-8 text-center">No payouts yet.</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Period</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Affiliate</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Commissions</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Amount</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payouts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700 font-medium">{p.payoutPeriod}</td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">{p.affiliate.businessName}</div>
                    <div className="text-gray-500 text-xs">{p.affiliate.code} - {p.affiliate.email}</div>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">{p._count.commissions}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">${(p.totalAmountCents / 100).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.status === 'PENDING' && (
                      <button
                        onClick={() => handleMarkCompleted(p.id)}
                        disabled={actionLoading === p.id}
                        className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                      >
                        Mark Completed
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
