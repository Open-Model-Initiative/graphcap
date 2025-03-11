// SPDX-License-Identifier: Apache-2.0
import { memo } from 'react';
import { useServerConnectionsContext } from '../../context/ServerConnectionsContext';
import { ServerConnectionsPanelProps } from '../../types';
import { ServerConnectionItem } from './ServerConnectionItem';

/**
 * Server Connections Panel component
 * 
 * This component displays server connection statuses and controls
 * for the Media Server and GraphCap Server.
 */
export const ServerConnectionsPanel = memo(function ServerConnectionsPanel({ 
  className = '' 
}: ServerConnectionsPanelProps) {
  const { connections } = useServerConnectionsContext();
  
  return (
    <div className={`w-full max-w-xs overflow-auto ${className}`}>
      <h2 className="text-base font-semibold mb-4 text-gray-900 dark:text-gray-100">Server Connections</h2>
      <div className="space-y-4">
        {connections.map(connection => (
          <ServerConnectionItem
            key={connection.id}
            connectionId={connection.id}
          />
        ))}
      </div>
    </div>
  );
}); 