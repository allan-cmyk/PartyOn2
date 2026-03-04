'use client';

import { useState, useRef, useEffect, useCallback, ReactElement } from 'react';

interface AddAffiliateModalProps {
  onClose: () => void;
  onCreated: () => void;
}

type Category = 'BARTENDER' | 'BOAT' | 'VENUE' | 'PLANNER' | 'OTHER';

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: 'BARTENDER', label: 'Bartender' },
  { value: 'BOAT', label: 'Boat' },
  { value: 'VENUE', label: 'Venue' },
  { value: 'PLANNER', label: 'Planner' },
  { value: 'OTHER', label: 'Other' },
];

export default function AddAffiliateModal({ onClose, onCreated }: AddAffiliateModalProps): ReactElement {
  const [step, setStep] = useState<1 | 2>(1);

  // Form fields
  const [contactName, setContactName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<Category>('BARTENDER');
  const [code, setCode] = useState('');
  const [partnerSlug, setPartnerSlug] = useState('');

  // Step 2
  const [personalNote, setPersonalNote] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  // Shared
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  const isFormValid = contactName.trim() && businessName.trim() && email.trim() && category;

  const loadPreview = useCallback(async () => {
    setPreviewLoading(true);
    try {
      const res = await fetch('/api/admin/affiliates/create-and-send/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName,
          businessName,
          code: code || undefined,
          partnerSlug: partnerSlug || undefined,
          personalNote: personalNote || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPreviewHtml(data.html);
      } else {
        setPreviewHtml('<p style="padding:20px;color:red;">Failed to load preview</p>');
      }
    } catch {
      setPreviewHtml('<p style="padding:20px;color:red;">Failed to load preview</p>');
    } finally {
      setPreviewLoading(false);
    }
  }, [contactName, businessName, code, partnerSlug, personalNote]);

  // Load preview when entering step 2
  useEffect(() => {
    if (step === 2) {
      loadPreview();
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  // Write HTML to iframe
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

  const handleNext = () => {
    setError(null);
    setStep(2);
  };

  const handleBack = () => {
    setError(null);
    setStep(1);
  };

  const handleCreateAndSend = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/affiliates/create-and-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName,
          businessName,
          email,
          phone: phone || undefined,
          category,
          code: code || undefined,
          partnerSlug: partnerSlug || undefined,
          personalNote: personalNote || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (!data.data.emailSent) {
          alert('Affiliate created but welcome email failed to send. You may need to resend manually.');
        }
        onCreated();
      } else {
        setError(data.error || 'Failed to create affiliate');
      }
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {step === 1 ? 'Add Affiliate' : 'Preview Welcome Email'}
            </h2>
            <p className="text-sm text-gray-500">
              Step {step} of 2 {step === 1 ? '-- Affiliate details' : '-- Review and send'}
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

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          {step === 1 ? (
            <>
              {/* Contact Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name *</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Austin Mobile Bar Co."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(512) 555-1234"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Referral Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referral Code <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Leave blank to auto-generate"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Partner Page Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Partner Page Slug <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={partnerSlug}
                  onChange={(e) => setPartnerSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="e.g. cocktail-cowboys"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Custom URL slug for /partners/... page. Defaults to lowercase referral code if left blank.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* To (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input
                  type="text"
                  value={email}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 text-sm cursor-not-allowed"
                />
              </div>

              {/* Personal Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Note <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={personalNote}
                  onChange={(e) => setPersonalNote(e.target.value)}
                  rows={3}
                  placeholder="Great meeting you at the event! Looking forward to working together."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-y"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Appears as a highlighted block below the welcome paragraph
                </p>
              </div>

              {/* Refresh Preview */}
              <div>
                <button
                  onClick={loadPreview}
                  disabled={previewLoading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Preview
                </button>
              </div>

              {/* Preview iframe */}
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
            </>
          )}

          {/* Error */}
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl flex items-center justify-between">
          <div>
            {step === 2 && (
              <button
                onClick={handleBack}
                disabled={submitting}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Back
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            {step === 1 ? (
              <button
                onClick={handleNext}
                disabled={!isFormValid}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleCreateAndSend}
                disabled={submitting}
                className="px-6 py-2.5 text-sm font-semibold text-gray-900 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-lg hover:from-amber-500 hover:to-yellow-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating...' : 'Create & Send Email'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
