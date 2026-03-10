'use client';

import { useState, useEffect, type ReactElement } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AffiliateDashboardHeader from '@/app/affiliate/dashboard/components/AffiliateDashboardHeader';
import SalesAnalyticsTab from '@/app/affiliate/dashboard/components/SalesAnalyticsTab';
import OrdersTab from '@/app/affiliate/dashboard/components/OrdersTab';
import PartnershipInfoTab from '@/app/affiliate/dashboard/components/PartnershipInfoTab';

type TabId = 'analytics' | 'orders' | 'partnership';

interface DashboardData {
  affiliate: {
    id: string;
    code: string;
    partnerSlug: string | null;
    businessName: string;
    contactName: string;
    email: string;
  };
  yearToDate: {
    revenueCents: number;
    commissionCents: number;
    orderCount: number;
    currentTier: string;
    tierProgressPercent: number;
  };
  lifetime: {
    revenueCents: number;
    commissionCents: number;
    orderCount: number;
  };
  monthlyStats: {
    month: string;
    label: string;
    revenueCents: number;
    commissionCents: number;
    orderCount: number;
  }[];
  orders: {
    orderId: string;
    orderNumber: number;
    customerName: string;
    orderDate: string;
    deliveryDate: string;
    subtotalCents: number;
    commissionCents: number;
    commissionRate: number;
    tier: string;
    status: string;
  }[];
  payouts: {
    id: string;
    payoutPeriod: string;
    totalAmountCents: number;
    status: string;
    processedAt: string | null;
    _count: { commissions: number };
  }[];
  clientOrders: {
    id: string;
    type: 'dashboard';
    clientName: string;
    orderName: string;
    createdAt: string;
    deliveryDate: string | null;
    itemCount: number;
    totalCents: number;
    lifecycleStatus: 'draft' | 'in_progress' | 'paid' | 'completed';
    dashboardUrl: string;
    shareCode: string;
  }[];
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'analytics', label: 'Sales Analytics' },
  { id: 'orders', label: 'Orders' },
  { id: 'partnership', label: 'Partnership Info' },
];

export default function AdminAffiliateDashboardPage(): ReactElement {
  const params = useParams();
  const affiliateId = params?.id as string;
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('analytics');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/affiliates/${affiliateId}/dashboard`);
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        setData(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [affiliateId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-red-600">{error || 'No data'}</p>
        <Link href="/admin/affiliates" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
          Back to Affiliates
        </Link>
      </div>
    );
  }

  const { affiliate } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Banner */}
      <div className="bg-gray-900 text-white px-4 py-2 text-sm flex items-center justify-between">
        <span>
          Admin View: <strong>{affiliate.businessName}</strong> ({affiliate.contactName} &mdash; {affiliate.email})
        </span>
        <div className="flex items-center gap-3">
          <Link href={`/admin/affiliates/${affiliate.id}`} className="text-blue-300 hover:text-blue-200 text-xs font-medium">
            Edit Affiliate
          </Link>
          <Link href="/admin/affiliates" className="text-gray-400 hover:text-gray-200 text-xs font-medium">
            All Affiliates
          </Link>
        </div>
      </div>

      {/* Affiliate Dashboard Header (admin mode - no logout/create order) */}
      <AffiliateDashboardHeader
        contactName={affiliate.contactName}
        code={affiliate.code}
        partnerSlug={affiliate.partnerSlug}
        onLogout={() => {}}
        adminMode
      />

      {/* Tab Navigation */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <div className="flex gap-1 border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-[#D4AF37] text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === 'analytics' && (
          <SalesAnalyticsTab
            yearToDate={data.yearToDate}
            lifetime={data.lifetime}
            monthlyStats={data.monthlyStats}
            commissionOrders={data.orders}
            payouts={data.payouts}
          />
        )}
        {activeTab === 'orders' && (
          <OrdersTab clientOrders={data.clientOrders} />
        )}
        {activeTab === 'partnership' && (
          <PartnershipInfoTab
            affiliate={affiliate}
            hasPassword={false}
            adminMode
          />
        )}
      </div>
    </div>
  );
}
