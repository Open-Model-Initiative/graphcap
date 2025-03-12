// SPDX-License-Identifier: Apache-2.0
import { ReactNode } from 'react';

type FormFieldProps = {
  readonly id: string;
  readonly label: string;
  readonly error?: string;
  readonly children: ReactNode;
};

/**
 * Reusable form field component with label and error handling
 */
export function FormField({ id, label, error, children }: FormFieldProps) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="block text-xs text-gray-500 mb-1">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
} 