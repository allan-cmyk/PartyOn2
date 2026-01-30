'use client';

import { useState, ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { createGroupOrderV2 } from '@/lib/group-orders-v2/api-client';
import type { CreateTabInput } from '@/lib/group-orders-v2/types';

interface TabFormData extends CreateTabInput {
  key: string;
}

function newTab(idx: number): TabFormData {
  return {
    key: `tab-${Date.now()}-${idx}`,
    name: idx === 0 ? 'Main Order' : `Order ${idx + 1}`,
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
  const router = useRouter();
  const [name, setName] = useState('');
  const [hostName, setHostName] = useState('');
  const [hostEmail, setHostEmail] = useState('');
  const [hostPhone, setHostPhone] = useState('');
  const [tabs, setTabs] = useState<TabFormData[]>([newTab(0)]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addTab = () => {
    if (tabs.length >= 10) return;
    setTabs([...tabs, newTab(tabs.length)]);
  };

  const removeTab = (key: string) => {
    if (tabs.length <= 1) return;
    setTabs(tabs.filter((t) => t.key !== key));
  };

  const updateTab = (key: string, field: string, value: string) => {
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

    try {
      const group = await createGroupOrderV2({
        name,
        hostName,
        hostEmail: hostEmail || undefined,
        hostPhone: hostPhone || undefined,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        tabs: tabs.map(({ key, ...rest }) => rest),
      });

      // Store host info
      localStorage.setItem('groupV2Code', group.shareCode);
      const hostP = group.participants.find((p) => p.isHost);
      if (hostP) {
        localStorage.setItem('groupV2ParticipantId', hostP.id);
      }

      router.push(`/group-v2/${group.shareCode}/dashboard`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group order');
    } finally {
      setLoading(false);
    }
  };

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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-gold-500"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-gold-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={hostEmail}
                  onChange={(e) => setHostEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-gold-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone (optional)
              </label>
              <input
                type="tel"
                value={hostPhone}
                onChange={(e) => setHostPhone(e.target.value)}
                className="w-full md:w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-gold-500"
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Date
                  </label>
                  <input
                    type="date"
                    required
                    value={tab.deliveryDate}
                    onChange={(e) =>
                      updateTab(tab.key, 'deliveryDate', e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-gold-500"
                  />
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
                  className="w-full md:w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-gold-500"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-gold-500 mb-2"
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
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-gold-500"
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
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-gold-500"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-gold-500"
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
