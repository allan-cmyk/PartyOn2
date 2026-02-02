'use client';

import { ReactElement } from 'react';
import type { SubOrderFull } from '@/lib/group-orders-v2/types';

interface Props {
  tab: SubOrderFull;
  isHost?: boolean;
  onEdit?: () => void;
}

export default function TabDeliveryInfo({ tab, isHost, onEdit }: Props): ReactElement {
  const isPastDeadline = tab.orderDeadline ? new Date(tab.orderDeadline) < new Date() : false;
  const addr = tab.deliveryAddress;

  return (
    <div className="bg-v2-bgSoft rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-v2-text">
            {new Date(tab.deliveryDate).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <span className="text-sm text-v2-muted">at {tab.deliveryTime}</span>
          {isPastDeadline && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
              Past Deadline
            </span>
          )}
          {tab.status === 'LOCKED' && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
              Locked
            </span>
          )}
        </div>
        <p className="text-sm text-v2-muted">
          {addr?.address1 ?? ''}
          {addr?.address2 ? `, ${addr.address2}` : ''}
          {addr?.city ? `, ${addr.city}` : ''}
          {addr?.province ? `, ${addr.province}` : ''}{' '}
          {addr?.zip ?? ''}
        </p>
        {tab.deliveryNotes && (
          <p className="text-xs text-v2-muted">Notes: {tab.deliveryNotes}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {tab.orderDeadline && (
          <div className="text-sm text-v2-muted">
            <span>Deadline: </span>
            <span className={`font-medium ${isPastDeadline ? 'text-red-600' : 'text-v2-text'}`}>
              {new Date(tab.orderDeadline).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
          </div>
        )}
        {isHost && onEdit && tab.status === 'OPEN' && !isPastDeadline && (
          <button
            onClick={onEdit}
            className="text-xs font-medium text-v2-muted hover:text-brand-blue px-2 py-1 rounded hover:bg-v2-blueTint"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}
