'use client';

import { ReactElement } from 'react';

interface Props {
  type: string;
  selected?: boolean;
  className?: string;
}

/** SVG icons for order types (no emojis per project rules) */
export default function OrderTypeIcon({ type, selected, className = '' }: Props): ReactElement {
  const color = selected ? 'currentColor' : 'currentColor';
  const base = `w-4 h-4 inline-block mr-1.5 ${className}`;

  switch (type) {
    case 'boat':
      return (
        <svg className={base} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 17h18l-3-8H6l-3 8zm9-14v6m-4 0h8" />
        </svg>
      );
    case 'house':
      return (
        <svg className={base} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-8 9 8M5 10v10h14V10M9 21v-6h6v6" />
        </svg>
      );
    case 'bus':
      return (
        <svg className={base} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2zm0 8h12M8 20v-2m8 2v-2M7 16h.01M17 16h.01" />
        </svg>
      );
    case 'party':
    default:
      return (
        <svg className={base} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l1 7h7l-5.5 4 2 7L12 16l-4.5 4 2-7L4 9h7l1-7z" />
        </svg>
      );
  }
}
