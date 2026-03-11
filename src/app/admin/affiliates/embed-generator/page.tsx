'use client';

import { useState, useEffect, useCallback, ReactElement } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { generateBannerHtml, generateCardHtml } from '@/lib/affiliates/embed-templates';

interface Affiliate {
  id: string;
  code: string;
  status: string;
  businessName: string;
  customerPerk: string;
}

type WidgetFormat = 'banner' | 'card';

export default function EmbedGeneratorPage(): ReactElement {
  const searchParams = useSearchParams();
  const preselectedId = searchParams?.get('id') ?? null;

  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [format, setFormat] = useState<WidgetFormat>('banner');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchAffiliates = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/affiliates');
      const data = await res.json();
      if (data.success) {
        const active = data.data.filter((a: Affiliate) => a.status === 'ACTIVE');
        setAffiliates(active);
        if (preselectedId && active.some((a: Affiliate) => a.id === preselectedId)) {
          setSelectedId(preselectedId);
        } else if (active.length > 0) {
          setSelectedId(active[0].id);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [preselectedId]);

  useEffect(() => {
    fetchAffiliates();
  }, [fetchAffiliates]);

  const selected = affiliates.find((a) => a.id === selectedId);
  const html = selected
    ? format === 'banner'
      ? generateBannerHtml({ code: selected.code, customerPerk: selected.customerPerk })
      : generateCardHtml({ code: selected.code, customerPerk: selected.customerPerk })
    : '';

  const handleCopy = async () => {
    if (!html) return;
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/affiliates" className="text-blue-600 hover:text-blue-800 text-sm">
          &larr; Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Embed Widget Generator</h1>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-5 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Partner</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {affiliates.length === 0 && <option value="">No active affiliates</option>}
              {affiliates.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.businessName} ({a.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
            <div className="flex gap-1">
              <button
                onClick={() => setFormat('banner')}
                className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                  format === 'banner'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Banner (Wide)
              </button>
              <button
                onClick={() => setFormat('card')}
                className={`px-4 py-2 text-sm font-medium rounded-r-md border border-l-0 ${
                  format === 'card'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Card (Compact)
              </button>
            </div>
          </div>
        </div>
        {selected && (
          <div className="mt-3 text-sm text-gray-500">
            Perk: <span className="font-medium text-gray-700">{selected.customerPerk || 'Free Delivery'}</span>
            {' | '}
            Link: <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">partyondelivery.com/order?ref={selected.code}</code>
          </div>
        )}
      </div>

      {/* Preview + Code */}
      {selected && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Preview */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <span className="text-sm text-gray-500 ml-2">Live Preview</span>
            </div>
            <div className="p-8 bg-gray-50 flex items-center justify-center min-h-[300px]">
              <iframe
                srcDoc={`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>body{margin:0;padding:20px;background:#f5f5f5;display:flex;justify-content:center;}</style></head><body>${html}</body></html>`}
                className="w-full border-0"
                style={{ height: format === 'banner' ? '220px' : '440px' }}
                title="Widget Preview"
              />
            </div>
          </div>

          {/* HTML Code */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-500">HTML Embed Code</span>
              <button
                onClick={handleCopy}
                className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 hover:from-amber-500 hover:to-yellow-600'
                }`}
              >
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
            <textarea
              readOnly
              value={html}
              className="w-full h-[calc(100%-44px)] min-h-[300px] p-4 text-xs font-mono text-gray-700 bg-gray-50 border-0 resize-none focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 bg-white rounded-lg shadow p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">How to use</h3>
        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
          <li>Select the partner and widget format above</li>
          <li>Click &quot;Copy to Clipboard&quot; to copy the HTML</li>
          <li>Send the code to the partner to paste into their website (WordPress code block, Squarespace embed, raw HTML, etc.)</li>
          <li>The widget links to <code className="text-xs bg-gray-100 px-1 rounded">partyondelivery.com/order?ref=CODE</code> for automatic attribution</li>
        </ol>
      </div>
    </div>
  );
}
