// SPDX-License-Identifier: Apache-2.0
import { createContext, useContext, ReactNode } from 'react';
import { useServerConnections } from '@/features/server-connections';
import { ServerConnection } from '@/features/server-connections/types';

/**
 * Interface for the ServerConnectionsContext value
 */
interface ServerConnectionsContextValue {
  connections: ServerConnection[];
  handleConnect: (id: string) => void;
  handleDisconnect: (id: string) => void;
  handleUrlChange: (id: string, url: string) => void;
  autoConnect: () => Promise<void>;
  isAutoConnecting: boolean;
}

// Create the context with a default value
const ServerConnectionsContext = createContext<ServerConnectionsContextValue | undefined>(undefined);

/**
 * Props for the ServerConnectionsProvider component
 */
interface ServerConnectionsProviderProps {
  children: ReactNode;
}

/**
 * Provider component for server connections context
 */
export function ServerConnectionsProvider({ children }: Readonly<ServerConnectionsProviderProps>) {
  const serverConnections = useServerConnections();
  
  return (
    <ServerConnectionsContext.Provider value={serverConnections}>
      {children}
    </ServerConnectionsContext.Provider>
  );
}

/**
 * Custom hook to use the server connections context
 */
export function useServerConnectionsContext() {
  const context = useContext(ServerConnectionsContext);
  
  if (context === undefined) {
    throw new Error('useServerConnectionsContext must be used within a ServerConnectionsProvider');
  }
  
  return context;
} 