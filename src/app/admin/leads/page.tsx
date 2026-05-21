'use client';

/**
 * /admin/leads
 *
 * Cross-partner lead inbox. Browse every Lead with a partner attribution
 * (and standard leads too — anything in the leads table). Filterable by
 * partner, status, source widget, date range, and full-text on contact info.
 *
 * Click a row → /admin/leads/[id] for the detail + timeline + manual actions.
 */

import { useState, useEffect, useCallback, type ReactElement } from 'react';
import Link from 'next/link';

interface AdminLead {
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
  affiliate: {
    id: string;
    code: string;
    partnerSlug: string | null;
    businessName: string;
  } | null;
}

interface AffiliateOption {
  id: string;
  businessName: string;
  partnerSlug: string | null;
}

const STATUS_OPTIONS = ['', 'SUBMITTED', 'PARTIAL', 'CONVERTED', 'ANONYMOUS', 'ARCHIVED'];
const SOURCE_OPTIONS = [
  '',
  'PARTNER_FAREHARBOR_WEBHOOK',
  'PARTNER_EMAIL_OPTIN',
  'PARTNER_LANDING_PAGE',
  'DRINK_CALCULATOR',
  'CONTACT_FORM',
  'EMAIL_SIGNUP',
  'QUICK_BUY',
  'PACKAGE_BUILDER',
  'OTHER',
];

export default function AdminLeadsPage(): ReactElement {
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [affiliates, setAffiliates] = useState<AffiliateOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filters
  const [affiliateId, setAffiliateId] = useState('');
  const [status, setStatus] = useState('');
  const [sourceWidget, setSourceWidget] = useState('');
  const [search, setSearch] = useState('');

  // Affiliate dropdown — load once on mount
  useEffect(() => {
    fetch('/api/admin/affiliates')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setAffiliates(
            data.data.map((a: { id: string; businessName: string; partnerSlug: string | null }) => ({
              id: a.id,
              businessName: a.businessName,
              partnerSlug: a.partnerSlug,
            }))
          );
        }
      })
      .catch(() => {
        /* non-fatal */
      });
  }, []);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (affiliateId) params.set('affiliateId', affiliateId);
    if (status) params.set('status', status);
    if (sourceWidget) params.set('sourceWidget', sourceWidget);
    if (search) params.set('search', search);
    params.set('limit', '100');

    try {
      const res = await fetch(`/api/admin/leads?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLeads(data.data);
        setTotal(data.total);
      }
    } finally {
      setLoading(false);
    }
  }, [affiliateId, status, sourceWidget, search]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const downloadCsv = () => {
    const params = new URLSearchParams();
    if (affiliateId) params.set('affiliateId', affiliateId);
    if (status) params.set('status', status);
    if (sourceWidget) params.set('sourceWidget', sourceWidget);
    if (search) params.set('search', search);
    params.set('format', 'csv');
    params.set('limit', '200');
    window.location.href = `/api/admin/leads?${params.toString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Partner Leads</h1>
          <p className="text-sm text-gray-600 mt-1">
            Opt-in leads from partner platforms (FareHarbor checkboxes, confirmation-email
            CTAs, landing-page submissions) and our own widgets.
          </p>
        </div>
        <button
          onClick={downloadCsv}
          className="px-4 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-800"
        >
          Export CSV
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Partner</label>
            <select
              value={affiliateId}
              onChange={(e) => setAffiliateId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All partners</option>
              {affiliates.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.businessName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s || 'All (excludes archived)'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Source</label>
            <select
              value={sourceWidget}
              onChange={(e) => setSourceWidget(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {SOURCE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s || 'All sources'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="email, phone, name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-600">
          Showing <span className="font-semibold">{leads.length}</span> of {total} matching leads
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">Created</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">Partner</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">Name</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">Contact</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">Source</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">Booking</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">Status</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && leads.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No leads match these filters.
                </td>
              </tr>
            )}
            {!loading &&
              leads.map((lead) => {
                const tripDate = (lead.partnerBookingMeta as { trip_date_display?: string } | null)
                  ?.trip_date_display;
                return (
                  <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString()}{' '}
                      <span className="text-xs text-gray-500">
                        {new Date(lead.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-900">
                      {lead.affiliate ? (
                        <Link
                          href={`/admin/affiliates/${lead.affiliate.id}`}
                          className="text-brand-blue hover:underline"
                        >
                          {lead.affiliate.businessName}
                        </Link>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-900">
                      {[lead.firstName, lead.lastName].filter(Boolean).join(' ') || '—'}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {lead.email && <div className="text-xs">{lead.email}</div>}
                      {lead.phone && <div className="text-xs text-gray-500">{lead.phone}</div>}
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
                      <StatusBadge status={lead.status} converted={!!lead.orderId} />
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
    </div>
  );
}

function StatusBadge({ status, converted }: { status: string; converted: boolean }): ReactElement {
  const cls = converted
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
      {converted ? 'CONVERTED' : status}
    </span>
  );
}
