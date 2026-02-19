'use client';

import { useState, useEffect, ReactElement } from 'react';

interface EmailEvent {
  id: string;
  type: string;
  to: string;
  subject: string;
  status: string;
  resendId: string | null;
  sentAt: string | null;
  deliveredAt: string | null;
  openedAt: string | null;
  bouncedAt: string | null;
  complainedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
}

interface EmailEventTimelineProps {
  draftOrderId: string;
}

const STEP_CONFIG: {
  key: string;
  label: string;
  field: keyof EmailEvent;
  color: string;
  activeColor: string;
}[] = [
  { key: 'created', label: 'Created', field: 'createdAt', color: 'bg-gray-300', activeColor: 'bg-gray-500' },
  { key: 'sent', label: 'Sent', field: 'sentAt', color: 'bg-blue-300', activeColor: 'bg-blue-500' },
  { key: 'delivered', label: 'Delivered', field: 'deliveredAt', color: 'bg-green-300', activeColor: 'bg-green-500' },
  { key: 'opened', label: 'Opened', field: 'openedAt', color: 'bg-green-300', activeColor: 'bg-green-600' },
];

const ERROR_STEPS: {
  key: string;
  label: string;
  field: keyof EmailEvent;
  color: string;
}[] = [
  { key: 'bounced', label: 'Bounced', field: 'bouncedAt', color: 'bg-red-500' },
  { key: 'complained', label: 'Spam Complaint', field: 'complainedAt', color: 'bg-red-500' },
];

function formatTimestamp(ts: string): string {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function EmailEventTimeline({ draftOrderId }: EmailEventTimelineProps): ReactElement {
  const [events, setEvents] = useState<EmailEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch(`/api/v1/admin/draft-orders/${draftOrderId}/email-events`);
        const result = await res.json();
        if (result.success) {
          setEvents(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch email events:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [draftOrderId]);

  if (loading) {
    return (
      <div className="px-6 py-4 bg-gray-50/50">
        <div className="animate-pulse flex gap-4">
          <div className="h-3 bg-gray-200 rounded w-20" />
          <div className="h-3 bg-gray-200 rounded w-32" />
          <div className="h-3 bg-gray-200 rounded w-20" />
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="px-6 py-4 bg-gray-50/50 text-sm text-gray-500">
        No email events recorded for this invoice.
      </div>
    );
  }

  return (
    <div className="px-6 py-4 bg-gray-50/50 space-y-4">
      {events.map((event) => {
        const hasError = event.bouncedAt || event.complainedAt;
        const hasFailed = event.status === 'FAILED';

        return (
          <div key={event.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 font-mono">{event.to}</span>
              <span className="text-xs text-gray-400">{event.subject}</span>
            </div>

            {/* Timeline */}
            <div className="flex items-center gap-0">
              {STEP_CONFIG.map((step, i) => {
                const timestamp = event[step.field] as string | null;
                const isActive = !!timestamp;

                return (
                  <div key={step.key} className="flex items-center">
                    {/* Dot + label */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-3 h-3 rounded-full ${isActive ? step.activeColor : 'bg-gray-200'}`}
                      />
                      <span className={`text-[10px] mt-1 ${isActive ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                      {timestamp && (
                        <span className="text-[9px] text-gray-400">
                          {formatTimestamp(timestamp)}
                        </span>
                      )}
                    </div>

                    {/* Connecting line */}
                    {i < STEP_CONFIG.length - 1 && (
                      <div
                        className={`h-0.5 w-12 mx-1 ${
                          isActive && event[STEP_CONFIG[i + 1].field]
                            ? 'bg-green-300'
                            : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                );
              })}

              {/* Error steps (only shown if they have timestamps) */}
              {ERROR_STEPS.filter((s) => event[s.field]).map((step) => {
                const timestamp = event[step.field] as string | null;
                return (
                  <div key={step.key} className="flex items-center">
                    <div className="h-0.5 w-12 mx-1 bg-red-300" />
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${step.color}`} />
                      <span className="text-[10px] mt-1 text-red-600 font-medium">
                        {step.label}
                      </span>
                      {timestamp && (
                        <span className="text-[9px] text-gray-400">
                          {formatTimestamp(timestamp)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Error message */}
            {hasFailed && event.errorMessage && (
              <div className="mt-2 text-xs text-red-600 bg-red-50 rounded px-2 py-1">
                {event.errorMessage}
              </div>
            )}

            {hasError && !hasFailed && (
              <div className="mt-2 text-xs text-red-600 bg-red-50 rounded px-2 py-1">
                {event.bouncedAt ? 'Email bounced - address may be invalid' : 'Recipient marked email as spam'}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
