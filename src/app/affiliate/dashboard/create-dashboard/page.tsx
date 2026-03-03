'use client';

import { useState, useEffect, useCallback, type ReactElement, type FormEvent } from 'react';
import Link from 'next/link';
import type { AffiliatePresetConfig, TabPresetOption } from '@/lib/affiliates/presets';

interface TemplateOption {
  id: string;
  name: string;
  config: {
    partyType?: string;
    deliveryTime?: string;
    tabs?: Array<{
      name: string;
      deliveryAddress?: string;
      deliveryContextType?: string;
      deliveryTime?: string;
    }>;
  };
}

interface CustomTab {
  name: string;
  deliveryAddress: string;
}

export default function CreateDashboardPage(): ReactElement {
  // Form state
  const [clientName, setClientName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('12:00 PM - 12:30 PM');
  const [partyType, setPartyType] = useState('');
  const [selectedPresetIds, setSelectedPresetIds] = useState<string[]>([]);
  const [customTabs, setCustomTabs] = useState<CustomTab[]>([{ name: '', deliveryAddress: '' }]);

  // Template state
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');

  // Presets (loaded from affiliate code)
  const [presets, setPresets] = useState<AffiliatePresetConfig | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<{ dashboardUrl: string; shareCode: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Load presets based on affiliate code from session
  useEffect(() => {
    async function loadPresets() {
      try {
        const res = await fetch('/api/v1/affiliate/me');
        if (!res.ok) return;
        const json = await res.json();
        if (!json.success) return;
        const code = json.data?.affiliate?.code;
        if (!code) return;

        const { getAffiliatePresets } = await import('@/lib/affiliates/presets');
        const config = getAffiliatePresets(code);
        if (config) {
          setPresets(config);
          setDeliveryTime(config.defaultDeliveryTime);
        }
      } catch {
        // ignore -- presets are optional
      }
    }
    loadPresets();
  }, []);

  // Load templates
  const loadTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/affiliate/templates');
      if (res.status === 401) return;
      const json = await res.json();
      if (json.success) setTemplates(json.data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => { loadTemplates(); }, [loadTemplates]);

  // Apply template
  function applyTemplate(templateId: string) {
    setSelectedTemplateId(templateId);
    if (!templateId) return;

    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    const config = template.config;
    if (config.partyType) setPartyType(config.partyType);
    if (config.deliveryTime) setDeliveryTime(config.deliveryTime);

    if (config.tabs && presets) {
      const presetIds: string[] = [];
      const customs: CustomTab[] = [];

      config.tabs.forEach((tab) => {
        const matchedPreset = presets.tabPresets.find((p) => !p.isCustom && p.label === tab.name);
        if (matchedPreset) {
          presetIds.push(matchedPreset.id);
        } else {
          customs.push({ name: tab.name, deliveryAddress: tab.deliveryAddress || '' });
        }
      });

      setSelectedPresetIds(presetIds);
      if (customs.length > 0) {
        setCustomTabs(customs);
        if (!presetIds.includes('custom')) presetIds.push('custom');
        setSelectedPresetIds([...presetIds]);
      }
    }
  }

  function togglePreset(presetId: string) {
    setSelectedPresetIds((prev) =>
      prev.includes(presetId)
        ? prev.filter((id) => id !== presetId)
        : [...prev, presetId]
    );
  }

  function addCustomTab() {
    setCustomTabs((prev) => [...prev, { name: '', deliveryAddress: '' }]);
  }

  function removeCustomTab(index: number) {
    setCustomTabs((prev) => prev.filter((_, i) => i !== index));
  }

  function updateCustomTab(index: number, field: 'name' | 'deliveryAddress', value: string) {
    setCustomTabs((prev) =>
      prev.map((tab, i) => (i === index ? { ...tab, [field]: value } : tab))
    );
  }

  // Build title preview
  function getTitlePreview(): string {
    const name = clientName.trim() || '[Client Name]';
    if (!presets) return `${name}'s Order`;
    const pt = presets.partyTypes.find((p) => p.value === partyType);
    if (pt) return pt.titleFormat.replace('{name}', name);
    return `${name}'s Order`;
  }

  // Build tabs array from selections
  function buildTabs(): Array<{ name: string; deliveryAddress?: string; deliveryContextType?: string }> {
    const tabs: Array<{ name: string; deliveryAddress?: string; deliveryContextType?: string }> = [];

    if (presets) {
      // Preset affiliates: use selected preset tabs
      selectedPresetIds.forEach((presetId) => {
        if (presetId === 'custom') return;
        const preset = presets.tabPresets.find((p) => p.id === presetId);
        if (preset) {
          tabs.push({
            name: preset.label,
            deliveryAddress: preset.defaultAddress,
            deliveryContextType: preset.deliveryContextType,
          });
        }
      });

      if (selectedPresetIds.includes('custom')) {
        customTabs.forEach((ct) => {
          if (ct.name.trim()) {
            tabs.push({
              name: ct.name.trim(),
              deliveryAddress: ct.deliveryAddress.trim() || undefined,
            });
          }
        });
      }
    } else {
      // Non-preset affiliates: use custom tab inputs directly
      customTabs.forEach((ct) => {
        const name = ct.name.trim();
        tabs.push({
          name: name || 'Location 1',
          deliveryAddress: ct.deliveryAddress.trim() || undefined,
        });
      });
    }

    return tabs;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!clientName.trim() || !deliveryDate) return;

    const tabs = buildTabs();
    if (tabs.length === 0) {
      setError('Select at least one tab');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/affiliate/create-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: clientName.trim(),
          partyType: partyType || undefined,
          deliveryDate,
          deliveryTime,
          tabs,
          saveAsTemplate: saveAsTemplate && templateName.trim()
            ? { name: templateName.trim() }
            : undefined,
        }),
      });

      if (res.status === 401) {
        window.location.href = '/affiliate/dashboard';
        return;
      }

      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setSuccessData({
        dashboardUrl: json.data.dashboardUrl,
        shareCode: json.data.shareCode,
      });

      if (saveAsTemplate && templateName.trim()) {
        loadTemplates();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create dashboard');
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!successData) return;
    navigator.clipboard.writeText(successData.dashboardUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleCreateAnother() {
    setSuccessData(null);
    setClientName('');
    setDeliveryDate('');
    setLoading(false);
    setCopied(false);
    // Keep template + preset selections for rapid creation
  }

  // ============================
  // Success state
  // ============================

  if (successData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-heading font-bold tracking-[0.04em] text-gray-900">
              Dashboard Created
            </h1>
            <Link
              href="/affiliate/dashboard/orders"
              className="text-sm font-semibold text-gray-500 hover:text-gray-700"
            >
              All Orders
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-1">
                Dashboard ready for {clientName || 'client'}
              </p>
              <p className="text-sm text-gray-500">
                Share this link with your client so they can browse and order.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-500 mb-1">Dashboard Link</p>
              <p className="text-sm text-gray-900 break-all font-mono">
                {successData.dashboardUrl}
              </p>
            </div>

            <button
              onClick={handleCopy}
              className="w-full py-3 bg-brand-blue text-white text-base font-semibold tracking-[0.08em] rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>

            <div className="flex gap-3">
              <Link
                href={`/dashboard/${successData.shareCode}`}
                className="flex-1 py-2.5 text-center text-sm font-semibold text-brand-blue border-2 border-brand-blue rounded-lg hover:bg-blue-50 transition-colors"
              >
                Open Dashboard
              </Link>
              <button
                onClick={handleCreateAnother}
                className="flex-1 py-2.5 text-center text-sm font-semibold text-gray-700 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Create Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================
  // Form state
  // ============================

  const hasCustomSelected = selectedPresetIds.includes('custom');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-heading font-bold tracking-[0.04em] text-gray-900">
            Create Dashboard
          </h1>
          <Link
            href="/affiliate/dashboard/orders"
            className="text-sm font-semibold text-gray-500 hover:text-gray-700"
          >
            Cancel
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Template Selector */}
            {templates.length > 0 && (
              <div>
                <label className="block text-base font-medium text-gray-900 mb-1.5">
                  Load Template
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => applyTemplate(e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-base focus:border-brand-blue focus:ring-0 transition-colors bg-white"
                >
                  <option value="">Start from scratch</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Client Name */}
            <div>
              <label className="block text-base font-medium text-gray-900 mb-1.5">
                Client Name *
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Madison & Dane"
                required
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-base focus:border-brand-blue focus:ring-0 transition-colors"
              />
            </div>

            {/* Delivery Date */}
            <div>
              <label className="block text-base font-medium text-gray-900 mb-1.5">
                Delivery Date *
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                required
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-base focus:border-brand-blue focus:ring-0 transition-colors"
              />
            </div>

            {/* Delivery Time */}
            <div>
              <label className="block text-base font-medium text-gray-900 mb-1.5">
                Delivery Time
              </label>
              <select
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-base focus:border-brand-blue focus:ring-0 transition-colors bg-white"
              >
                <option value="8:00 AM - 8:30 AM">8:00 AM - 8:30 AM</option>
                <option value="8:30 AM - 9:00 AM">8:30 AM - 9:00 AM</option>
                <option value="9:00 AM - 9:30 AM">9:00 AM - 9:30 AM</option>
                <option value="9:30 AM - 10:00 AM">9:30 AM - 10:00 AM</option>
                <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</option>
                <option value="10:30 AM - 11:00 AM">10:30 AM - 11:00 AM</option>
                <option value="11:00 AM - 11:30 AM">11:00 AM - 11:30 AM</option>
                <option value="11:30 AM - 12:00 PM">11:30 AM - 12:00 PM</option>
                <option value="12:00 PM - 12:30 PM">12:00 PM - 12:30 PM</option>
                <option value="12:30 PM - 1:00 PM">12:30 PM - 1:00 PM</option>
                <option value="1:00 PM - 1:30 PM">1:00 PM - 1:30 PM</option>
                <option value="1:30 PM - 2:00 PM">1:30 PM - 2:00 PM</option>
                <option value="2:00 PM - 2:30 PM">2:00 PM - 2:30 PM</option>
                <option value="2:30 PM - 3:00 PM">2:30 PM - 3:00 PM</option>
                <option value="3:00 PM - 3:30 PM">3:00 PM - 3:30 PM</option>
                <option value="3:30 PM - 4:00 PM">3:30 PM - 4:00 PM</option>
                <option value="4:00 PM - 4:30 PM">4:00 PM - 4:30 PM</option>
                <option value="4:30 PM - 5:00 PM">4:30 PM - 5:00 PM</option>
                <option value="5:00 PM - 5:30 PM">5:00 PM - 5:30 PM</option>
                <option value="5:30 PM - 6:00 PM">5:30 PM - 6:00 PM</option>
              </select>
            </div>

            {/* Party Type */}
            {presets && (
              <div>
                <label className="block text-base font-medium text-gray-900 mb-2">
                  Party Type
                </label>
                <div className="flex gap-2">
                  {presets.partyTypes.map((pt) => (
                    <button
                      key={pt.value}
                      type="button"
                      onClick={() => setPartyType(partyType === pt.value ? '' : pt.value)}
                      className={`flex-1 p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                        partyType === pt.value
                          ? 'border-brand-yellow bg-yellow-50 text-gray-900'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {pt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Title Preview */}
            <div className="bg-gray-50 rounded-lg px-3 py-2">
              <p className="text-xs font-medium text-gray-500 mb-0.5">Dashboard Title</p>
              <p className="text-sm font-semibold text-gray-900">{getTitlePreview()}</p>
            </div>

            {/* Tab Selection */}
            {presets && (
              <div>
                <label className="block text-base font-medium text-gray-900 mb-2">
                  Tabs
                </label>
                <div className="space-y-2">
                  {presets.tabPresets.map((preset) => (
                    <TabPresetCheckbox
                      key={preset.id}
                      preset={preset}
                      checked={selectedPresetIds.includes(preset.id)}
                      onToggle={() => togglePreset(preset.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Custom Tab Inputs */}
            {hasCustomSelected && (
              <div className="space-y-3 pl-4 border-l-2 border-brand-yellow">
                {customTabs.map((ct, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={ct.name}
                        onChange={(e) => updateCustomTab(idx, 'name', e.target.value)}
                        placeholder="Tab name"
                        className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-brand-blue focus:ring-0 transition-colors"
                      />
                      {customTabs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCustomTab(idx)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={ct.deliveryAddress}
                      onChange={(e) => updateCustomTab(idx, 'deliveryAddress', e.target.value)}
                      placeholder="Delivery address (optional)"
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-brand-blue focus:ring-0 transition-colors"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCustomTab}
                  className="text-sm font-semibold text-brand-blue hover:text-blue-700 transition-colors"
                >
                  + Add another custom tab
                </button>
              </div>
            )}

            {/* Fallback: no presets -- show simple tab name + address */}
            {!presets && (
              <>
                <div>
                  <label className="block text-base font-medium text-gray-900 mb-1.5">
                    Tab Name
                  </label>
                  <input
                    type="text"
                    value={customTabs[0]?.name || ''}
                    onChange={(e) => updateCustomTab(0, 'name', e.target.value)}
                    placeholder="e.g. Lake Travis Boat Party"
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-base focus:border-brand-blue focus:ring-0 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-900 mb-1.5">
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    value={customTabs[0]?.deliveryAddress || ''}
                    onChange={(e) => updateCustomTab(0, 'deliveryAddress', e.target.value)}
                    placeholder="e.g. 1234 Lake Shore Dr, Austin TX 78732"
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-base focus:border-brand-blue focus:ring-0 transition-colors"
                  />
                </div>
              </>
            )}

            {/* Save as Template */}
            <div className="border-t border-gray-100 pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveAsTemplate}
                  onChange={(e) => setSaveAsTemplate(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                />
                <span className="text-sm font-medium text-gray-700">Save as template</span>
              </label>
              {saveAsTemplate && (
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Template name, e.g. Bach Weekend"
                  className="mt-2 w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-brand-blue focus:ring-0 transition-colors"
                />
              )}
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !clientName.trim() || !deliveryDate}
              className="w-full py-3 bg-brand-blue text-white text-base font-semibold tracking-[0.08em] rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Dashboard'}
            </button>

            <p className="text-sm text-gray-500 text-center">
              Your client will get free delivery automatically.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function TabPresetCheckbox({
  preset,
  checked,
  onToggle,
}: {
  preset: TabPresetOption;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all hover:border-gray-300"
      style={{
        borderColor: checked ? 'var(--color-brand-yellow, #F5A623)' : undefined,
        backgroundColor: checked ? 'rgb(254, 252, 232)' : undefined,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="mt-0.5 w-4 h-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
      />
      <div>
        <p className="text-sm font-semibold text-gray-900">{preset.label}</p>
        {preset.defaultAddress && (
          <p className="text-xs text-gray-500 mt-0.5">{preset.defaultAddress}</p>
        )}
        {preset.isCustom && (
          <p className="text-xs text-gray-500 mt-0.5">Enter custom tab name and address</p>
        )}
      </div>
    </label>
  );
}
