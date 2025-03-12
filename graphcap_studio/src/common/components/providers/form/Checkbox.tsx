// SPDX-License-Identifier: Apache-2.0
import { forwardRef, InputHTMLAttributes } from 'react';

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  readonly label: string;
  readonly error?: boolean;
};

/**
 * Reusable checkbox component with label
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, error, label, id, ...props }, ref) => {
    return (
      <div className="flex items-center space-x-2">
        <input
          ref={ref}
          type="checkbox"
          id={id}
          className={`rounded border-gray-600 text-blue-600 focus:ring-blue-500 ${className ?? ''}`}
          {...props}
        />
        <label htmlFor={id} className="text-xs">
          {label}
        </label>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox'; 