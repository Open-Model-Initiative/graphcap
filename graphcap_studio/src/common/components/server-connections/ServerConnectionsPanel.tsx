// SPDX-License-Identifier: Apache-2.0
import { memo, useMemo } from 'react';
import { useServerConnectionsContext } from '../../context/ServerConnectionsContext';
import { ServerConnectionsPanelProps } from '../../types';
import { ServerConnectionItem } from './ServerConnectionItem';
import { CONNECTION_STATUS } from '../../constants';

/**
 * Server Connections Panel component
 * 
 * This component displays server connection statuses and controls
 * for the Media Server and GraphCap Server.
 */
export const ServerConnectionsPanel = memo(function ServerConnectionsPanel({ 
  className = '' 
}: ServerConnectionsPanelProps) {
  const { connections, autoConnect, isAutoConnecting } = useServerConnectionsContext();
  
  // Check if there are any disconnected servers that can be connected
  const hasDisconnectedServers = useMemo(() => {
    return connections.some(conn => 
      conn.url && 
      conn.url.trim() !== '' && 
      conn.status !== CONNECTION_STATUS.CONNECTED && 
      conn.status !== CONNECTION_STATUS.TESTING
    );
  }, [connections]);
  
  return (
    <div className={`w-full max-w-xs overflow-auto ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Server Connections</h2>
        {hasDisconnectedServers && (
          <button
            onClick={() => autoConnect()}
            className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-150 flex items-center"
            disabled={isAutoConnecting}
            title="Connect to all servers that are not already connected"
          >
            {isAutoConnecting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </>
            ) : (
              'Connect All'
            )}
          </button>
        )}
      </div>
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