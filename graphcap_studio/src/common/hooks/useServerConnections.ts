// SPDX-License-Identifier: Apache-2.0
import { useState, useCallback } from 'react';
import { ServerConnection } from '../types';
import { SERVER_IDS, SERVER_NAMES, DEFAULT_URLS } from '../constants';

/**
 * Custom hook for managing server connections
 * 
 * This hook provides state and handlers for managing server connections
 * such as Media Server and GraphCap Server.
 */
export function useServerConnections() {
  // Initialize connections with values from environment variables
  const [connections, setConnections] = useState<ServerConnection[]>([
    {
      id: SERVER_IDS.MEDIA_SERVER,
      name: SERVER_NAMES[SERVER_IDS.MEDIA_SERVER],
      status: 'disconnected',
      url: import.meta.env.VITE_MEDIA_SERVER_URL || DEFAULT_URLS[SERVER_IDS.MEDIA_SERVER]
    },
    {
      id: SERVER_IDS.GRAPHCAP_SERVER,
      name: SERVER_NAMES[SERVER_IDS.GRAPHCAP_SERVER],
      status: 'disconnected',
      url: import.meta.env.VITE_API_URL || DEFAULT_URLS[SERVER_IDS.GRAPHCAP_SERVER]
    }
  ]);
  
  /**
   * Handle connecting to a server
   */
  const handleConnect = useCallback((id: string) => {
    // Set status to testing
    setConnections(prev => 
      prev.map(conn => 
        conn.id === id 
          ? { ...conn, status: 'testing' } 
          : conn
      )
    );
    
    // Simulate connection attempt
    const serverUrl = connections.find(conn => conn.id === id)?.url;
    
    // In a real implementation, we would make an actual API call here
    // For now, we'll simulate a successful connection after a delay
    setTimeout(() => {
      try {
        // Simulate successful connection
        setConnections(prev => 
          prev.map(conn => 
            conn.id === id 
              ? { ...conn, status: 'connected' } 
              : conn
          )
        );
      } catch (error) {
        // Handle connection error
        setConnections(prev => 
          prev.map(conn => 
            conn.id === id 
              ? { ...conn, status: 'error' } 
              : conn
          )
        );
      }
    }, 1000);
  }, [connections]);
  
  /**
   * Handle disconnecting from a server
   */
  const handleDisconnect = useCallback((id: string) => {
    setConnections(prev => 
      prev.map(conn => 
        conn.id === id 
          ? { ...conn, status: 'disconnected' } 
          : conn
      )
    );
  }, []);
  
  /**
   * Handle changing a server URL
   */
  const handleUrlChange = useCallback((id: string, url: string) => {
    setConnections(prev => 
      prev.map(conn => 
        conn.id === id 
          ? { ...conn, url, status: 'disconnected' } 
          : conn
      )
    );
  }, []);
  
  return {
    connections,
    handleConnect,
    handleDisconnect,
    handleUrlChange
  };
} 