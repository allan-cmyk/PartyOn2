import React, { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card content */
  children: ReactNode;
  /** Whether the card is clickable (adds hover effects) */
  clickable?: boolean;
  /** Optional padding override (default: p-6) */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Design System Card Component
 *
 * Base styling:
 * - bg-white rounded-xl border border-gray-200 shadow-sm
 *
 * Clickable variant:
 * - hover:shadow-md transition-shadow cursor-pointer
 */
export default function Card({
  children,
  clickable = false,
  padding = 'md',
  className = '',
  ...props
}: CardProps) {
  const baseClasses = [
    'bg-white rounded-xl border border-gray-200 shadow-sm',
  ];

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const clickableClasses = clickable
    ? 'hover:shadow-md transition-shadow duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2'
    : '';

  return (
    <div
      className={`${baseClasses.join(' ')} ${paddingClasses[padding]} ${clickableClasses} ${className}`}
      tabIndex={clickable ? 0 : undefined}
      role={clickable ? 'button' : undefined}
      {...props}
    >
      {children}
    </div>
  );
}
