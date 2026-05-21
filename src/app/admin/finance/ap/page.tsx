'use client';

import { useEffect, useState, ReactElement } from 'react';

type AgingBucket = 'current' | '1-30' | '31-60' | '61-90' | '90+';
type PaidVia = 'ach' | 'check' | 'card' | 'plaid_match' | 'other';

interface OutstandingApRow {
  id: string;
  distributorName: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  appliedAt: string | null;
  status: string;
  invoiceTotalCents: number | null;
  dueDate: string | null;
  daysPastDue: number | null;
  bucket: AgingBucket;
}

interface ApSummary {
  outstandingCount: number;
  outstandingTotalCents: number;
  pastDueCount: number;
  pastDueTotalCents: number;
  buckets: Record<AgingBucket, { count: number; totalCents: number }>;
}

interface ApData {
  outstanding: OutstandingApRow[];
  summary: ApSummary;
}

type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

function formatCents(cents: number | null): string {
  if (cents === null) return '—';
  return `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function bucketColor(b: AgingBucket): string {
  switch (b) {
    case 'current':
      return 'bg-gray-100 text-gray-700';
    case '1-30':
      return 'bg-yellow-100 text-yellow-800';
    case '31-60':
      return 'bg-orange-100 text-orange-800';
    case '61-90':
      return 'bg-red-100 text-red-800';
    case '90+':
      return 'bg-red-200 text-red-900';
  }
}

export default function FinanceApPage(): ReactElement {
  const [data, setData] = useState<ApData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function fetchData(): Promise<void> {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/finance/ap');
      const body = (await res.json()) as ApiResponse<ApData>;
      if (body.success) {
        setData(body.data);
        setError(null);
      } else {
        setError(body.error);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load AP data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchData();
  }, []);

  async function handleMarkPaid(id: string, paidVia: PaidVia): Promise<void> {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/finance/ap/${id}/mark-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paidVia }),
      });
      const body = (await res.json()) as ApiResponse<unknown>;
      if (!body.success) {
        setError(body.error);
      } else {
        await fetchData();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to mark paid');
    } finally {
      setBusyId(null);
    }
  }

  async function handleEditAp(
    id: string,
    fields: { invoiceTotalCents?: number | null; dueDate?: string | null }
  ): Promise<void> {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/finance/ap/${id}/edit-ap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      const body = (await res.json()) as ApiResponse<unknown>;
      if (!body.success) {
        setError(body.error);
      } else {
        await fetchData();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">Outstanding AP</h1>
        <p className="text-gray-600 text-sm">
          Distributor invoices not yet paid. Phase 1B of the Finance Director —
          totals + due dates are entered manually until Plaid auto-match lands
          in Phase 2C.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md text-sm border bg-red-50 border-red-200 text-red-800">
          Error: {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-600 text-sm">Loading…</p>
      ) : !data ? null : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <SummaryCard
              label="Outstanding"
              value={`${data.summary.outstandingCount}`}
              sub={formatCents(data.summary.outstandingTotalCents)}
            />
            <SummaryCard
              label="Past due"
              value={`${data.summary.pastDueCount}`}
              sub={formatCents(data.summary.pastDueTotalCents)}
              alert={data.summary.pastDueCount > 0}
            />
            {(['1-30', '31-60', '61-90', '90+'] as AgingBucket[]).map((b) => (
              <SummaryCard
                key={b}
                label={`${b} days`}
                value={`${data.summary.buckets[b].count}`}
                sub={formatCents(data.summary.buckets[b].totalCents)}
              />
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="text-left p-3 font-semibold">Distributor</th>
                  <th className="text-left p-3 font-semibold">Invoice #</th>
                  <th className="text-left p-3 font-semibold">Invoice date</th>
                  <th className="text-left p-3 font-semibold">Due date</th>
                  <th className="text-right p-3 font-semibold">Total</th>
                  <th className="text-left p-3 font-semibold">Aging</th>
                  <th className="text-left p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.outstanding.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-gray-500">
                      No outstanding distributor invoices.
                    </td>
                  </tr>
                ) : (
                  data.outstanding.map((row) => (
                    <ApRow
                      key={row.id}
                      row={row}
                      busy={busyId === row.id}
                      onMarkPaid={(via) => handleMarkPaid(row.id, via)}
                      onEditAp={(fields) => handleEditAp(row.id, fields)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  sub,
  alert,
}: {
  label: string;
  value: string;
  sub: string;
  alert?: boolean;
}): ReactElement {
  return (
    <div
      className={`p-3 rounded-lg border text-sm ${
        alert ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
      }`}
    >
      <div className="text-gray-600 text-xs">{label}</div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-gray-500 text-xs">{sub}</div>
    </div>
  );
}

function ApRow({
  row,
  busy,
  onMarkPaid,
  onEditAp,
}: {
  row: OutstandingApRow;
  busy: boolean;
  onMarkPaid: (via: PaidVia) => void;
  onEditAp: (fields: { invoiceTotalCents?: number | null; dueDate?: string | null }) => void;
}): ReactElement {
  const [editing, setEditing] = useState(false);
  const [totalInput, setTotalInput] = useState(
    row.invoiceTotalCents !== null ? (row.invoiceTotalCents / 100).toFixed(2) : ''
  );
  const [dueInput, setDueInput] = useState(row.dueDate ?? '');

  function saveEdit(): void {
    const totalDollars = totalInput.trim() === '' ? null : Number(totalInput);
    const cents =
      totalDollars === null
        ? null
        : Number.isFinite(totalDollars)
          ? Math.round(totalDollars * 100)
          : undefined;
    if (cents === undefined) return;
    onEditAp({
      invoiceTotalCents: cents,
      dueDate: dueInput.trim() === '' ? null : dueInput,
    });
    setEditing(false);
  }

  return (
    <tr className="border-t border-gray-100 align-top">
      <td className="p-3">{row.distributorName ?? '—'}</td>
      <td className="p-3 text-gray-700">{row.invoiceNumber ?? '—'}</td>
      <td className="p-3 text-gray-700">{row.invoiceDate ?? '—'}</td>
      <td className="p-3">
        {editing ? (
          <input
            type="date"
            value={dueInput}
            onChange={(e) => setDueInput(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          />
        ) : (
          row.dueDate ?? <span className="text-gray-400">not set</span>
        )}
      </td>
      <td className="p-3 text-right tabular-nums">
        {editing ? (
          <input
            type="number"
            step="0.01"
            min="0"
            value={totalInput}
            onChange={(e) => setTotalInput(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm w-28 text-right"
          />
        ) : row.invoiceTotalCents !== null ? (
          formatCents(row.invoiceTotalCents)
        ) : (
          <span className="text-gray-400">not set</span>
        )}
      </td>
      <td className="p-3">
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${bucketColor(row.bucket)}`}
        >
          {row.bucket === 'current'
            ? 'Current'
            : row.daysPastDue !== null
              ? `${row.daysPastDue}d past due`
              : row.bucket}
        </span>
      </td>
      <td className="p-3">
        {editing ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={saveEdit}
              disabled={busy}
              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={busy}
              className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setEditing(true)}
              disabled={busy}
              className="px-2 py-1 text-xs bg-white border border-gray-300 text-gray-800 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Edit total / due
            </button>
            <select
              defaultValue=""
              disabled={busy}
              onChange={(e) => {
                const v = e.target.value as PaidVia | '';
                if (v) onMarkPaid(v);
                e.target.value = '';
              }}
              className="px-2 py-1 text-xs border border-gray-300 rounded bg-white"
            >
              <option value="">Mark paid…</option>
              <option value="ach">ACH</option>
              <option value="check">Check</option>
              <option value="card">Card</option>
              <option value="plaid_match">Plaid match</option>
              <option value="other">Other</option>
            </select>
          </div>
        )}
      </td>
    </tr>
  );
}
