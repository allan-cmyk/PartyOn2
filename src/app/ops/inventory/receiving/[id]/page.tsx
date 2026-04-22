'use client';

import { useEffect, useState, ReactElement, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Suggestion {
  variantId: string;
  productId: string;
  productTitle: string;
  variantTitle: string | null;
  score: number;
}

interface Line {
  id: string;
  distributorSku: string | null;
  distributorDescription: string;
  cases: number;
  unitsPerCase: number;
  totalUnits: number;
  matchedVariantId: string | null;
  matchedVariant: Suggestion | null;
  suggestions: Suggestion[];
  status: string;
  notes: string | null;
}

interface Invoice {
  id: string;
  imageUrl: string;
  distributorName: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  status: string;
  parseErrorMessage: string | null;
  lines: Line[];
}

interface VariantOption {
  id: string;
  productTitle: string;
  variantTitle: string | null;
}

export default function ReceivingReviewPage({ params }: { params: Promise<{ id: string }> }): ReactElement {
  const { id } = use(params);
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [savingLineId, setSavingLineId] = useState<string | null>(null);
  const [variantSearch, setVariantSearch] = useState<Record<string, string>>({});
  const [variantResults, setVariantResults] = useState<Record<string, VariantOption[]>>({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/inventory/receiving/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setInvoice(data.invoice);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  const patchLine = async (lineId: string, patch: Record<string, unknown>) => {
    setSavingLineId(lineId);
    try {
      await fetch(`/api/v1/inventory/receiving/${id}/lines/${lineId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      await load();
    } finally {
      setSavingLineId(null);
    }
  };

  const searchVariants = async (lineId: string, q: string) => {
    setVariantSearch((prev) => ({ ...prev, [lineId]: q }));
    if (q.length < 2) {
      setVariantResults((prev) => ({ ...prev, [lineId]: [] }));
      return;
    }
    const res = await fetch(`/api/v1/inventory?search=${encodeURIComponent(q)}`);
    const data = await res.json();
    const variants: VariantOption[] = (data.inventory || data.items || []).slice(0, 10).map((v: { id: string; productTitle?: string; title?: string; variantTitle?: string | null }) => ({
      id: v.id,
      productTitle: v.productTitle || v.title || 'Unknown',
      variantTitle: v.variantTitle ?? null,
    }));
    setVariantResults((prev) => ({ ...prev, [lineId]: variants }));
  };

  const apply = async () => {
    if (!invoice) return;
    if (!confirm('Apply all matched lines to inventory? This increments stock for each matched item.')) return;
    setApplying(true);
    try {
      const res = await fetch(`/api/v1/inventory/receiving/${id}/apply`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Apply failed');
        return;
      }
      alert(`Applied ${data.appliedCount} line${data.appliedCount === 1 ? '' : 's'}. ${data.skipped} skipped.`);
      router.push('/ops/inventory');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading…</div>;
  if (error || !invoice) return <div className="p-8 text-red-600">{error || 'Not found'}</div>;

  const matchedCount = invoice.lines.filter((l) => l.matchedVariantId && l.status !== 'SKIPPED').length;
  const totalUnitsMatched = invoice.lines
    .filter((l) => l.matchedVariantId && l.status !== 'SKIPPED')
    .reduce((sum, l) => sum + l.totalUnits, 0);
  const canApply = invoice.status === 'PENDING_REVIEW' && matchedCount > 0;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <Link href="/ops/inventory" className="text-blue-600 text-sm font-medium hover:underline">← Inventory</Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Review Shipment</h1>
            <p className="text-gray-500 mt-1">
              {invoice.distributorName || 'Distributor'}
              {invoice.invoiceNumber && ` · #${invoice.invoiceNumber}`}
              {invoice.invoiceDate && ` · ${new Date(invoice.invoiceDate).toLocaleDateString()}`}
              {' · '}<span className={invoice.status === 'APPLIED' ? 'text-green-600 font-semibold' : 'text-amber-600 font-semibold'}>{invoice.status}</span>
            </p>
          </div>
          {invoice.status === 'PENDING_REVIEW' && (
            <button
              onClick={apply}
              disabled={!canApply || applying}
              className="px-6 py-3 bg-brand-blue text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {applying ? 'Applying…' : `Apply ${matchedCount} line${matchedCount === 1 ? '' : 's'} (+${totalUnitsMatched} units)`}
            </button>
          )}
        </div>

        {invoice.parseErrorMessage && (
          <div className="mb-4 p-3 border border-red-200 bg-red-50 rounded text-sm text-red-700">
            Parse error: {invoice.parseErrorMessage}
          </div>
        )}

        <div className="grid md:grid-cols-[300px,1fr] gap-6">
          <div>
            <div className="sticky top-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={invoice.imageUrl} alt="Invoice" className="w-full rounded-lg border border-gray-200" />
              <a href={invoice.imageUrl} target="_blank" rel="noopener noreferrer" className="block text-xs text-blue-600 mt-1 hover:underline">Open full size ↗</a>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
            {invoice.lines.length === 0 && (
              <p className="p-6 text-sm text-gray-500">No line items parsed from this invoice.</p>
            )}
            {invoice.lines.map((line) => (
              <div key={line.id} className="p-4">
                <div className="flex items-start gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 break-words">{line.distributorDescription}</p>
                    {line.distributorSku && <p className="text-xs text-gray-500 mt-0.5">SKU: {line.distributorSku}</p>}
                  </div>
                  <button
                    onClick={() => patchLine(line.id, { status: line.status === 'SKIPPED' ? 'PENDING' : 'SKIPPED' })}
                    className={`text-xs px-2 py-1 rounded border ${line.status === 'SKIPPED' ? 'bg-gray-100 text-gray-600 border-gray-300' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                  >
                    {line.status === 'SKIPPED' ? 'Skipped' : 'Skip'}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-2 text-sm">
                  <label className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Cases</span>
                    <input
                      type="number"
                      min={0}
                      defaultValue={line.cases}
                      onBlur={(e) => {
                        const v = Math.max(0, Math.floor(Number(e.target.value) || 0));
                        if (v !== line.cases) patchLine(line.id, { cases: v });
                      }}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </label>
                  <span className="text-gray-400">×</span>
                  <label className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Units/case</span>
                    <input
                      type="number"
                      min={1}
                      defaultValue={line.unitsPerCase}
                      onBlur={(e) => {
                        const v = Math.max(1, Math.floor(Number(e.target.value) || 1));
                        if (v !== line.unitsPerCase) patchLine(line.id, { unitsPerCase: v });
                      }}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </label>
                  <span className="text-gray-400">=</span>
                  <span className="font-bold text-gray-900">{line.totalUnits} units</span>
                </div>

                {line.matchedVariant ? (
                  <div className="flex items-center justify-between gap-2 p-2 bg-green-50 border border-green-200 rounded">
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">{line.matchedVariant.productTitle}</span>
                      {line.matchedVariant.variantTitle && line.matchedVariant.variantTitle !== 'Default Title' && (
                        <span className="text-gray-500"> — {line.matchedVariant.variantTitle}</span>
                      )}
                    </div>
                    <button
                      onClick={() => patchLine(line.id, { matchedVariantId: null, status: 'PENDING' })}
                      disabled={savingLineId === line.id}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove match
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {line.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {line.suggestions.slice(0, 3).map((s) => (
                          <button
                            key={s.variantId}
                            onClick={() => patchLine(line.id, { matchedVariantId: s.variantId, status: 'MATCHED' })}
                            disabled={savingLineId === line.id}
                            className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100"
                          >
                            {s.productTitle}{s.variantTitle && s.variantTitle !== 'Default Title' ? ` — ${s.variantTitle}` : ''}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search catalog..."
                        value={variantSearch[line.id] ?? ''}
                        onChange={(e) => searchVariants(line.id, e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                      />
                      {(variantResults[line.id] || []).length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto">
                          {(variantResults[line.id] || []).map((v) => (
                            <button
                              key={v.id}
                              onClick={() => {
                                patchLine(line.id, { matchedVariantId: v.id, status: 'MATCHED' });
                                setVariantSearch((prev) => ({ ...prev, [line.id]: '' }));
                                setVariantResults((prev) => ({ ...prev, [line.id]: [] }));
                              }}
                              className="block w-full text-left px-3 py-2 text-sm hover:bg-blue-50"
                            >
                              {v.productTitle}{v.variantTitle && v.variantTitle !== 'Default Title' ? ` — ${v.variantTitle}` : ''}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
