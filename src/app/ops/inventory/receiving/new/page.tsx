'use client';

import { useRef, useState, ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { compressImageForUpload } from '@/lib/inventory/receiving/image-compress';

export default function ReceivingUploadPage(): ReactElement {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<'idle' | 'compressing' | 'uploading' | 'parsing'>('idle');
  const [error, setError] = useState<string | null>(null);
  const uploading = stage !== 'idle';

  const handleFileSelected = (selected: File | null) => {
    setError(null);
    if (!selected) return;
    if (!selected.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    setFile(selected);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(selected);
  };

  const handleUpload = async () => {
    if (!file) return;
    setError(null);
    try {
      setStage('compressing');
      const compressed = await compressImageForUpload(file);

      setStage('uploading');
      const formData = new FormData();
      formData.append('image', compressed);
      const res = await fetch('/api/v1/inventory/receiving', { method: 'POST', body: formData });
      setStage('parsing');
      const text = await res.text();
      let data: { invoiceId?: string; error?: string } = {};
      try { data = text ? JSON.parse(text) : {}; } catch { /* non-JSON response */ }
      if (!res.ok || !data.invoiceId) {
        setError(data.error || `Upload failed (${res.status})${text && !data.error ? `: ${text.slice(0, 200)}` : ''}`);
        setStage('idle');
        return;
      }
      router.push(`/ops/inventory/receiving/${data.invoiceId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setStage('idle');
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/ops/inventory" className="text-blue-600 text-sm font-medium hover:underline">← Inventory</Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Receive Shipment</h1>
        <p className="text-gray-500 mt-1 mb-6">Snap or upload a photo of the distributor invoice. We&apos;ll parse the line items and let you review before adding to stock.</p>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          {!preview ? (
            <div className="flex flex-col items-center gap-4 py-12">
              <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm text-gray-500 text-center">Take a clear photo of the full invoice. Good light, no shadows across the SKU column.</p>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-brand-blue text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Take Photo / Upload
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Invoice preview" className="w-full rounded-lg border border-gray-200" />
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => { setPreview(null); setFile(null); }}
                  disabled={uploading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Retake
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-6 py-2 bg-brand-blue text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60"
                >
                  {stage === 'compressing' && 'Compressing…'}
                  {stage === 'uploading' && 'Uploading…'}
                  {stage === 'parsing' && 'Parsing invoice…'}
                  {stage === 'idle' && 'Parse Invoice'}
                </button>
              </div>
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
