'use client';

import { useState, useEffect, useCallback, ReactElement } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

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

interface LineItem {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  variantTitle: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

interface DiscountInfo {
  valid: boolean;
  discountAmount: number;
  discountType: string | null;
  discountCode: string | null;
  message: string | null;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

const TIME_SLOTS = [
  '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM',
  '1:00 PM',  '1:30 PM',
  '2:00 PM',  '2:30 PM',
  '3:00 PM',  '3:30 PM',
  '4:00 PM',  '4:30 PM',
  '5:00 PM',  '5:30 PM',
  '6:00 PM',  '6:30 PM',
  '7:00 PM',  '7:30 PM',
  '8:00 PM',  '8:30 PM',
  '9:00 PM',
];

const NON_EDITABLE_STATUSES = ['PAID', 'CONVERTED', 'CANCELLED'];

export default function EditInvoicePage(): ReactElement {
  const params = useParams();
  const orderId = params?.id as string;

  // Loading state
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [orderToken, setOrderToken] = useState('');

  // Customer info
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Product search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Custom item form
  const [showCustomItem, setShowCustomItem] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');
  const [customItemQty, setCustomItemQty] = useState('1');

  // Line items
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  // Discount
  const [discountCode, setDiscountCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState<DiscountInfo | null>(null);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [manualDiscount, setManualDiscount] = useState('');
  const [useManualDiscount, setUseManualDiscount] = useState(false);

  // Delivery info
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryState, setDeliveryState] = useState('TX');
  const [deliveryZip, setDeliveryZip] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('25');

  // Admin
  const [adminNotes, setAdminNotes] = useState('');

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<{ id: string; invoiceUrl: string; token: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Calculated amounts
  const subtotal = lineItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = useManualDiscount
    ? parseFloat(manualDiscount) || 0
    : discountInfo?.valid
      ? discountInfo.discountAmount
      : 0;
  const deliveryFeeNum = parseFloat(deliveryFee) || 0;

  const taxRate = deliveryZip.length >= 5 ? 0.0825 : 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxableAmount * taxRate * 100) / 100;
  const total = taxableAmount + taxAmount + deliveryFeeNum;

  const isReadOnly = NON_EDITABLE_STATUSES.includes(orderStatus);

  // Load existing draft order
  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`/api/v1/admin/draft-orders/${orderId}`);
        const data = await res.json();
        if (!data.success) {
          setLoadError(data.error || 'Failed to load invoice');
          return;
        }

        const order = data.data;
        setOrderStatus(order.status);
        setOrderToken(order.token);

        setCustomerName(order.customerName || '');
        setCustomerEmail(order.customerEmail || '');
        setCustomerPhone(order.customerPhone || '');

        setDeliveryAddress(order.deliveryAddress || '');
        setDeliveryCity(order.deliveryCity || '');
        setDeliveryState(order.deliveryState || 'TX');
        setDeliveryZip(order.deliveryZip || '');
        // deliveryDate comes as ISO string — extract YYYY-MM-DD
        if (order.deliveryDate) {
          const d = new Date(order.deliveryDate);
          setDeliveryDate(d.toISOString().split('T')[0]);
        }
        setDeliveryTime(order.deliveryTime || '');
        setDeliveryNotes(order.deliveryNotes || '');
        setDeliveryFee(String(Number(order.deliveryFee)));

        setAdminNotes(order.adminNotes || '');

        // Line items
        if (order.items && order.items.length > 0) {
          setLineItems(
            order.items.map((item: { productId?: string; variantId?: string; title: string; variantTitle?: string; quantity: number; price: string | number; imageUrl?: string }, idx: number) => ({
              id: `${item.productId || 'item'}-${item.variantId || idx}`,
              productId: item.productId || 'custom',
              variantId: item.variantId || 'custom',
              title: item.title,
              variantTitle: item.variantTitle || '',
              quantity: item.quantity,
              price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
              imageUrl: item.imageUrl || '',
            }))
          );
        }

