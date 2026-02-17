'use client';

import { useState, ReactElement } from 'react';
import Link from 'next/link';
import { createGroupOrderV2 } from '@/lib/group-orders-v2/api-client';
import type { CreateTabInput, GroupOrderV2Full } from '@/lib/group-orders-v2/types';
import { ORDER_TYPES } from '@/lib/group-orders-v2/order-types';
import OrderTypeIcon from '@/components/group-v2/OrderTypeIcon';

interface TabFormData extends CreateTabInput {
  key: string;
}

// Get today's date in YYYY-MM-DD format for min date attribute
function getMinDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// Check if a date string (YYYY-MM-DD) falls on a Sunday
function isSunday(dateStr: string): boolean {
  const date = new Date(dateStr + 'T12:00:00');
  return date.getDay() === 0;
}

// Validate delivery date: must be today or later and not Sunday
function validateDeliveryDate(dateStr: string): string | null {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(dateStr + 'T12:00:00');

  if (selectedDate < today) {
    return 'Delivery date cannot be in the past';
  }
  if (isSunday(dateStr)) {
    return 'Delivery is not available on Sundays';
  }
  return null;
}

// Warn (but don't block) if delivery date is less than 72 hours away
function getDateWarning(dateStr: string): string | null {
  if (!dateStr) return null;
  const selectedDate = new Date(dateStr + 'T12:00:00');
  const now = new Date();
  const hoursUntil = (selectedDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (hoursUntil < 72) {
    return 'Orders with less than 72 hours notice may be subject to limited availability. We\'ll do our best!';
  }
  return null;
}

// Use stable index-based keys to avoid SSR/client hydration mismatch
// Date.now() generates different values on server vs client, causing React errors
function newTab(idx: number): TabFormData {
  return {
    key: `tab-${idx}`,
    name: idx === 0 ? 'House Order' : `Order ${idx + 1}`,
    orderType: 'house',
    deliveryDate: '',
    deliveryTime: '',
    deliveryAddress: {
      address1: '',
      city: 'Austin',
      province: 'TX',
      zip: '',
      country: 'US',
    },
    deliveryPhone: '',
    deliveryNotes: '',
  };
}

export default function CreateGroupPage(): ReactElement {
  const [name, setName] = useState('');
  const [hostName, setHostName] = useState('');
  const [hostEmail, setHostEmail] = useState('');
  const [hostPhone, setHostPhone] = useState('');
  const [tabs, setTabs] = useState<TabFormData[]>([newTab(0)]);
  // Counter ensures unique keys even when tabs are removed and re-added
  const [tabCounter, setTabCounter] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateErrors, setDateErrors] = useState<Record<string, string>>({});
  const [dateWarnings, setDateWarnings] = useState<Record<string, string>>({});
  const [createdGroup, setCreatedGroup] = useState<GroupOrderV2Full | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopy = async (text: string, type: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const addTab = () => {
    if (tabs.length >= 10) return;
    setTabs([...tabs, newTab(tabCounter)]);
    setTabCounter(tabCounter + 1);
  };

  const removeTab = (key: string) => {
    if (tabs.length <= 1) return;
    setTabs(tabs.filter((t) => t.key !== key));
  };

  const updateTab = (key: string, field: string, value: string) => {
    // Validate delivery date
    if (field === 'deliveryDate') {
      const dateError = validateDeliveryDate(value);
      setDateErrors((prev) => ({
        ...prev,
        [key]: dateError || '',
      }));
      // Set soft warning for short lead time (doesn't block submission)
      const dateWarning = !dateError ? getDateWarning(value) : null;
      setDateWarnings((prev) => ({
        ...prev,
        [key]: dateWarning || '',
      }));
    }

    setTabs(
      tabs.map((t) => {
        if (t.key !== key) return t;
        if (field.startsWith('address.')) {
          const addrField = field.split('.')[1];
          return {
            ...t,
            deliveryAddress: { ...t.deliveryAddress, [addrField]: value },
          };
        }
        return { ...t, [field]: value };
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate required fields
    if (!hostEmail || !hostPhone) {
      setError('Email and phone are required');
      setLoading(false);
      return;
    }

    // Validate all delivery dates
    for (const tab of tabs) {
      const dateError = validateDeliveryDate(tab.deliveryDate);
      if (dateError) {
        setError(`${tab.name}: ${dateError}`);
        setLoading(false);
        return;
      }
    }

    try {
      const group = await createGroupOrderV2({
        name,
        hostName,
        hostEmail,
        hostPhone,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        tabs: tabs.map(({ key, ...rest }) => ({
          ...rest,
          orderType: rest.orderType || undefined,
          // Convert date input (YYYY-MM-DD) to ISO string with noon time
          deliveryDate: rest.deliveryDate.includes('T')
            ? rest.deliveryDate
            : `${rest.deliveryDate}T12:00:00Z`,
        })),
      });

      // Store host info
      try {
        localStorage.setItem('groupV2Code', group.shareCode);
        const hostP = (group.participants || []).find((p) => p.isHost);
        if (hostP) {
          localStorage.setItem('groupV2ParticipantId', hostP.id);
        }
      } catch {
        // localStorage may be unavailable
      }

      setCreatedGroup(group);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group order');
    } finally {
      setLoading(false);
    }
  };

  // Check if created group has a house tab
  const hasHouseTab = createdGroup?.tabs?.some((t) => t.orderType === 'house') ?? false;

  if (createdGroup) {
    const shareCode = createdGroup.shareCode;
    const shareLink = `partyondelivery.com/group/${shareCode}`;

    return (
      <div className="pt-32 pb-16 px-4 min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Your group is live!</h1>
          </div>

          {/* Share Code */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Share Code</label>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                <span className="text-2xl font-mono font-bold text-gray-900 tracking-wider">{shareCode}</span>
              </div>
              <button
                onClick={() => handleCopy(shareCode, 'code')}
                className="px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium whitespace-nowrap"
              >
                {copiedCode ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Share Link */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Share Link</label>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 overflow-hidden">
                <span className="text-sm text-gray-900 break-all">{shareLink}</span>
              </div>
              <button
                onClick={() => handleCopy(`https://${shareLink}`, 'link')}
                className="px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium whitespace-nowrap"
              >
                {copiedLink ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Microcopy */}
          <p className="text-center text-gray-500 text-sm mb-6">
            Send this to your group &mdash; everyone pays separately.
          </p>

          {/* House Tab Upsell — only if no house tab */}
          {!hasHouseTab && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl" role="img" aria-label="house">🏠</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Add a House Tab</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Most groups stock the Airbnb too. Spend $250+ and get a <strong>FREE Welcome Package</strong> ($50 value).
                  </p>
                  <Link
                    href={`/group/${shareCode}/dashboard`}
                    className="inline-flex items-center text-sm font-semibold text-amber-700 hover:text-amber-800"
                  >
                    Add House Tab
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Primary CTA */}
          <Link
            href={`/group/${shareCode}/dashboard`}
            className="block w-full py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 text-center"
          >
            Go to Dashboard
          </Link>

          {/* Secondary link */}
          <Link
            href="/premier-partners"
            className="block text-center text-sm text-gray-500 hover:text-gray-700 mt-4"
          >
            &larr; Back to Premier Page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-16 px-4 min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create Group Order
        </h1>
        <p className="text-gray-600 mb-8">
          Set up a group order with one or more delivery tabs. Share the code so
          others can add their items.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Group Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event / Group Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Sarah's Birthday Party"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={hostEmail}
                  onChange={(e) => setHostEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                required
                value={hostPhone}
                onChange={(e) => setHostPhone(e.target.value)}
                className="w-full md:w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>

          {/* Tabs */}
          {tabs.map((tab, idx) => (
            <div
              key={tab.key}
              className="bg-white rounded-lg border border-gray-200 p-6 space-y-4"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  Delivery Tab {idx + 1}
                </h2>
                {tabs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTab(tab.key)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Order Type Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {ORDER_TYPES.map((ot) => (
                    <button
                      key={ot.value}
                      type="button"
                      onClick={() => updateTab(tab.key, 'orderType', ot.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        tab.orderType === ot.value
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <OrderTypeIcon type={ot.icon} selected={tab.orderType === ot.value} />
                      {ot.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tab Name
                  </label>
                  <input
                    type="text"
                    required
                    value={tab.name}
                    onChange={(e) => updateTab(tab.key, 'name', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Date
                  </label>
                  <input
                    type="date"
                    required
                    min={getMinDate()}
                    value={tab.deliveryDate}
                    onChange={(e) =>
                      updateTab(tab.key, 'deliveryDate', e.target.value)
                    }
                    className={`w-full border rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-yellow-500 ${
                      dateErrors[tab.key] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {dateErrors[tab.key] && (
                    <p className="text-red-500 text-sm mt-1">{dateErrors[tab.key]}</p>
                  )}
                  {!dateErrors[tab.key] && dateWarnings[tab.key] && (
                    <p className="text-amber-600 text-sm mt-1">{dateWarnings[tab.key]}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    Note: Deliveries are not available on Sundays
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Time
                </label>
                <select
                  required
                  value={tab.deliveryTime}
                  onChange={(e) =>
                    updateTab(tab.key, 'deliveryTime', e.target.value)
                  }
                  className="w-full md:w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">Select time</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="12:30 PM">12:30 PM</option>
                  <option value="1:00 PM">1:00 PM</option>
                  <option value="1:30 PM">1:30 PM</option>
                  <option value="2:00 PM">2:00 PM</option>
                  <option value="2:30 PM">2:30 PM</option>
                  <option value="3:00 PM">3:00 PM</option>
                  <option value="3:30 PM">3:30 PM</option>
                  <option value="4:00 PM">4:00 PM</option>
                  <option value="4:30 PM">4:30 PM</option>
                  <option value="5:00 PM">5:00 PM</option>
                  <option value="5:30 PM">5:30 PM</option>
                  <option value="6:00 PM">6:00 PM</option>
                  <option value="6:30 PM">6:30 PM</option>
                  <option value="7:00 PM">7:00 PM</option>
                  <option value="7:30 PM">7:30 PM</option>
                  <option value="8:00 PM">8:00 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Address
                </label>
                <input
                  type="text"
                  required
                  value={tab.deliveryAddress.address1}
                  onChange={(e) =>
                    updateTab(tab.key, 'address.address1', e.target.value)
                  }
                  placeholder="Street address"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-yellow-500 mb-2"
                />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    value={tab.deliveryAddress.city}
                    onChange={(e) =>
                      updateTab(tab.key, 'address.city', e.target.value)
                    }
                    placeholder="City"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-yellow-500"
                  />
                  <input
                    type="text"
                    value="TX"
                    disabled
                    className="border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-gray-500"
                  />
                  <input
                    type="text"
                    required
                    value={tab.deliveryAddress.zip}
                    onChange={(e) =>
                      updateTab(tab.key, 'address.zip', e.target.value)
                    }
                    placeholder="Zip code"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Notes (optional)
                </label>
                <textarea
                  value={tab.deliveryNotes || ''}
                  onChange={(e) =>
                    updateTab(tab.key, 'deliveryNotes', e.target.value)
                  }
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-yellow-500"
                  placeholder="Gate code, special instructions..."
                />
              </div>
            </div>
          ))}

          {tabs.length < 10 && (
            <button
              type="button"
              onClick={addTab}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600"
            >
              + Add Another Delivery Tab
            </button>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Group Order'}
          </button>
        </form>
      </div>
    </div>
  );
}
