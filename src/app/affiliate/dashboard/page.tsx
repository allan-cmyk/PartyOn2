'use client';

import { useState, useEffect, ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import AffiliateDashboardHeader from './components/AffiliateDashboardHeader';
import SalesAnalyticsTab from './components/SalesAnalyticsTab';
import OrdersTab from './components/OrdersTab';
import PartnershipInfoTab from './components/PartnershipInfoTab';

interface AffiliateData {
  affiliate: {
    id: string;
    code: string;
    partnerSlug?: string | null;
    businessName: string;
    contactName: string;
    email: string;
    hasPassword?: boolean;
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
  monthlyStats: Array<{
    month: string;
    label: string;
    revenueCents: number;
    commissionCents: number;
    orderCount: number;
  }>;
}

interface OrderItem {
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
}

interface PayoutItem {
  id: string;
  payoutPeriod: string;
  totalAmountCents: number;
  status: string;
  processedAt: string | null;
  _count: { commissions: number };
}

interface ClientOrder {
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
}

type Tab = 'analytics' | 'orders' | 'partnership';

const TABS: { key: Tab; label: string }[] = [
  { key: 'analytics', label: 'Sales Analytics' },
  { key: 'orders', label: 'Orders' },
  { key: 'partnership', label: 'Partnership Info' },
];

export default function AffiliateDashboardPage(): ReactElement {
  const router = useRouter();
  const [data, setData] = useState<AffiliateData | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [clientOrders, setClientOrders] = useState<ClientOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('analytics');

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/affiliate/me').then((r) => r.json()),
      fetch('/api/v1/affiliate/me/orders').then((r) => r.json()),
      fetch('/api/v1/affiliate/me/payouts').then((r) => r.json()),
      fetch('/api/v1/affiliate/me/client-orders').then((r) => r.json()),
    ])
      .then(([meRes, ordersRes, payoutsRes, clientOrdersRes]) => {
        if (!meRes.success) {
          router.push('/affiliate/login');
          return;
        }
        setData(meRes.data);
        if (ordersRes.success) setOrders(ordersRes.data.orders);
        if (payoutsRes.success) setPayouts(payoutsRes.data);
        if (clientOrdersRes.success) setClientOrders(clientOrdersRes.data.orders);
      })
      .catch(() => router.push('/affiliate/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/v1/affiliate/logout', { method: 'POST' });
    router.push('/affiliate/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!data) return <div />;

  return (
    <div className="min-h-screen bg-gray-50">
      <AffiliateDashboardHeader
        contactName={data.affiliate.contactName}
        code={data.affiliate.code}
        partnerSlug={data.affiliate.partnerSlug}
        onLogout={handleLogout}
      />

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-brand-blue text-brand-blue'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === 'analytics' && (
          <SalesAnalyticsTab
            yearToDate={data.yearToDate}
            lifetime={data.lifetime}
            monthlyStats={data.monthlyStats}
            commissionOrders={orders}
            payouts={payouts}
          />
        )}
        {activeTab === 'orders' && <OrdersTab clientOrders={clientOrders} />}
        {activeTab === 'partnership' && (
          <PartnershipInfoTab
            affiliate={data.affiliate}
            hasPassword={!!data.affiliate.hasPassword}
          />
        )}
      </div>
    </div>
  );
}
