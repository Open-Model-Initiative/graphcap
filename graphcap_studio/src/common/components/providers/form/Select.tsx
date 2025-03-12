// SPDX-License-Identifier: Apache-2.0
import { forwardRef, SelectHTMLAttributes } from 'react';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  readonly error?: boolean;
  readonly options: Array<{ value: string; label: string }>;
};

/**
 * Reusable select component with error styling
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full px-2 py-1 text-sm bg-gray-700 border ${
          error ? 'border-red-500' : 'border-gray-600'
        } rounded focus:outline-none focus:border-blue-500 ${className ?? ''}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);

Select.displayName = 'Select'; 