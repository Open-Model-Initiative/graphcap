// SPDX-License-Identifier: Apache-2.0
import { forwardRef, InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  readonly error?: boolean;
};

/**
 * Reusable input component with error styling
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full px-2 py-1 text-sm bg-gray-700 border ${
          error ? 'border-red-500' : 'border-gray-600'
        } rounded focus:outline-none focus:border-blue-500 ${className ?? ''}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input'; 