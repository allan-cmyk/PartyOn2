'use client';

/**
 * Partner Leads section, embedded on the affiliate detail page.
 *
 * Shows summary metrics (total leads, opt-in count, conversion rate) plus
 * the most recent leads. Click any row to jump to /admin/leads/[id] for full
 * detail and manual actions. "View all" deep-links to /admin/leads filtered
 * by this affiliate.
 */

import { useEffect, useState, type ReactElement } from 'react';
import Link from 'next/link';

interface AffiliateLeadRow {
  id: string;
  createdAt: string;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  status: string;
  sourceWidget: string | null;
  partnerBookingRef: string | null;
  partnerBookingMeta: Record<string, unknown> | null;
  orderId: string | null;
}

interface Props {
  affiliateId: string;
}

export default function AffiliateLeadsSection({ affiliateId }: Props): ReactElement {
  const [leads, setLeads] = useState<AffiliateLeadRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/leads?affiliateId=${affiliateId}&limit=10`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setLeads(data.data);
          setTotal(data.total);
        }
      })
      .finally(() => setLoading(false));
  }, [affiliateId]);

  const converted = leads.filter((l) => !!l.orderId || l.status === 'CONVERTED').length;
  const conversionRate = leads.length > 0 ? Math.round((converted / leads.length) * 100) : 0;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-800">Partner Leads</h2>
        <Link
          href={`/admin/leads?affiliateId=${affiliateId}`}
          className="text-sm text-brand-blue hover:underline"
        >
          View all →
        </Link>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <Tile label="Total leads (recent window)" value={total.toLocaleString()} />
        <Tile label="Converted to orders" value={String(converted)} />
        <Tile label="Conversion rate" value={`${conversionRate}%`} />
      </div>

      {loading ? (
        <div className="text-gray-500 text-sm">Loading…</div>
      ) : leads.length === 0 ? (
        <div className="text-gray-500 text-sm">
          No partner leads yet. They&apos;ll appear here once the FareHarbor webhook fires
          or someone submits the partner welcome form.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Date</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Name</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Contact</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Source</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Booking</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.map((lead) => {
                const tripDate = (lead.partnerBookingMeta as { trip_date_display?: string } | null)
                  ?.trip_date_display;
                return (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-gray-900">
                      {[lead.firstName, lead.lastName].filter(Boolean).join(' ') || '—'}
                    </td>
                    <td className="px-4 py-2 text-gray-700 text-xs">
                      {lead.email && <div>{lead.email}</div>}
                      {lead.phone && <div className="text-gray-500">{lead.phone}</div>}
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-700">
                      <span className="inline-block bg-gray-100 rounded px-2 py-0.5">
                        {lead.sourceWidget || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-700">
                      {lead.partnerBookingRef ? (
                        <>
                          <div className="font-mono">{lead.partnerBookingRef}</div>
                          {tripDate && <div className="text-gray-500">{tripDate}</div>}
                        </>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <StatusBadge status={lead.orderId ? 'CONVERTED' : lead.status} />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="text-sm text-brand-blue hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <div className="bg-gray-50 rounded p-3 text-center">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
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
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}
