'use client';

import { useState, useEffect, useCallback, ReactElement } from 'react';

interface CommissionItem {
  id: string;
  commissionBaseCents: number;
  commissionAmountCents: number;
  commissionRate: string;
  tierAtTime: string;
  status: string;
  isSelfReferral: boolean;
  voidedReason: string | null;
  deliveredAt: string | null;
  holdUntil: string | null;
  createdAt: string;
  affiliate: { id: string; code: string; businessName: string; email: string };
  order: { id: string; orderNumber: number; customerName: string; customerEmail: string; subtotal: string; total: string; createdAt: string };
}

type StatusFilter = 'all' | 'HELD' | 'HELD_REVIEW' | 'APPROVED' | 'VOID' | 'PAID';

export default function CommissionsPage(): ReactElement {
  const [commissions, setCommissions] = useState<CommissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('HELD_REVIEW');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchCommissions = useCallback(async () => {
    const url = filter === 'all'
      ? '/api/ops/affiliates/commissions'
      : `/api/ops/affiliates/commissions?status=${filter}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.success) setCommissions(data.data);
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    fetchCommissions().finally(() => setLoading(false));
  }, [fetchCommissions]);

  const handleAction = async (id: string, action: 'approve' | 'void') => {
    const reason = action === 'void' ? prompt('Void reason:') : undefined;
    if (action === 'void' && reason === null) return; // cancelled prompt

    setActionLoading(id);
    try {
      const res = await fetch(`/api/ops/affiliates/commissions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });
      const data = await res.json();
      if (data.success) await fetchCommissions();
      else alert(data.error || 'Failed');
    } catch {
      alert('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      HELD: 'bg-yellow-100 text-yellow-700',
      HELD_REVIEW: 'bg-orange-100 text-orange-700',
      APPROVED: 'bg-blue-100 text-blue-700',
      PAID: 'bg-green-100 text-green-700',
      VOID: 'bg-red-100 text-red-700',
    };
    return map[s] || 'bg-gray-100 text-gray-700';
  };

  const filters: StatusFilter[] = ['HELD_REVIEW', 'HELD', 'APPROVED', 'PAID', 'VOID', 'all'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Commission Review</h1>

      <div className="flex gap-2 mb-4 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'All' : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-gray-500 py-8 text-center">Loading...</div>
      ) : commissions.length === 0 ? (
        <div className="text-gray-500 py-8 text-center">No commissions found for this filter.</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Date</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Affiliate</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Order</th>
                <th className="px-3 py-3 text-right font-medium text-gray-600">Base</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Tier</th>
                <th className="px-3 py-3 text-right font-medium text-gray-600">Commission</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-3 py-3 text-right font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {commissions.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3 text-gray-700">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-3 py-3">
                    <div className="font-medium text-gray-900">{c.affiliate.code}</div>
                    <div className="text-gray-500 text-xs">{c.affiliate.businessName}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-gray-700">PO-{c.order.orderNumber}</div>
                    <div className="text-gray-500 text-xs">{c.order.customerName}</div>
                  </td>
                  <td className="px-3 py-3 text-right text-gray-700">${(c.commissionBaseCents / 100).toFixed(2)}</td>
                  <td className="px-3 py-3 text-gray-500 text-xs">{c.tierAtTime}</td>
                  <td className="px-3 py-3 text-right font-medium text-gray-900">${(c.commissionAmountCents / 100).toFixed(2)}</td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(c.status)}`}>
                      {c.status}
                    </span>
                    {c.isSelfReferral && <span className="text-xs text-orange-600 ml-1">SELF</span>}
                    {c.voidedReason && <div className="text-xs text-red-500 mt-0.5">{c.voidedReason}</div>}
                  </td>
                  <td className="px-3 py-3 text-right">
                    {(c.status === 'HELD' || c.status === 'HELD_REVIEW') && (
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => handleAction(c.id, 'approve')}
                          disabled={actionLoading === c.id}
                          className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(c.id, 'void')}
                          disabled={actionLoading === c.id}
                          className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
                        >
                          Void
                        </button>
                      </div>
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
