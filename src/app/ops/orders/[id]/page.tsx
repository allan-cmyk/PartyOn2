'use client';

import { useState, useEffect, ReactElement, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface OrderItem {
  id: string;
  product: { id: string; title: string; handle: string };
  variant: { id: string; title: string; sku: string } | null;
  title: string;
  variantTitle: string | null;
  sku: string | null;
  quantity: number;
  price: number;
  total: number;
  imageUrl?: string | null;
}

interface Amendment {
  id: string;
  type: string;
  changes: {
    added: { title: string; quantity: number; price: number }[];
    removed: { title: string; quantity: number; price: number }[];
    modified: { title: string; oldQuantity: number; newQuantity: number; price: number }[];
    deliveryFeeChange: { from: number; to: number } | null;
  };
  previousTotal: number;
  newTotal: number;
  amountDelta: number;
  resolution: string;
  draftOrderId: string | null;
  refundId: string | null;
  notes: string | null;
  processedBy: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  financialStatus: string;
  fulfillmentStatus: string;
  customer: {
    id: string;
    email: string;
    name: string;
    phone: string | null;
  };
  customerSnapshot: {
    name: string | null;
    email: string | null;
    phone: string | null;
  };
  items: OrderItem[];
  pricing: {
    subtotal: number;
    discountCode: string | null;
    discountAmount: number;
    taxAmount: number;
    deliveryFee: number;
    total: number;
  };
  delivery: {
    date: string;
    time: string;
    type: string;
    address: {
      address1: string;
      address2: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
    phone: string | null;
    instructions: string | null;
  };
  payment: {
    stripePaymentIntentId: string | null;
    stripeCheckoutSessionId: string | null;
    stripeChargeId: string | null;
  };
  shopify: {
    orderId: string | null;
    orderNumber: string | null;
  };
  groupOrder: {
    id: string | null;
    isGroupOrder: boolean;
    name: string | null;
    shareCode: string | null;
    status: string | null;
    siblingOrders: {
      id: string;
      orderNumber: string;
      customerName: string;
      total: number;
      status: string;
    }[];
  };
  affiliate: {
    id: string;
    code: string;
    businessName: string;
    contactName: string;
  } | null;
  amendments: Amendment[];
  notes: {
    customer: string | null;
    internal: string | null;
  };
  createdAt: string;
  updatedAt: string;
  navigation: {
    previousOrderId: string | null;
    nextOrderId: string | null;
  };
}

interface EditItem {
  productId: string;
  variantId: string;
  title: string;
  variantTitle?: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  isNew?: boolean;
}

interface SearchProduct {
  id: string;
  title: string;
  status: string;
  variants: {
    id: string;
    title: string | null;
    price: string | number;
    sku: string | null;
    option1Value: string | null;
    option2Value: string | null;
  }[];
  images: { url: string }[];
}

interface PreviewData {
  previousTotal: number;
  newTotal: number;
  amountDelta: number;
  previousSubtotal: number;
  newSubtotal: number;
  previousTax: number;
  newTax: number;
  previousDeliveryFee: number;
  newDeliveryFee: number;
  changes: {
    added: { title: string; quantity: number; price: number }[];
    removed: { title: string; quantity: number; price: number }[];
    modified: { title: string; oldQuantity: number; newQuantity: number; price: number }[];
    deliveryFeeChange: { from: number; to: number } | null;
  };
  warnings: string[];
}

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED'];
const FULFILLMENT_OPTIONS = ['UNFULFILLED', 'PARTIAL', 'FULFILLED'];

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
    PROCESSING: 'bg-purple-100 text-purple-700 border-purple-200',
    COMPLETED: 'bg-green-100 text-green-700 border-green-200',
    CANCELLED: 'bg-red-100 text-red-700 border-red-200',
    PAID: 'bg-green-100 text-green-700 border-green-200',
    PARTIALLY_PAID: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    PARTIALLY_REFUNDED: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    REFUNDED: 'bg-gray-100 text-gray-700 border-gray-200',
    FULFILLED: 'bg-green-100 text-green-700 border-green-200',
    UNFULFILLED: 'bg-orange-100 text-orange-700 border-orange-200',
    PARTIAL: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    INVOICE_SENT: 'bg-blue-100 text-blue-700 border-blue-200',
    WAIVED: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function SectionHeader({ icon, title, action }: { icon: ReactElement; title: string; action?: ReactElement }): ReactElement {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
      <div className="flex items-center gap-3">
        <span className="text-gray-400">{icon}</span>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export default function OrderDetailPage(): ReactElement {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [internalNote, setInternalNote] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  // Amendment edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editItems, setEditItems] = useState<EditItem[]>([]);
  const [editDeliveryFee, setEditDeliveryFee] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [amendProcessing, setAmendProcessing] = useState(false);
  const [amendNotes, setAmendNotes] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refund dialog state
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundReason, setRefundReason] = useState('');
  const [refundProcessing, setRefundProcessing] = useState(false);
  const [pendingAmendmentId, setPendingAmendmentId] = useState<string | null>(null);

  // Cancel dialog state
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelNote, setCancelNote] = useState('');
  const [cancelProcessing, setCancelProcessing] = useState(false);
  const [cancelEmailPreview, setCancelEmailPreview] = useState('');
  const [issueRefund, setIssueRefund] = useState(false);

  // Affiliate attribution state
  const [affiliateCode, setAffiliateCode] = useState('');
  const [affiliateLinking, setAffiliateLinking] = useState(false);
  const [affiliateError, setAffiliateError] = useState('');

  const fetchOrder = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/admin/orders/${orderId}`);
      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to load order');
        return;
      }

      setOrder(data.data);
      setInternalNote(data.data.notes.internal || '');
    } catch {
      setError('Failed to fetch order');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Close search dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function enterEditMode() {
    if (!order) return;
    setEditItems(
      order.items.map((item) => ({
        productId: item.product.id,
        variantId: item.variant?.id || '',
        title: item.title,
        variantTitle: item.variantTitle || undefined,
        quantity: item.quantity,
        price: item.price,
      }))
    );
    setEditDeliveryFee(order.pricing.deliveryFee);
    setAmendNotes('');
    setPreview(null);
    setIsEditing(true);
  }

  function cancelEditMode() {
    setIsEditing(false);
    setEditItems([]);
    setPreview(null);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  }

  // Product search
  const searchProducts = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/v1/products/search?q=${encodeURIComponent(query)}&limit=10`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.data);
        setShowSearchResults(true);
      }
    } finally {
      setSearchLoading(false);
    }
  }, []);

  function handleSearchInput(value: string) {
    setSearchQuery(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => searchProducts(value), 300);
  }

  function addProduct(product: SearchProduct, variant: SearchProduct['variants'][0]) {
    const key = `${product.id}-${variant.id}`;
    const existing = editItems.find(
      (item) => `${item.productId}-${item.variantId}` === key
    );
    if (existing) {
      setEditItems(
        editItems.map((item) =>
          `${item.productId}-${item.variantId}` === key
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      const variantTitle = [variant.option1Value, variant.option2Value].filter(Boolean).join(' / ');
      setEditItems([
        ...editItems,
        {
          productId: product.id,
          variantId: variant.id,
          title: product.title,
          variantTitle: variantTitle || (variant.title !== 'Default Title' ? variant.title || undefined : undefined),
          quantity: 1,
          price: parseFloat(variant.price as string),
          imageUrl: product.images[0]?.url || '',
          isNew: true,
        },
      ]);
    }
    setSearchQuery('');
    setShowSearchResults(false);
    setPreview(null);
  }

  function updateItemQuantity(productId: string, variantId: string, delta: number) {
    setEditItems(
      editItems
        .map((item) =>
          item.productId === productId && item.variantId === variantId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
    setPreview(null);
  }

  function removeItem(productId: string, variantId: string) {
    setEditItems(editItems.filter((item) => !(item.productId === productId && item.variantId === variantId)));
    setPreview(null);
  }

  async function fetchPreview() {
    if (!order) return;
    setAmendProcessing(true);
    try {
      const res = await fetch(`/api/v1/admin/orders/${orderId}/amend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'preview',
          items: editItems,
          deliveryFee: editDeliveryFee,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPreview(data.data);
      } else {
        alert(data.error || 'Failed to preview amendment');
      }
    } catch {
      alert('Failed to preview amendment');
    } finally {
      setAmendProcessing(false);
    }
  }

  async function confirmAmendment() {
    if (!order || !preview) return;
    setAmendProcessing(true);
    try {
      const res = await fetch(`/api/v1/admin/orders/${orderId}/amend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm',
          items: editItems,
          deliveryFee: editDeliveryFee,
          notes: amendNotes || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const amendment = data.data.amendment;
        if (amendment.amountDelta > 0 && amendment.draftOrderId) {
          // Positive delta -- offer to send amendment invoice
          if (confirm(`Amendment invoice created ($${amendment.amountDelta.toFixed(2)}). Send invoice email to customer now?`)) {
            await sendAmendmentInvoice(amendment.id);
          }
        } else if (amendment.amountDelta < 0) {
          // Negative delta -- show refund dialog
          setPendingAmendmentId(amendment.id);
          setRefundAmount(Math.abs(amendment.amountDelta));
          setRefundReason('Order amendment');
          setShowRefundDialog(true);
        }
        setIsEditing(false);
        setPreview(null);
        await fetchOrder();
      } else {
        alert(data.error || 'Failed to confirm amendment');
      }
    } catch {
      alert('Failed to confirm amendment');
    } finally {
      setAmendProcessing(false);
    }
  }

  async function sendAmendmentInvoice(amendmentId: string) {
    try {
      const res = await fetch(`/api/v1/admin/orders/${orderId}/send-amendment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amendmentId }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Invoice sent to ${data.data.sentTo}`);
        await fetchOrder();
      } else {
        alert(data.error || 'Failed to send invoice');
      }
    } catch {
      alert('Failed to send invoice');
    }
  }

  async function processRefund() {
    if (!order) return;
    setRefundProcessing(true);
    try {
      const res = await fetch(`/api/v1/admin/orders/${orderId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: refundAmount,
          reason: refundReason || 'Order amendment',
          amendmentId: pendingAmendmentId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Refund of $${refundAmount.toFixed(2)} processed successfully`);
        setShowRefundDialog(false);
        setPendingAmendmentId(null);
        await fetchOrder();
      } else {
        alert(data.error || 'Failed to process refund');
      }
    } catch {
      alert('Failed to process refund');
    } finally {
      setRefundProcessing(false);
    }
  }

  async function openCancelDialog() {
    setCancelNote('');
    setIssueRefund(false);
    setCancelProcessing(false);
    setCancelEmailPreview('');
    setShowCancelDialog(true);

    // Fetch preview HTML
    try {
      const res = await fetch(`/api/v1/admin/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preview: true }),
      });
      const data = await res.json();
      if (data.success) {
        setCancelEmailPreview(data.html);
      }
    } catch {
      console.error('Failed to load cancel email preview');
    }
  }

  function getCancelPreviewHtml(): string {
    if (!cancelEmailPreview) return '';
    if (!cancelNote) return cancelEmailPreview;

    const escaped = cancelNote
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');

    const noteHtml = `
      <div style="background-color: #f9fafb; border-left: 4px solid #D4AF37; border-radius: 4px; padding: 16px; margin-bottom: 16px;">
        <p style="margin: 0 0 4px; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Note from Party On Delivery</p>
        <p style="margin: 0; font-size: 14px; color: #1a1a1a; line-height: 1.5;">${escaped}</p>
      </div>`;

    return cancelEmailPreview.replace('<!--CUSTOM_NOTE-->', noteHtml);
  }

  async function processCancellation() {
    if (!order) return;
    setCancelProcessing(true);
    try {
      const res = await fetch(`/api/v1/admin/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customNote: cancelNote || undefined,
          issueRefund,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCancelDialog(false);
        await fetchOrder();
        alert(
          issueRefund && data.data?.refund
            ? `Order cancelled and refund of $${data.data.refund.amount.toFixed(2)} processed`
            : 'Order cancelled successfully'
        );
      } else {
        alert(data.error || 'Failed to cancel order');
      }
    } catch {
      alert('Failed to cancel order');
    } finally {
      setCancelProcessing(false);
    }
  }

  async function updateOrder(updates: Record<string, unknown>): Promise<void> {
    if (!order) return;
    setSaving(true);

    try {
      const response = await fetch(`/api/v1/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success) {
        await fetchOrder();
      } else {
        alert('Failed to update order: ' + data.error);
      }
    } catch {
      alert('Failed to update order');
    } finally {
      setSaving(false);
    }
  }

  async function handleLinkAffiliate() {
    if (!order || !affiliateCode.trim()) return;
    setAffiliateLinking(true);
    setAffiliateError('');
    try {
      const res = await fetch(`/api/v1/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkAffiliateCode: affiliateCode.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (data.success) {
        setAffiliateCode('');
        await fetchOrder();
      } else {
        setAffiliateError(data.error || 'Failed to link affiliate');
      }
    } catch {
      setAffiliateError('Network error');
    } finally {
      setAffiliateLinking(false);
    }
  }

  async function handleUnlinkAffiliate() {
    if (!order?.affiliate) return;
    if (!confirm(`Remove ${order.affiliate.businessName} from this order? This will void their commission.`)) return;
    setAffiliateLinking(true);
    try {
      const res = await fetch(`/api/v1/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unlinkAffiliate: true }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchOrder();
      } else {
        alert(data.error || 'Failed to remove affiliate');
      }
    } catch {
      alert('Network error');
    } finally {
      setAffiliateLinking(false);
    }
  }

  function handlePrint(): void {
    window.print();
  }

  const canAmend = order && !['CANCELLED', 'REFUNDED'].includes(order.status);

  if (loading) {
    return (
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-8 w-32 bg-gray-200 rounded-lg" />
              <div className="h-10 w-48 bg-gray-200 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="h-24 bg-gray-200 rounded-xl" />
              <div className="h-24 bg-gray-200 rounded-xl" />
              <div className="h-24 bg-gray-200 rounded-xl" />
            </div>
            <div className="h-96 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
            <svg className="w-16 h-16 mx-auto text-red-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Order</h2>
            <p className="text-red-600 mb-6">{error || 'Order not found'}</p>
            <Link
              href="/ops/orders"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Screen View */}
      <div className={`p-4 md:p-8 bg-gray-50 min-h-screen print:hidden ${isEditing ? 'pb-48' : ''}`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Link
                href="/ops/orders"
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900">
                    Order #{order.orderNumber}
                  </h1>
                  {order.groupOrder.isGroupOrder && (
                    <span className="px-3 py-1 text-sm font-medium bg-purple-100 text-purple-700 border border-purple-200 rounded-full">
                      Group Order
                    </span>
                  )}
                </div>
                <p className="text-gray-500 mt-1">
                  Created {formatDateTime(order.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Prev/Next Navigation */}
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <button
                  onClick={() => order.navigation.previousOrderId && router.push(`/ops/orders/${order.navigation.previousOrderId}`)}
                  disabled={!order.navigation.previousOrderId}
                  className="p-2 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed border-r border-gray-200"
                  title="Previous order (by delivery date)"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => order.navigation.nextOrderId && router.push(`/ops/orders/${order.navigation.nextOrderId}`)}
                  disabled={!order.navigation.nextOrderId}
                  className="p-2 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Next order (by delivery date)"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>

              {canAmend && !isEditing && (
                <>
                  <button
                    onClick={enterEditMode}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Amend Order
                  </button>
                  <button
                    onClick={openCancelDialog}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel Order
                  </button>
                </>
              )}

              {isEditing && (
                <button
                  onClick={cancelEditMode}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Edit mode banner */}
          {isEditing && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-blue-800 font-medium">
                Edit Mode -- Add/remove items and adjust delivery fee. Click &quot;Preview Changes&quot; when ready.
              </p>
            </div>
          )}

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Order Status
              </label>
              <select
                value={order.status}
                onChange={(e) => updateOrder({ status: e.target.value })}
                disabled={saving}
                className={`w-full px-4 py-2.5 rounded-lg border-2 ${getStatusColor(order.status)} font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Payment Status
              </label>
              <div className={`px-4 py-2.5 rounded-lg border-2 ${getStatusColor(order.financialStatus)} font-semibold text-center`}>
                {order.financialStatus}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Fulfillment
              </label>
              <select
                value={order.fulfillmentStatus}
                onChange={(e) => updateOrder({ fulfillmentStatus: e.target.value })}
                disabled={saving}
                className={`w-full px-4 py-2.5 rounded-lg border-2 ${getStatusColor(order.fulfillmentStatus)} font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
              >
                {FULFILLMENT_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Details */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <SectionHeader
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                  title="Delivery Details"
                />
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">Delivery Date</p>
                      <p className="font-bold text-gray-900 text-lg">{formatDate(order.delivery.date)}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">Time Window</p>
                      <p className="font-bold text-gray-900 text-lg">{order.delivery.time}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Delivery Address</p>
                      <p className="font-medium text-gray-900">
                        {order.delivery.address.address1}
                        {order.delivery.address.address2 && `, ${order.delivery.address.address2}`}
                      </p>
                      <p className="text-gray-600">
                        {order.delivery.address.city}, {order.delivery.address.state} {order.delivery.address.zip}
                      </p>
                    </div>
                    {order.delivery.phone && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Delivery Phone</p>
                        <a href={`tel:${order.delivery.phone}`} className="text-blue-600 hover:underline font-medium">
                          {order.delivery.phone}
                        </a>
                      </div>
                    )}
                    {order.delivery.instructions && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Delivery Instructions</p>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-gray-800">
                          <svg className="w-5 h-5 text-yellow-500 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {order.delivery.instructions}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <SectionHeader
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  }
                  title="Order Items"
                />

                {/* Product search (edit mode only) */}
                {isEditing && (
                  <div className="px-6 py-4 border-b border-gray-100 bg-blue-50" ref={searchRef}>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearchInput(e.target.value)}
                        placeholder="Search products to add..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {searchLoading && (
                        <div className="absolute right-3 top-3.5">
                          <svg className="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        </div>
                      )}
                      {showSearchResults && searchResults.length > 0 && (
                        <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                          {searchResults.map((product) => (
                            <div key={product.id}>
                              {product.variants.map((variant) => (
                                <button
                                  key={variant.id}
                                  onClick={() => addProduct(product, variant)}
                                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex justify-between items-center"
                                >
                                  <div>
                                    <p className="font-medium text-gray-900">{product.title}</p>
                                    {variant.title && variant.title !== 'Default Title' && (
                                      <p className="text-sm text-gray-500">{variant.title}</p>
                                    )}
                                  </div>
                                  <span className="text-gray-700 font-medium">
                                    ${parseFloat(variant.price as string).toFixed(2)}
                                  </span>
                                </button>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="divide-y divide-gray-100">
                  {isEditing ? (
                    // Edit mode items
                    editItems.map((item) => (
                      <div
                        key={`${item.productId}-${item.variantId}`}
                        className={`px-6 py-4 flex items-center justify-between ${item.isNew ? 'bg-green-50' : ''}`}
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {item.title}
                            {item.isNew && (
                              <span className="ml-2 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded">NEW</span>
                            )}
                          </p>
                          {item.variantTitle && (
                            <p className="text-sm text-gray-500">{item.variantTitle}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-600">${item.price.toFixed(2)}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateItemQuantity(item.productId, item.variantId, -1)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-600"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateItemQuantity(item.productId, item.variantId, 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-600"
                            >
                              +
                            </button>
                          </div>
                          <span className="w-20 text-right font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeItem(item.productId, item.variantId)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                            title="Remove item"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Read-only items
                    order.items.map((item) => (
                      <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3 flex-1">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-100 flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0" />
                          )}
                          <div>
                          <p className="font-semibold text-gray-900">{item.title}</p>
                          {item.variantTitle && item.variantTitle !== 'Default Title' && (
                            <p className="text-sm text-gray-500">{item.variantTitle}</p>
                          )}
                          {item.sku && (
                            <p className="text-xs text-gray-400 font-mono">SKU: {item.sku}</p>
                          )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {item.quantity} x ${item.price.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            ${item.total.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pricing Summary */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900 font-medium">${order.pricing.subtotal.toFixed(2)}</span>
                  </div>
                  {order.pricing.discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Discount {order.pricing.discountCode && (
                          <span className="inline-flex px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded ml-2">
                            {order.pricing.discountCode}
                          </span>
                        )}
                      </span>
                      <span className="text-green-600 font-medium">-${order.pricing.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">$</span>
                        <input
                          type="number"
                          value={editDeliveryFee}
                          onChange={(e) => {
                            setEditDeliveryFee(parseFloat(e.target.value) || 0);
                            setPreview(null);
                          }}
                          step="0.01"
                          min="0"
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ) : (
                      <span className="text-gray-900 font-medium">${order.pricing.deliveryFee.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (8.25%)</span>
                    <span className="text-gray-900 font-medium">${order.pricing.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-3 mt-3 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-blue-600">${order.pricing.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Amendment History */}
              {order.amendments && order.amendments.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <SectionHeader
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    }
                    title="Amendment History"
                  />
                  <div className="divide-y divide-gray-100">
                    {order.amendments.map((amendment) => (
                      <div key={amendment.id} className="px-6 py-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(amendment.resolution)}`}>
                              {amendment.resolution}
                            </span>
                            <span className="text-sm font-medium text-gray-700">
                              {amendment.type.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDateTime(amendment.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">
                            ${amendment.previousTotal.toFixed(2)} &rarr; ${amendment.newTotal.toFixed(2)}
                          </span>
                          <span className={`font-semibold ${amendment.amountDelta > 0 ? 'text-red-600' : amendment.amountDelta < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                            {amendment.amountDelta > 0 ? '+' : ''}${amendment.amountDelta.toFixed(2)}
                          </span>
                        </div>
                        {/* Show changes details */}
                        <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                          {amendment.changes.added?.map((item, i) => (
                            <p key={`a-${i}`}>+ Added {item.quantity}x {item.title} (${item.price.toFixed(2)})</p>
                          ))}
                          {amendment.changes.removed?.map((item, i) => (
                            <p key={`r-${i}`}>- Removed {item.quantity}x {item.title}</p>
                          ))}
                          {amendment.changes.modified?.map((item, i) => (
                            <p key={`m-${i}`}>~ {item.title}: qty {item.oldQuantity} &rarr; {item.newQuantity}</p>
                          ))}
                          {amendment.changes.deliveryFeeChange && (
                            <p>Delivery fee: ${amendment.changes.deliveryFeeChange.from.toFixed(2)} &rarr; ${amendment.changes.deliveryFeeChange.to.toFixed(2)}</p>
                          )}
                        </div>
                        {amendment.notes && (
                          <p className="mt-2 text-sm text-gray-600 italic">{amendment.notes}</p>
                        )}
                        {/* Action buttons for pending amendments */}
                        {amendment.resolution === 'PENDING' && amendment.amountDelta > 0 && amendment.draftOrderId && (
                          <button
                            onClick={() => sendAmendmentInvoice(amendment.id)}
                            className="mt-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Send Invoice (${amendment.amountDelta.toFixed(2)})
                          </button>
                        )}
                        {amendment.resolution === 'PENDING' && amendment.amountDelta < 0 && (
                          <button
                            onClick={() => {
                              setPendingAmendmentId(amendment.id);
                              setRefundAmount(Math.abs(amendment.amountDelta));
                              setRefundReason('Order amendment');
                              setShowRefundDialog(true);
                            }}
                            disabled={!order.payment.stripePaymentIntentId}
                            className="mt-2 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={!order.payment.stripePaymentIntentId ? 'No Stripe payment found for this order' : ''}
                          >
                            Process Refund (${Math.abs(amendment.amountDelta).toFixed(2)})
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <SectionHeader
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  }
                  title="Notes"
                />
                <div className="p-6 space-y-4">
                  {order.notes.customer && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Customer Note</p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-gray-800">
                        {order.notes.customer}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Internal Note</p>
                    <textarea
                      value={internalNote}
                      onChange={(e) => setInternalNote(e.target.value)}
                      onBlur={() => {
                        if (internalNote !== order.notes.internal) {
                          updateOrder({ internalNote });
                        }
                      }}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Add internal notes about this order..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Customer & Payment */}
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <SectionHeader
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                  title="Customer"
                />
                <div className="p-6 space-y-4">
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">
                      {order.customer.name || order.customerSnapshot.name || 'Guest'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Email</p>
                    <a
                      href={`mailto:${order.customer.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {order.customer.email}
                    </a>
                  </div>
                  {(order.customer.phone || order.customerSnapshot.phone) && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Phone</p>
                      <a
                        href={`tel:${order.customer.phone || order.customerSnapshot.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {order.customer.phone || order.customerSnapshot.phone}
                      </a>
                    </div>
                  )}
                  <div className="pt-4 border-t border-gray-100">
                    <Link
                      href={`/ops/customers?search=${encodeURIComponent(order.customer.email)}`}
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View Customer Profile
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Group Order Info */}
              {order.groupOrder.isGroupOrder && order.groupOrder.id && (
                <div className="bg-white rounded-xl shadow-sm border border-purple-200 overflow-hidden">
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-purple-100 bg-purple-50">
                    <span className="text-purple-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </span>
                    <h2 className="text-lg font-semibold text-purple-900">Part of Group Order</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Parent Group</p>
                      <Link
                        href={`/ops/group-orders/${order.groupOrder.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
                      >
                        <span className="font-mono">{order.groupOrder.shareCode}</span>
                        {order.groupOrder.name && (
                          <span className="text-purple-600">- {order.groupOrder.name}</span>
                        )}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                      {order.groupOrder.status && (
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.groupOrder.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          order.groupOrder.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.groupOrder.status}
                        </span>
                      )}
                    </div>

                    {order.groupOrder.siblingOrders.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                          Other Orders in This Group ({order.groupOrder.siblingOrders.length})
                        </p>
                        <div className="space-y-2">
                          {order.groupOrder.siblingOrders.map((sibling) => (
                            <Link
                              key={sibling.id}
                              href={`/ops/orders/${sibling.id}`}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div>
                                <span className="font-mono text-sm text-gray-900">#{sibling.orderNumber}</span>
                                <span className="text-gray-500 ml-2">- {sibling.customerName}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-medium text-gray-900">${sibling.total.toFixed(2)}</span>
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(sibling.status)}`}>
                                  {sibling.status}
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <SectionHeader
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  }
                  title="Payment"
                />
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Status</p>
                    <span className={`inline-flex px-3 py-1.5 rounded-lg border text-sm font-semibold ${getStatusColor(order.financialStatus)}`}>
                      {order.financialStatus}
                    </span>
                  </div>
                  {order.payment.stripePaymentIntentId && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Stripe Payment ID</p>
                      <p className="text-xs font-mono text-gray-600 bg-gray-50 p-2 rounded break-all">
                        {order.payment.stripePaymentIntentId}
                      </p>
                    </div>
                  )}
                  {order.shopify.orderId && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Shopify Order</p>
                      <p className="text-sm text-gray-600">
                        #{order.shopify.orderNumber}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Affiliate Attribution */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <SectionHeader
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                  title="Affiliate"
                />
                <div className="p-6">
                  {order.affiliate ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-800">
                            {order.affiliate.businessName}
                            <span className="ml-2 text-xs font-mono text-blue-600">({order.affiliate.code})</span>
                          </p>
                          <p className="text-xs text-blue-600">{order.affiliate.contactName}</p>
                        </div>
                        <button
                          onClick={handleUnlinkAffiliate}
                          disabled={affiliateLinking}
                          className="text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500">No affiliate attributed. Enter a code to link one.</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={affiliateCode}
                          onChange={(e) => { setAffiliateCode(e.target.value.toUpperCase()); setAffiliateError(''); }}
                          placeholder="e.g. POUR24"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase"
                          onKeyDown={(e) => e.key === 'Enter' && handleLinkAffiliate()}
                        />
                        <button
                          onClick={handleLinkAffiliate}
                          disabled={affiliateLinking || !affiliateCode.trim()}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          {affiliateLinking ? 'Linking...' : 'Link'}
                        </button>
                      </div>
                      {affiliateError && (
                        <p className="text-xs text-red-600">{affiliateError}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Order Timeline */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <SectionHeader
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  title="Timeline"
                />
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Created</span>
                    <span className="text-sm text-gray-900 font-medium">{formatDateTime(order.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Last Updated</span>
                    <span className="text-sm text-gray-900 font-medium">{formatDateTime(order.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Amendment Summary Bar (sticky bottom in edit mode) */}
      {isEditing && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-50 print:hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
            {preview ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-4 text-lg">
                    <span className="text-gray-500">Original: ${preview.previousTotal.toFixed(2)}</span>
                    <span className="text-gray-400">&rarr;</span>
                    <span className="font-bold text-gray-900">New: ${preview.newTotal.toFixed(2)}</span>
                    <span className={`font-bold text-lg ${preview.amountDelta > 0 ? 'text-red-600' : preview.amountDelta < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                      ({preview.amountDelta > 0 ? '+' : ''}${preview.amountDelta.toFixed(2)})
                    </span>
                  </div>
                  {preview.warnings.length > 0 && (
                    <div className="text-sm text-yellow-700">
                      {preview.warnings.map((w, i) => (
                        <p key={i}>{w}</p>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={amendNotes}
                      onChange={(e) => setAmendNotes(e.target.value)}
                      placeholder="Amendment notes (optional)"
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={cancelEditMode}
                    className="px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  {preview.amountDelta > 0 ? (
                    <button
                      onClick={confirmAmendment}
                      disabled={amendProcessing}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {amendProcessing ? 'Processing...' : `Create Amendment Invoice ($${preview.amountDelta.toFixed(2)})`}
                    </button>
                  ) : preview.amountDelta < 0 ? (
                    <button
                      onClick={confirmAmendment}
                      disabled={amendProcessing || !order.payment.stripePaymentIntentId}
                      className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                      title={!order.payment.stripePaymentIntentId ? 'No Stripe payment found -- cannot process refund' : ''}
                    >
                      {amendProcessing ? 'Processing...' : `Process Refund ($${Math.abs(preview.amountDelta).toFixed(2)})`}
                    </button>
                  ) : (
                    <button
                      onClick={confirmAmendment}
                      disabled={amendProcessing}
                      className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                    >
                      {amendProcessing ? 'Processing...' : 'Apply Changes'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  {editItems.length} item{editItems.length !== 1 ? 's' : ''} | Delivery: ${editDeliveryFee.toFixed(2)}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={cancelEditMode}
                    className="px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={fetchPreview}
                    disabled={amendProcessing}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                  >
                    {amendProcessing ? 'Loading...' : 'Preview Changes'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Refund Confirmation Dialog */}
      {showRefundDialog && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Process Refund</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Refund Amount</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">$</span>
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                    step="0.01"
                    min="0"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <input
                  type="text"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Reason for refund"
                />
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  This will process a refund of <strong>${refundAmount.toFixed(2)}</strong> via Stripe.
                  The customer will receive an email notification.
                </p>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowRefundDialog(false);
                    setPendingAmendmentId(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={processRefund}
                  disabled={refundProcessing || refundAmount <= 0}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
                >
                  {refundProcessing ? 'Processing...' : 'Confirm Refund'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Dialog */}
      {showCancelDialog && order && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Cancel Order #{order.orderNumber}</h3>
              <p className="text-sm text-gray-500 mt-1">The customer will receive a cancellation notification email.</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Warning */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800 font-medium">This action cannot be undone.</p>
              </div>

              {/* Refund checkbox */}
              {order.financialStatus === 'PAID' && order.payment.stripePaymentIntentId && (
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={issueRefund}
                    onChange={(e) => setIssueRefund(e.target.checked)}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-900">
                    Issue a full refund (<strong>${order.pricing.total.toFixed(2)}</strong>) right now
                  </span>
                </label>
              )}

              {/* Custom note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Note (optional)</label>
                <textarea
                  value={cancelNote}
                  onChange={(e) => setCancelNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  placeholder="Add a personal message to the customer..."
                />
              </div>

              {/* Email preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Preview</label>
                {cancelEmailPreview ? (
                  <iframe
                    srcDoc={getCancelPreviewHtml()}
                    sandbox=""
                    className="w-full border border-gray-200 rounded-lg"
                    style={{ height: '400px' }}
                    title="Cancellation email preview"
                  />
                ) : (
                  <div className="w-full h-[400px] border border-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                    Loading preview...
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Go Back
              </button>
              <button
                onClick={processCancellation}
                disabled={cancelProcessing}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {cancelProcessing ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print View */}
      <div ref={printRef} className="hidden print:block order-sheet">
        <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
          <div className="flex items-center gap-3">
            <span className="bg-black text-white text-lg font-bold px-3 py-1 rounded">
              #{order.orderNumber}
            </span>
            <span className="text-lg font-bold">Party On Delivery</span>
          </div>
          <span className="text-xs text-gray-500">
            Printed {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <div className="flex gap-4 mb-3">
          <div className="flex-1 border border-gray-400 rounded p-2">
            <div className="font-bold text-xs uppercase tracking-wide border-b border-gray-300 pb-1 mb-1">Delivery</div>
            <div className="font-bold text-sm">
              {new Date(order.delivery.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })}
              {' '}&middot;{' '}{order.delivery.time}
            </div>
            <div className="text-sm mt-1">
              {order.delivery.address.address1}
              {order.delivery.address.address2 ? `, ${order.delivery.address.address2}` : ''}
              <br />
              {order.delivery.address.city}, {order.delivery.address.state} {order.delivery.address.zip}
            </div>
            {order.delivery.phone && (
              <div className="text-sm mt-1">Tel: {order.delivery.phone}</div>
            )}
          </div>
          <div className="w-52 border border-gray-400 rounded p-2">
            <div className="font-bold text-xs uppercase tracking-wide border-b border-gray-300 pb-1 mb-1">Customer</div>
            <div className="font-bold text-sm">{order.customer.name || order.customerSnapshot.name || 'Guest'}</div>
            <div className="text-sm">{order.customer.email}</div>
            {(order.customer.phone || order.customerSnapshot.phone) && (
              <div className="text-sm">Tel: {order.customer.phone || order.customerSnapshot.phone}</div>
            )}
          </div>
        </div>

        {order.delivery.instructions && (
          <div className="mb-3 px-2 py-1.5 border-2 border-yellow-500 bg-yellow-50 rounded text-sm">
            <span className="font-bold">Instructions: </span>{order.delivery.instructions}
          </div>
        )}

        <table className="w-full mb-3 border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="text-left py-1 px-2 font-bold">Item</th>
              <th className="text-center py-1 px-2 w-12 font-bold">Qty</th>
              <th className="text-right py-1 px-2 w-20 font-bold">Price</th>
              <th className="text-center py-1 w-16 font-bold">In Store?</th>
              <th className="text-center py-1 w-16 font-bold">Packed?</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-300">
                <td className="py-1 px-2">
                  <span className="font-medium">{item.title}</span>
                  {item.variantTitle && item.variantTitle !== 'Default Title' && (
                    <span className="text-gray-500 ml-1">({item.variantTitle})</span>
                  )}
                </td>
                <td className="text-center py-1 px-2 font-bold text-base">{item.quantity}</td>
                <td className="text-right py-1 px-2">${item.total.toFixed(2)}</td>
                <td className="text-center py-1">
                  <span className="inline-block w-4 h-4 border-2 border-black rounded-sm"></span>
                </td>
                <td className="text-center py-1">
                  <span className="inline-block w-4 h-4 border-2 border-black rounded-sm"></span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex gap-4">
          <div className="flex-1">
            {order.notes.customer && (
              <div className="border border-gray-400 rounded p-2 text-sm">
                <span className="font-bold">Customer Note: </span>{order.notes.customer}
              </div>
            )}
            {order.pricing.discountCode && (
              <div className="mt-1 text-sm">
                <span className="font-bold">Discount: </span>
                <span className="font-mono">{order.pricing.discountCode}</span>
                {order.pricing.discountAmount > 0 && (
                  <span> (-${order.pricing.discountAmount.toFixed(2)})</span>
                )}
              </div>
            )}
          </div>
          <div className="w-48 border border-gray-400 rounded overflow-hidden text-sm">
            <div className="flex justify-between py-0.5 px-2 border-b border-gray-200">
              <span>Subtotal</span>
              <span>${order.pricing.subtotal.toFixed(2)}</span>
            </div>
            {order.pricing.discountAmount > 0 && (
              <div className="flex justify-between py-0.5 px-2 border-b border-gray-200">
                <span>Discount</span>
                <span>-${order.pricing.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between py-0.5 px-2 border-b border-gray-200">
              <span>Delivery</span>
              <span>${order.pricing.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-0.5 px-2 border-b border-gray-200">
              <span>Tax</span>
              <span>${order.pricing.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 px-2 bg-gray-100 font-bold text-base">
              <span>TOTAL</span>
              <span>${order.pricing.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
