// SPDX-License-Identifier: Apache-2.0
import { memo } from 'react';
import { CONNECTION_STATUS } from '../../constants';
import { ConnectionActionButtonProps } from '../../types/connectionComponents';

/**
 * ConnectionActionButton component
 * 
 * Displays the appropriate action button based on connection status
 */
export const ConnectionActionButton = memo(function ConnectionActionButton({
  status,
  serverName,
  onConnect,
  onDisconnect
}: ConnectionActionButtonProps) {
  if (status === CONNECTION_STATUS.DISCONNECTED) {
    return (
      <button
        onClick={onConnect}
        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
        aria-label={`Connect to ${serverName}`}
      >
        Connect
      </button>
    );
  }
  
  if (status === CONNECTION_STATUS.CONNECTED) {
    return (
      <button
        onClick={onDisconnect}
        className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
        aria-label={`Disconnect from ${serverName}`}
      >
        Disconnect
      </button>
    );
  }
  
  return null;
}); 