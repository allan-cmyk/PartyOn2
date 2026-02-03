'use client';

import { useState, ReactElement } from 'react';

type EmailType = 'order-confirmation' | 'delivery-en-route' | 'delivery-completed' | 'payment-failed' | 'refund-processed';

const EMAIL_LABELS: Record<EmailType, string> = {
  'order-confirmation': 'Order Confirmation',
  'delivery-en-route': 'Delivery En Route',
  'delivery-completed': 'Delivery Completed',
  'payment-failed': 'Payment Failed',
  'refund-processed': 'Refund Processed',
};

const SAMPLE_DATA = {
  orderNumber: 1234,
  customerName: 'John Smith',
  customerEmail: 'john@example.com',
  items: [
    { title: 'Tito\'s Vodka 750ml', variantTitle: null, quantity: 2, price: 24.99, totalPrice: 49.98 },
    { title: 'Corona Extra', variantTitle: '12 Pack', quantity: 1, price: 18.99, totalPrice: 18.99 },
    { title: 'Lime Wedges', variantTitle: null, quantity: 1, price: 4.99, totalPrice: 4.99 },
  ],
  subtotal: 73.96,
  deliveryFee: 15.00,
  taxAmount: 6.10,
  total: 95.06,
  deliveryDate: new Date('2026-02-10'),
  deliveryTime: '2-4 PM',
  deliveryAddress: {
    address1: '123 Lake Austin Blvd',
    address2: 'Apt 4B',
    city: 'Austin',
    province: 'TX',
    zip: '78703',
  },
  deliveryInstructions: 'Gate code is #1234. Leave at front door.',
  driverName: 'Mike',
  estimatedArrival: '15 minutes',
};

export default function EmailPreviewPage(): ReactElement {
  const [selectedEmail, setSelectedEmail] = useState<EmailType>('order-confirmation');
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  const loadPreview = async (type: EmailType) => {
    setSelectedEmail(type);
    setLoading(true);
    setSendResult(null);
    try {
      const res = await fetch(`/api/ops/email-preview?type=${type}`);
      const data = await res.json();
      setHtml(data.html || '<p>Error loading preview</p>');
    } catch {
      setHtml('<p>Failed to load preview</p>');
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail.trim() || !html) return;
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch('/api/ops/email-preview/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedEmail, to: testEmail.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSendResult({ success: true, message: `Email sent to ${testEmail}` });
      } else {
        setSendResult({ success: false, message: data.error || 'Failed to send email' });
      }
    } catch {
      setSendResult({ success: false, message: 'Network error' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Email Preview</h1>
            <p className="text-gray-500 mt-0.5">Preview email templates as recipients see them</p>
          </div>
        </div>
      </div>

      {/* Email Type Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { id: 'order-confirmation', label: 'Order Confirmation', color: 'green' },
            { id: 'delivery-en-route', label: 'Delivery En Route', color: 'blue' },
            { id: 'delivery-completed', label: 'Delivery Completed', color: 'purple' },
            { id: 'payment-failed', label: 'Payment Failed', color: 'red' },
            { id: 'refund-processed', label: 'Refund Processed', color: 'yellow' },
          ].map((email) => (
            <button
              key={email.id}
              onClick={() => loadPreview(email.id as EmailType)}
              className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                selectedEmail === email.id
                  ? 'bg-gradient-to-r from-pink-600 to-pink-700 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {email.label}
            </button>
          ))}
        </div>

        {/* Send Test Email */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter email address..."
            className="flex-1 max-w-xs px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
          />
          <button
            onClick={sendTestEmail}
            disabled={sending || !testEmail.trim() || !html}
            className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-green-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {sending ? 'Sending...' : 'Send Test Email'}
          </button>
          {sendResult && (
            <span className={`text-sm font-medium ${sendResult.success ? 'text-green-600' : 'text-red-600'}`}>
              {sendResult.message}
            </span>
          )}
        </div>
      </div>

      {/* Preview Frame */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <span className="text-sm text-gray-500 ml-2">Email Preview - {selectedEmail}</span>
        </div>

        {loading ? (
          <div className="p-16 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-gray-500">Loading preview...</p>
          </div>
        ) : html ? (
          <iframe
            srcDoc={html}
            className="w-full h-[800px] border-0"
            title="Email Preview"
          />
        ) : (
          <div className="p-16 text-center">
            <p className="text-gray-500">Click an email type above to preview</p>
          </div>
        )}
      </div>

      {/* Sample Data Reference */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sample Data Used</h3>
        <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-auto max-h-64 text-gray-700">
          {JSON.stringify(SAMPLE_DATA, null, 2)}
        </pre>
      </div>
    </div>
  );
}
