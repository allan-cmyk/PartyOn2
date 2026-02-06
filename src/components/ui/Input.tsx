import React, { forwardRef, InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Label text displayed above the input */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Helper text displayed below the input */
  helperText?: string;
}

/**
 * Design System Input Component
 *
 * Base styling:
 * - rounded-lg border-gray-200
 * - focus:border-brand-blue focus:ring-brand-blue
 *
 * Error state:
 * - border-error focus:border-error focus:ring-error
 *
 * Disabled state:
 * - bg-gray-100 cursor-not-allowed opacity-50
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', disabled, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;

    const baseClasses = [
      'block w-full px-4 py-3 rounded-lg border transition-all duration-200',
      'text-gray-900 placeholder-gray-400',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    ];

    const stateClasses = error
      ? 'border-error focus-visible:border-error focus-visible:ring-error'
      : 'border-gray-200 focus-visible:border-brand-blue focus-visible:ring-brand-blue';

    const disabledClasses = disabled
      ? 'bg-gray-100 cursor-not-allowed opacity-50'
      : 'bg-white';

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={`${baseClasses.join(' ')} ${stateClasses} ${disabledClasses} ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-2 text-sm text-error" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-2 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
