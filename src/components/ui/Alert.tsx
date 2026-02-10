import React, { ReactNode } from 'react';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps {
  /** Alert content */
  children: ReactNode;
  /** Visual variant */
  variant?: AlertVariant;
  /** Optional title */
  title?: string;
  /** Whether alert can be dismissed */
  dismissible?: boolean;
  /** Callback when dismiss button clicked */
  onDismiss?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Design System Alert Component
 *
 * Variants:
 * - success: green
 * - error: red
 * - warning: orange
 * - info: brand-blue
 */
export default function Alert({
  children,
  variant = 'info',
  title,
  dismissible = false,
  onDismiss,
  className = '',
}: AlertProps) {
  const baseClasses = 'relative rounded-lg p-4';

  const variantClasses = {
    success: 'bg-success/10 border border-success/20 text-success',
    error: 'bg-error/10 border border-error/20 text-error',
    warning: 'bg-warning/10 border border-warning/20 text-warning',
    info: 'bg-brand-blue/10 border border-brand-blue/20 text-brand-blue',
  };

  const iconPaths = {
    success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      role="alert"
    >
      <div className="flex">
        {/* Icon */}
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={iconPaths[variant]}
            />
          </svg>
        </div>

        {/* Content */}
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-semibold mb-1">{title}</h3>
          )}
          <div className={title ? 'text-sm opacity-90' : 'text-sm'}>
            {children}
          </div>
        </div>

        {/* Dismiss button */}
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 ml-3 -mr-1 p-1 rounded hover:bg-black/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
            aria-label="Dismiss alert"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
