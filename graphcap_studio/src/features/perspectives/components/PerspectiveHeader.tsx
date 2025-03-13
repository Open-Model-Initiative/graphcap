// SPDX-License-Identifier: Apache-2.0
/**
 * Perspective Header Component
 * 
 * This component displays the header for the perspectives section.
 */

import { LoadingSpinner } from '@/common/ui';

interface PerspectiveHeaderProps {
  readonly isLoading: boolean;
}

/**
 * Header component for the perspectives section
 */
export function PerspectiveHeader({ isLoading }: PerspectiveHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-medium text-gray-200">Perspectives</h3>
      {isLoading && (
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <LoadingSpinner size="sm" color="primary" className="h-3 w-3" />
          <span>Processing perspectives...</span>
        </div>
      )}
    </div>
  );
} 