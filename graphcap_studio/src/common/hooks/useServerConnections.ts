// SPDX-License-Identifier: Apache-2.0
import { useState, useCallback, useEffect, useRef } from 'react';
import { ServerConnection } from '../types';
import { SERVER_IDS, SERVER_NAMES, DEFAULT_URLS } from '../constants';
import { checkServerHealthById } from '../../services/serverConnections';

// Local storage key for server connections
const STORAGE_KEY = 'graphcap-server-connections';

/**
 * Get default connections with environment variables or defaults
 */
const getDefaultConnections = (): ServerConnection[] => {
  return [
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
  ];
};

/**
 * Load connections from local storage
 */
const loadConnectionsFromStorage = (): ServerConnection[] => {
  try {
    const savedConnections = localStorage.getItem(STORAGE_KEY);
    if (savedConnections) {
      const parsed = JSON.parse(savedConnections) as ServerConnection[];
      
      // Validate the parsed data has the expected structure
      if (Array.isArray(parsed) && 
          parsed.every(conn => 
            typeof conn === 'object' && 
            'id' in conn && 
            'name' in conn && 
            'status' in conn && 
            'url' in conn
          )) {
        // Reset connection status to disconnected on load
        return parsed.map(conn => ({
          ...conn,
          status: 'disconnected' // Always start disconnected when loading from storage
        }));
      }
    }
  } catch (error) {
    console.error('Failed to load connections from local storage:', error);
  }
  
  // Return default connections if loading fails
  return getDefaultConnections();
};

/**
 * Save connections to local storage
 */
const saveConnectionsToStorage = (connections: ServerConnection[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));
  } catch (error) {
    console.error('Failed to save connections to local storage:', error);
  }
};

/**
 * Custom hook for managing server connections
 * 
 * This hook provides state and handlers for managing server connections
 * such as Media Server and GraphCap Server.
 */
export function useServerConnections() {
  // Initialize connections with values from local storage or defaults
  const [connections, setConnections] = useState<ServerConnection[]>(loadConnectionsFromStorage);
  
  // Use a ref to keep track of the latest connections without triggering re-renders
  const connectionsRef = useRef<ServerConnection[]>(connections);
  
  // Update the ref whenever connections change
  useEffect(() => {
    connectionsRef.current = connections;
  }, [connections]);
  
  // Save connections to local storage whenever they change
  useEffect(() => {
    saveConnectionsToStorage(connections);
  }, [connections]);
  
  /**
   * Handle connecting to a server
   */
  const handleConnect = useCallback(async (id: string) => {
    // Set status to testing
    setConnections(prev => 
      prev.map(conn => 
        conn.id === id 
          ? { ...conn, status: 'testing' } 
          : conn
      )
    );
    
    // Find the server connection by ID using the ref for latest data
    const serverConnection = connectionsRef.current.find(conn => conn.id === id);
    if (!serverConnection) {
      console.error(`Server connection with ID ${id} not found`);
      return;
    }
    
    // Store the URL to avoid closure issues
    const serverUrl = serverConnection.url;
    
    try {
      // Make actual API call to check server health
      const isHealthy = await checkServerHealthById(id, serverUrl);
      
      // Update connection status based on health check result
      setConnections(prev => 
        prev.map(conn => 
          conn.id === id 
            ? { ...conn, status: isHealthy ? 'connected' : 'error' } 
            : conn
        )
      );
    } catch (error) {
      console.error(`Error connecting to server ${id}:`, error);
      // Handle connection error
      setConnections(prev => 
        prev.map(conn => 
          conn.id === id 
            ? { ...conn, status: 'error' } 
            : conn
        )
      );
    }
  }, []); // No dependencies needed since we use connectionsRef
  
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