import React, { HTMLAttributes, ReactNode } from 'react';

export type BadgeVariant = 'default' | 'brand' | 'success' | 'error' | 'warning';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Badge content */
  children: ReactNode;
  /** Visual variant */
  variant?: BadgeVariant;
  /** Size variant */
  size?: 'sm' | 'md';
}

/**
 * Design System Badge Component
 *
 * Base styling:
 * - rounded-full px-2 py-1 text-xs font-medium
 *
 * Variants:
 * - default: gray background
 * - brand: yellow background
 * - success: green
 * - error: red
 * - warning: orange
 */
export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center rounded-full font-medium';

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  const variantClasses = {
    default: 'bg-gray-100 text-gray-700',
    brand: 'bg-brand-yellow text-gray-900',
    success: 'bg-success/10 text-success',
    error: 'bg-error/10 text-error',
    warning: 'bg-warning/10 text-warning',
  };

  return (
    <span
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
