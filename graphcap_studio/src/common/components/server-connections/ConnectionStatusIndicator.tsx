// SPDX-License-Identifier: Apache-2.0
import { memo } from 'react';
import { CONNECTION_STATUS } from '../../constants';
import { ConnectionStatusIndicatorProps } from '../../types/connectionComponents';

/**
 * ConnectionStatusIndicator component
 * 
 * Displays a visual indicator of the connection status
 */
export const ConnectionStatusIndicator = memo(function ConnectionStatusIndicator({
  status
}: ConnectionStatusIndicatorProps) {
  switch (status) {
    case CONNECTION_STATUS.CONNECTED:
      return (
        <span className="px-2 py-1 text-xs bg-green-500 text-white rounded">
          Connected
        </span>
      );
    case CONNECTION_STATUS.TESTING:
      return (
        <span className="px-2 py-1 text-xs bg-yellow-500 text-white rounded">
          Testing...
        </span>
      );
    case CONNECTION_STATUS.ERROR:
      return (
        <span className="px-2 py-1 text-xs bg-red-500 text-white rounded">
          Error
        </span>
      );
    default:
      return null;
  }
}); 