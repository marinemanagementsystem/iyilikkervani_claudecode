import React, { useId } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.ComponentPropsWithRef<'input'> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  multiline?: boolean;
  rows?: number;
}

export const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, startIcon, multiline, rows = 3, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const baseStyles = cn(
      'flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm placeholder:text-gray-400',
      'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
      'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
      'transition-colors duration-200',
      error && 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
      startIcon && 'pl-10'
    );

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
            {label} {props.required && <span className="text-red-500">*</span>}
          </label>
        )}

        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {startIcon}
            </div>
          )}

          {multiline ? (
            <textarea
              id={inputId}
              ref={ref as React.Ref<HTMLTextAreaElement>}
              rows={rows}
              className={cn(baseStyles, 'resize-y', className)}
              aria-invalid={!!error}
              aria-describedby={error ? errorId : helperText ? helperId : undefined}
              {...(props as React.ComponentPropsWithRef<'textarea'>)}
            />
          ) : (
            <input
              id={inputId}
              type={type}
              ref={ref as React.Ref<HTMLInputElement>}
              className={cn(baseStyles, className)}
              aria-invalid={!!error}
              aria-describedby={error ? errorId : helperText ? helperId : undefined}
              {...props}
            />
          )}
        </div>

        {error && (
          <p id={errorId} className="text-xs text-red-500 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={helperId} className="text-xs text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
