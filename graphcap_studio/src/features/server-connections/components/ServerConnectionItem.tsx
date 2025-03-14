// SPDX-License-Identifier: Apache-2.0
import { memo } from 'react';
import { useServerConnectionsContext } from '@/context/ServerConnectionsContext';
import { ConnectionCard } from './ConnectionCard';
import { ConnectionUrlInput } from './ConnectionUrlInput';
import { ConnectionActionButton } from './ConnectionActionButton';
import { ConnectionStatusIndicator } from './ConnectionStatusIndicator';

/**
 * Props for the ServerConnectionItem component
 */
interface ServerConnectionItemProps {
  connectionId: string;
}

/**
 * ServerConnectionItem component
 * 
 * Displays a single server connection with controls for connecting,
 * disconnecting, and changing the URL.
 */
export const ServerConnectionItem = memo(function ServerConnectionItem({
  connectionId
}: ServerConnectionItemProps) {
  const { connections, handleConnect, handleDisconnect, handleUrlChange } = useServerConnectionsContext();
  
  // Find the connection by ID
  const connection = connections.find(conn => conn.id === connectionId);
  
  // If connection not found, return null
  if (!connection) {
    return null;
  }
  
  // Handle URL change
  const handleUrlInputChange = (url: string) => {
    handleUrlChange(connectionId, url);
  };
  
  // Handle connect button click
  const handleConnectClick = () => {
    handleConnect(connectionId);
  };
  
  // Handle disconnect button click
  const handleDisconnectClick = () => {
    handleDisconnect(connectionId);
  };
  
  return (
    <ConnectionCard
      title={connection.name}
      urlInput={
        <ConnectionUrlInput
          url={connection.url}
          serverName={connection.name}
          onUrlChange={handleUrlInputChange}
        />
      }
      actions={
        <ConnectionActionButton
          status={connection.status}
          serverName={connection.name}
          onConnect={handleConnectClick}
          onDisconnect={handleDisconnectClick}
        />
      }
      status={
        <ConnectionStatusIndicator
          status={connection.status}
        />
      }
    />
  );
}); 