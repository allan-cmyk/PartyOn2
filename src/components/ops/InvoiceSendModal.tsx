'use client';

import { useState, useCallback, useRef, useEffect, ReactElement } from 'react';

interface DraftOrderForModal {
  id: string;
  customerEmail: string;
  customerName: string;
  total: number | string;
  deliveryDate: string;
  deliveryTime: string;
}

interface InvoiceSendModalProps {
  draftOrder: DraftOrderForModal;
  onClose: () => void;
  onSent: () => void;
}

function formatCurrency(amount: number | string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount));
}

export default function InvoiceSendModal({ draftOrder, onClose, onSent }: InvoiceSendModalProps): ReactElement {
  const [cc, setCc] = useState('');
  const [subject, setSubject] = useState(
    `Your Invoice from Party On Delivery - ${formatCurrency(draftOrder.total)}`
  );
  const [greeting, setGreeting] = useState(`Hi ${draftOrder.customerName},`);
  const [bodyText, setBodyText] = useState(
    "Here's your invoice for your upcoming delivery. Click the button below to complete your payment."
  );
  const [personalNote, setPersonalNote] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Focus trap: close on backdrop click
  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  const buildTextOverrides = useCallback(() => ({
    greeting,
    bodyText,
  }), [greeting, bodyText]);

  const loadPreview = useCallback(async () => {
    setPreviewLoading(true);
    try {
      const response = await fetch(`/api/v1/admin/draft-orders/${draftOrder.id}/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textOverrides: buildTextOverrides(),
          personalNote: personalNote || undefined,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setPreviewHtml(result.html);
      }
    } catch {
      setPreviewHtml('<p style="padding:20px;color:red;">Failed to load preview</p>');
    } finally {
      setPreviewLoading(false);
    }
  }, [draftOrder.id, buildTextOverrides, personalNote]);

  // Load preview when toggled on or fields change
  useEffect(() => {
    if (showPreview) {
      loadPreview();
    }
  }, [showPreview, loadPreview]);

  // Write HTML to iframe when preview changes
  useEffect(() => {
    if (iframeRef.current && previewHtml) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(previewHtml);
        doc.close();
      }
    }
  }, [previewHtml]);

  const handleSend = async () => {
    setSending(true);
    setError(null);
    try {
      const ccList = cc
        .split(',')
        .map((e) => e.trim())
        .filter((e) => e.length > 0);

      const response = await fetch(`/api/v1/admin/draft-orders/${draftOrder.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cc: ccList.length > 0 ? ccList : undefined,
          subject,
          textOverrides: buildTextOverrides(),
          personalNote: personalNote || undefined,
        }),
      });
      const result = await response.json();
      if (result.success) {
        onSent();
      } else {
        setError(result.error || 'Failed to send invoice');
      }
    } catch {
      setError('Failed to send invoice');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Send Invoice</h2>
            <p className="text-sm text-gray-500">
              {draftOrder.customerName} -- {formatCurrency(draftOrder.total)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">
          {/* To (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input
              type="text"
              value={draftOrder.customerEmail}
              readOnly
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 text-sm cursor-not-allowed"
            />
          </div>

          {/* CC */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CC</label>
            <input
              type="text"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              placeholder="email@example.com, another@example.com"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Separate multiple emails with commas</p>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <hr className="border-gray-100" />

          {/* Greeting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Greeting</label>
            <input
              type="text"
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Body text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Body Text</label>
            <textarea
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-y"
            />
          </div>

          {/* Personal note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Personal Note <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={personalNote}
              onChange={(e) => setPersonalNote(e.target.value)}
              rows={2}
              placeholder="Thanks for choosing us for your wedding! Looking forward to making it special."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-y"
            />
            <p className="text-xs text-gray-400 mt-1">
              Appears as a highlighted block in the email, above the delivery details
            </p>
          </div>

          {/* Preview toggle */}
          <div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>

          {/* Preview iframe */}
          {showPreview && (
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
              {previewLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600" />
                  <span className="ml-3 text-sm text-gray-500">Loading preview...</span>
                </div>
              ) : (
                <iframe
                  ref={iframeRef}
                  title="Email Preview"
                  className="w-full border-0"
                  style={{ height: '500px' }}
                  sandbox="allow-same-origin"
                />
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={sending}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !subject.trim()}
            className="px-6 py-2.5 text-sm font-semibold text-gray-900 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-lg hover:from-amber-500 hover:to-yellow-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Sending...' : 'Send Invoice'}
          </button>
        </div>
      </div>
    </div>
  );
}