        // Discount
        const discAmt = Number(order.discountAmount);
        if (order.discountCode) {
          setDiscountCode(order.discountCode);
          setDiscountInfo({
            valid: true,
            discountAmount: discAmt,
            discountType: null,
            discountCode: order.discountCode,
            message: `Code ${order.discountCode} applied`,
          });
        } else if (discAmt > 0) {
          setUseManualDiscount(true);
          setManualDiscount(String(discAmt));
        }
      } catch {
        setLoadError('Network error loading invoice');
      } finally {
        setLoadingOrder(false);
      }
    }
    loadOrder();
  }, [orderId]);

  // Product search with debounce
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
    } catch {
      console.error('Product search failed');
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchProducts(searchQuery.trim());
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchProducts]);

  const addProductToLineItems = (product: SearchProduct, variant: SearchProduct['variants'][0]) => {
    const existing = lineItems.find(
      (item) => item.productId === product.id && item.variantId === variant.id
    );
    if (existing) {
      setLineItems(
        lineItems.map((item) =>
          item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      const variantTitle = [variant.option1Value, variant.option2Value].filter(Boolean).join(' / ');
      setLineItems([
        ...lineItems,
        {
          id: `${product.id}-${variant.id}`,
          productId: product.id,
          variantId: variant.id,
          title: product.title,
          variantTitle: variantTitle || (variant.title && variant.title !== 'Default Title' ? variant.title : ''),
          quantity: 1,
          price: typeof variant.price === 'string' ? parseFloat(variant.price) : variant.price,
          imageUrl: product.images[0]?.url || '',
        },
      ]);
    }
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const addCustomItem = () => {
    if (!customItemName.trim() || !customItemPrice) return;
    const price = parseFloat(customItemPrice);
    const qty = parseInt(customItemQty) || 1;
    if (price <= 0) return;

    setLineItems([
      ...lineItems,
      {
        id: `custom-${Date.now()}`,
        productId: 'custom',
        variantId: 'custom',
        title: customItemName.trim(),
        variantTitle: 'Custom Item',
        quantity: qty,
        price,
        imageUrl: '',
      },
    ]);
    setCustomItemName('');
    setCustomItemPrice('');
    setCustomItemQty('1');
    setShowCustomItem(false);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setLineItems(lineItems.map((item) => (item.id === id ? { ...item, quantity } : item)));
  };

  const removeItem = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  // Validate discount code
  const validateDiscount = async () => {
    if (!discountCode.trim()) return;
    setDiscountLoading(true);
    setDiscountInfo(null);
    try {
      const res = await fetch('/api/v1/admin/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: discountCode.trim(),
          subtotal,
          items: lineItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDiscountInfo(data.data);
        if (data.data.valid) {
          setUseManualDiscount(false);
        }
      }
    } catch {
      setDiscountInfo({ valid: false, discountAmount: 0, discountType: null, discountCode: null, message: 'Failed to validate' });
    } finally {
      setDiscountLoading(false);
    }
  };

  // Submit updated invoice
  const handleSubmit = async () => {
    setError('');

    if (!customerName.trim() || !customerEmail.trim()) {
      setError('Customer name and email are required.');
      return;
    }
    if (lineItems.length === 0) {
      setError('Add at least one item to the invoice.');
      return;
    }
    if (!deliveryAddress.trim() || !deliveryCity.trim() || !deliveryZip.trim()) {
      setError('Delivery address, city, and ZIP are required.');
      return;
    }
    if (!deliveryDate || !deliveryTime) {
      setError('Delivery date and time are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerEmail: customerEmail.trim(),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || null,
        deliveryAddress: deliveryAddress.trim(),
        deliveryCity: deliveryCity.trim(),
        deliveryState: deliveryState.trim(),
        deliveryZip: deliveryZip.trim(),
        deliveryDate,
        deliveryTime,
        deliveryNotes: deliveryNotes.trim() || null,
        items: lineItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          title: item.title,
          variantTitle: item.variantTitle,
          quantity: item.quantity,
          price: item.price,
          imageUrl: item.imageUrl || undefined,
        })),
        deliveryFee: deliveryFeeNum,
        discountAmount,
        discountCode: discountInfo?.valid ? discountInfo.discountCode || null : null,
        adminNotes: adminNotes.trim() || null,
      };

      const res = await fetch(`/api/v1/admin/draft-orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setSuccessData({
          id: data.data.id,
          invoiceUrl: data.data.invoiceUrl,
          token: data.data.token,
        });
      } else {
        setError(data.error || 'Failed to update invoice.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyInvoiceUrl = () => {
    if (successData?.invoiceUrl) {
      navigator.clipboard.writeText(successData.invoiceUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Loading state
  if (loadingOrder) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="bg-white rounded-xl p-6 space-y-4">
              <div className="h-5 bg-gray-200 rounded w-1/4" />
              <div className="grid grid-cols-3 gap-4">
                <div className="h-10 bg-gray-200 rounded" />
                <div className="h-10 bg-gray-200 rounded" />
                <div className="h-10 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Load error
  if (loadError) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Invoice</h2>
            <p className="text-gray-500 mb-6">{loadError}</p>
            <Link
              href="/ops/orders"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md inline-flex items-center gap-2"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Read-only view for non-editable statuses
  if (isReadOnly) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invoice Cannot Be Edited</h2>
            <p className="text-gray-500 mb-6">
              This invoice has status <span className="font-semibold text-gray-700">{orderStatus}</span> and can no longer be modified.
            </p>
            <div className="flex items-center justify-center gap-3">
              {orderToken && (
                <Link
                  href={`/invoice/${orderToken}`}
                  target="_blank"
                  className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View Invoice
                </Link>
              )}
              <Link
                href="/ops/orders"
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md inline-flex items-center gap-2"
              >
                Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success screen
  if (successData) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invoice Updated</h2>
            <p className="text-gray-500 mb-6">The invoice has been updated successfully.</p>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Invoice URL</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={successData.invoiceUrl}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm font-mono"
                />
                <button
                  onClick={copyInvoiceUrl}
                  className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                    copied
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                href={`/invoice/${successData.token}`}
                target="_blank"
                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Invoice
              </Link>
              <Link
                href={`/ops/orders/${orderId}/edit`}
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Again
              </Link>
              <Link
                href="/ops/orders"
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md flex items-center gap-2"
              >
                Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Breadcrumb & Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/ops/orders" className="hover:text-blue-600 transition-colors">Orders</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-medium">Edit Invoice</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Invoice</h1>
            <p className="text-gray-500 mt-0.5">Modify an existing draft order</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Section 1: Customer Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Customer Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="(512) 555-0123"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Products & Line Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Products
          </h2>

          {/* Product Search */}
          <div className="relative mb-4">
            <div className="relative">
              <svg className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                placeholder="Search products by name, SKU, or tag..."
                className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto">
                {searchResults.map((product) =>
                  product.variants.map((variant) => (
                    <button
                      key={`${product.id}-${variant.id}`}
                      onClick={() => addProductToLineItems(product, variant)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-50 last:border-0"
                    >
                      {product.images[0]?.url ? (
                        <img
                          src={product.images[0].url}
                          alt={product.title}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{product.title}</p>
                        <p className="text-xs text-gray-500">
                          {[variant.option1Value, variant.option2Value].filter(Boolean).join(' / ') || (variant.title && variant.title !== 'Default Title' ? variant.title : '')}
                          {variant.sku ? ` (${variant.sku})` : ''}
                        </p>
                      </div>
                      <span className="font-semibold text-gray-900 text-sm">
                        {formatCurrency(typeof variant.price === 'string' ? parseFloat(variant.price) : variant.price)}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Add Custom Item */}
          <div className="mb-4">
            {!showCustomItem ? (
              <button
                onClick={() => setShowCustomItem(true)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Custom Item
              </button>
            ) : (
              <div className="flex items-end gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={customItemName}
                    onChange={(e) => setCustomItemName(e.target.value)}
                    placeholder="Custom product name"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div className="w-28">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Price</label>
                  <input
                    type="number"
                    value={customItemPrice}
                    onChange={(e) => setCustomItemPrice(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div className="w-20">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Qty</label>
                  <input
                    type="number"
                    value={customItemQty}
                    onChange={(e) => setCustomItemQty(e.target.value)}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={addCustomItem}
                  disabled={!customItemName.trim() || !customItemPrice}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowCustomItem(false)}
                  className="px-3 py-2 text-gray-500 hover:text-gray-700 text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Line Items Table */}
          {lineItems.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-xs font-bold text-gray-600 uppercase tracking-wider w-12"></th>
                    <th className="text-left px-4 py-2.5 text-xs font-bold text-gray-600 uppercase tracking-wider">Product</th>
                    <th className="text-right px-4 py-2.5 text-xs font-bold text-gray-600 uppercase tracking-wider">Unit Price</th>
                    <th className="text-center px-4 py-2.5 text-xs font-bold text-gray-600 uppercase tracking-wider w-28">Qty</th>
                    <th className="text-right px-4 py-2.5 text-xs font-bold text-gray-600 uppercase tracking-wider">Total</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lineItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title} className="w-10 h-10 rounded-lg object-cover border border-gray-100" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                        {item.variantTitle && <p className="text-xs text-gray-500">{item.variantTitle}</p>}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                            min="1"
                            className="w-12 text-center border border-gray-200 rounded-md py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-end">
                <div className="text-sm">
                  <span className="text-gray-500">Subtotal:</span>
                  <span className="font-bold text-gray-900 ml-2">{formatCurrency(subtotal)}</span>
                </div>
              </div>
            </div>
          )}

          {lineItems.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-sm">Search for products or add custom items above</p>
            </div>
          )}
        </div>

        {/* Section 3: Discount */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Discount
          </h2>

          <div className="space-y-4">
            {/* Discount Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => {
                    setDiscountCode(e.target.value.toUpperCase());
                    setDiscountInfo(null);
                  }}
                  placeholder="Enter discount code"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase"
                />
                <button
                  onClick={validateDiscount}
                  disabled={!discountCode.trim() || discountLoading || lineItems.length === 0}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2"
                >
                  {discountLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Apply'
                  )}
                </button>
              </div>
              {discountInfo && (
                <div className={`mt-2 px-3 py-2 rounded-lg text-sm ${
                  discountInfo.valid
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {discountInfo.valid ? (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {discountInfo.message} — saves {formatCurrency(discountInfo.discountAmount)}
                      {discountInfo.discountType && ` (${discountInfo.discountType})`}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {discountInfo.message}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Manual Discount */}
            <div className="border-t border-gray-100 pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useManualDiscount}
                  onChange={(e) => {
                    setUseManualDiscount(e.target.checked);
                    if (e.target.checked) {
                      setDiscountInfo(null);
                      setDiscountCode('');
                    }
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Use manual discount amount instead</span>
              </label>
              {useManualDiscount && (
                <div className="mt-2">
                  <div className="relative w-48">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={manualDiscount}
                      onChange={(e) => setManualDiscount(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full pl-7 pr-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Delivery Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Delivery Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address *</label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="123 Main St, Suite 100"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  value={deliveryCity}
                  onChange={(e) => setDeliveryCity(e.target.value)}
                  placeholder="Austin"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={deliveryState}
                  onChange={(e) => setDeliveryState(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                <input
                  type="text"
                  value={deliveryZip}
                  onChange={(e) => setDeliveryZip(e.target.value)}
                  placeholder="78701"
                  maxLength={10}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full pl-7 pr-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date *</label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time *</label>
                <select
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white cursor-pointer transition-all"
                >
                  <option value="">Select time slot</option>
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Notes</label>
              <textarea
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="Gate code, special instructions, etc."
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Summary & Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Summary & Options
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Options */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal notes (not visible to customer)"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                />
              </div>
            </div>

            {/* Right: Totals */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount</span>
                    <span className="font-medium text-green-600">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Tax {deliveryZip.length >= 5 ? `(${(taxRate * 100).toFixed(2)}%)` : ''}
                  </span>
                  <span className="font-medium text-gray-900">
                    {deliveryZip.length >= 5 ? formatCurrency(taxAmount) : 'Enter ZIP'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium text-gray-900">{formatCurrency(deliveryFeeNum)}</span>
                </div>
                <div className="border-t border-gray-300 pt-3 flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <Link
              href="/ops/orders"
              className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
            >
              Cancel
            </Link>
            <button
              onClick={handleSubmit}
              disabled={submitting || lineItems.length === 0}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Click outside to close search results */}
      {showSearchResults && (
        <div className="fixed inset-0 z-10" onClick={() => setShowSearchResults(false)} />
      )}
    </div>
  );
}
