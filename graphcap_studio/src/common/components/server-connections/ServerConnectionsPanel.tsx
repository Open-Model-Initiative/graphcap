// SPDX-License-Identifier: Apache-2.0
import { useServerConnections } from '../../hooks';
import { ServerConnectionsPanelProps } from '../../types';
import { ServerConnectionItem } from './ServerConnectionItem';

/**
 * Server Connections Panel component
 * 
 * This component displays server connection statuses and controls
 * for the Media Server and GraphCap Server.
 */
export function ServerConnectionsPanel({ className = '' }: ServerConnectionsPanelProps) {
  const { connections, handleConnect, handleDisconnect, handleUrlChange } = useServerConnections();
  
  return (
    <div className={`space-y-6 ${className}`}>
      {connections.map(connection => (
        <ServerConnectionItem
          key={connection.id}
          connection={connection}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          onUrlChange={handleUrlChange}
        />
      ))}
    </div>
  );
} 