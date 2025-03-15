// SPDX-License-Identifier: Apache-2.0

/**
 * Component for displaying loading state
 */
export function LoadingState() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
    </div>
  );
} 