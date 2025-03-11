// SPDX-License-Identifier: Apache-2.0
import { memo } from 'react';
import { ConnectionCardProps } from '../../types/connectionComponents';

/**
 * ConnectionCard component
 * 
 * A card layout for displaying a server connection with its controls
 */
export const ConnectionCard = memo(function ConnectionCard({
  title,
  urlInput,
  actions,
  status
}: ConnectionCardProps) {
  return (
    <div className="border rounded-md p-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
      <h3 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      
      <div className="space-y-3 max-w-full">
        {/* URL Input */}
        <div className="w-full">
          {urlInput}
        </div>
        
        {/* Controls and Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {actions}
          </div>
          <div>
            {status}
          </div>
        </div>
      </div>
    </div>
  );
}); 