'use client';

/**
 * /admin/leads/[id] — Lead detail + timeline + manual actions.
 */

import { useState, useEffect, useCallback, type ReactElement } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface LeadEvent {
  id: string;
  type: string;
  page: string | null;
  widget: string | null;
  fieldName: string | null;
  fieldValue: string | null;
  metadata: Record<string, unknown> | null;
  occurredAt: string;
}

interface LeadDetail {
  id: string;
  createdAt: string;
  updatedAt: string;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  status: string;
  sourcePage: string | null;
  sourceWidget: string | null;
  lastPage: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  partnerBookingRef: string | null;
  partnerBookingMeta: Record<string, unknown> | null;
  orderId: string | null;
  notes: string | null;
  events: LeadEvent[];
  affiliate: {
    id: string;
    code: string;
    partnerSlug: string | null;
    businessName: string;
    customerPerk: string;
  } | null;
}

export default function AdminLeadDetailPage(): ReactElement {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const fetchLead = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/leads/${id}`);
      const data = await res.json();
      if (data.success) {
        setLead(data.data);
        setNotes(data.data.notes ?? '');
      } else {
        setError(data.error || 'Failed to load lead');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  async function patch(body: Record<string, unknown>, successMsg: string) {
    if (!id) return;
    setSaving(true);
    setSavedMsg(null);
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setSavedMsg(successMsg);
        await fetchLead();
      } else {
        setSavedMsg(`Error: ${data.error || 'unknown'}`);
      }
    } catch (e) {
      setSavedMsg(e instanceof Error ? e.message : 'Network error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-8 text-gray-500">Loading…</div>;
  if (error || !lead) return <div className="p-8 text-red-700">{error ?? 'Lead not found'}</div>;

  const meta = (lead.partnerBookingMeta ?? {}) as Record<string, unknown>;
  const name = [lead.firstName, lead.lastName].filter(Boolean).join(' ') || 'Unnamed lead';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-4">
        <Link href="/admin/leads" className="text-sm text-brand-blue hover:underline">
          ← Back to all leads
        </Link>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
          <div className="mt-1 text-sm text-gray-600">
            Captured {new Date(lead.createdAt).toLocaleString()} ·{' '}
            <span className="font-mono">{lead.id}</span>
          </div>
        </div>
        <div className="text-sm">
          <StatusBadge status={lead.orderId ? 'CONVERTED' : lead.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left column — primary cards */}
        <div className="md:col-span-2 space-y-4">
          {/* Contact card */}
          <Card title="Contact">
            <KV label="Email" value={lead.email} mono />
            <KV label="Phone" value={lead.phone} mono />
            <KV label="Source page" value={lead.sourcePage} mono />
            <KV label="Source widget" value={lead.sourceWidget} />
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
              <KV label="utm_source" value={lead.utmSource} dense />
              <KV label="utm_medium" value={lead.utmMedium} dense />
              <KV label="utm_campaign" value={lead.utmCampaign} dense />
              <KV label="utm_content" value={lead.utmContent} dense />
            </div>
          </Card>

          {/* Partner booking card */}
          {lead.affiliate && (
            <Card title="Partner">
              <KV
                label="Partner"
                value={
                  <Link
                    href={`/admin/affiliates/${lead.affiliate.id}`}
                    className="text-brand-blue hover:underline"
                  >
                    {lead.affiliate.businessName}
                  </Link>
                }
              />
              <KV label="Code" value={lead.affiliate.code} mono />
              <KV label="Perk" value={lead.affiliate.customerPerk} />
              {lead.partnerBookingRef && (
                <>
                  <div className="border-t border-gray-200 my-2" />
                  <KV label="Booking ref" value={lead.partnerBookingRef} mono />
                  {typeof meta.trip_date_display === 'string' && (
                    <KV label="Trip date" value={meta.trip_date_display as string} />
                  )}
                  {typeof meta.item_name === 'string' && (
                    <KV label="Item" value={meta.item_name as string} />
                  )}
                  {typeof meta.group_size === 'number' && (
                    <KV label="Group size" value={String(meta.group_size)} />
                  )}
                  {typeof meta.source_platform === 'string' && (
                    <KV label="Platform" value={meta.source_platform as string} />
                  )}
                </>
              )}
            </Card>
          )}

          {/* Notes card */}
          <Card title="Internal notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Notes for the team…"
            />
            <div className="mt-2 flex items-center justify-end gap-3">
              {savedMsg && <span className="text-xs text-gray-600">{savedMsg}</span>}
              <button
                onClick={() => patch({ notes }, 'Notes saved.')}
                disabled={saving}
                className="px-3 py-1.5 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-800 disabled:opacity-50"
              >
                Save notes
              </button>
            </div>
          </Card>

          {/* Timeline card */}
          <Card title="Timeline">
            {lead.events.length === 0 ? (
              <p className="text-sm text-gray-500">No events recorded yet.</p>
            ) : (
              <ol className="space-y-2 text-sm">
                {lead.events.map((ev) => (
                  <li key={ev.id} className="flex items-start gap-3">
                    <div className="text-xs text-gray-500 whitespace-nowrap w-32 mt-0.5">
                      {new Date(ev.occurredAt).toLocaleString()}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {ev.type}
                        {ev.widget && <span className="text-gray-500"> · {ev.widget}</span>}
                      </div>
                      {(ev.fieldName || ev.fieldValue || ev.metadata) && (
                        <pre className="mt-1 text-xs text-gray-600 bg-gray-50 rounded px-2 py-1 overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(
                            { field: ev.fieldName, value: ev.fieldValue, metadata: ev.metadata },
                            null,
                            2
                          )}
                        </pre>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        {/* Right column — actions */}
        <div className="space-y-4">
          <Card title="Actions">
            <div className="space-y-2">
              <button
                onClick={() => patch({ status: 'CONVERTED' }, 'Marked as converted.')}
                disabled={saving}
                className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Mark converted
              </button>
              <button
                onClick={() => patch({ status: 'SUBMITTED' }, 'Marked as submitted.')}
                disabled={saving}
                className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Mark submitted
              </button>
              <button
                onClick={() => patch({ status: 'ARCHIVED' }, 'Archived.')}
                disabled={saving}
                className="w-full px-3 py-2 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300 disabled:opacity-50"
              >
                Archive
              </button>
              <button
                onClick={() => patch({ rePushToGhl: true }, 'GHL re-push fired.')}
                disabled={saving}
                className="w-full px-3 py-2 bg-yellow-500 text-gray-900 text-sm rounded-md hover:bg-yellow-600 disabled:opacity-50"
              >
                Re-push to GHL
              </button>
            </div>
          </Card>

          {lead.orderId && (
            <Card title="Linked order">
              <Link
                href={`/ops/orders/${lead.orderId}`}
                className="text-sm text-brand-blue hover:underline break-all"
              >
                {lead.orderId}
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }): ReactElement {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">{title}</h3>
      {children}
    </div>
  );
}

function KV({
  label,
  value,
  mono,
  dense,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  dense?: boolean;
}): ReactElement {
  return (
    <div className={dense ? 'flex justify-between gap-2 py-0.5' : 'flex justify-between gap-2 py-1'}>
      <span className="text-gray-500">{label}</span>
      <span className={`text-gray-900 text-right break-all ${mono ? 'font-mono text-xs' : ''}`}>
        {value || <span className="text-gray-400">—</span>}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }): ReactElement {
  const cls =
    status === 'CONVERTED'
      ? 'bg-green-100 text-green-800'
      : status === 'SUBMITTED'
        ? 'bg-blue-100 text-blue-800'
        : status === 'PARTIAL'
          ? 'bg-yellow-100 text-yellow-800'
          : status === 'ARCHIVED'
            ? 'bg-gray-200 text-gray-700'
            : 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {status}
    </span>
  );
}
