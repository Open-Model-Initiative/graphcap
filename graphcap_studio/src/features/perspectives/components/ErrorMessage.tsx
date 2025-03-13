// SPDX-License-Identifier: Apache-2.0
/**
 * Error Message Component
 * 
 * This component displays error messages in the perspectives section.
 */

interface ErrorMessageProps {
  readonly message: string | null;
}

/**
 * Component for displaying error messages
 */
export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;
  
  return (
    <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-md text-red-200 text-sm">
      {message}
    </div>
  );
} 