// SPDX-License-Identifier: Apache-2.0
import { useState, useCallback, useEffect, useRef } from 'react';
import { ServerConnection } from './types';
import { SERVER_IDS, SERVER_NAMES, DEFAULT_URLS, CONNECTION_STATUS } from './constants';
import { checkServerHealthById } from './services/serverConnections';

// Local storage keys
const STORAGE_KEY = 'graphcap-server-connections';
const VERSION_KEY = 'graphcap-server-connections-version';

// Current version of the connections schema
const CURRENT_VERSION = 1;

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
    },
    {
      id: SERVER_IDS.DATA_SERVICE,
      name: SERVER_NAMES[SERVER_IDS.DATA_SERVICE],
      status: 'disconnected',
      url: import.meta.env.VITE_DATA_SERVICE_URL || DEFAULT_URLS[SERVER_IDS.DATA_SERVICE]
    }
  ];
};

/**
 * Merge existing connections with default connections
 * This ensures that any new servers are added while preserving user customizations
 */
const mergeWithDefaults = (existingConnections: ServerConnection[]): ServerConnection[] => {
  const defaultConnections = getDefaultConnections();
  const mergedConnections: ServerConnection[] = [];
  
  // Add all default connections
  for (const defaultConn of defaultConnections) {
    const existingConn = existingConnections.find(conn => conn.id === defaultConn.id);
    if (existingConn) {
      // Preserve existing connection's URL and status
      mergedConnections.push({
        ...defaultConn,
        url: existingConn.url,
        status: 'disconnected' // Reset status on load
      });
    } else {
      // Add new connection
      mergedConnections.push(defaultConn);
    }
  }
  
  return mergedConnections;
};

/**
 * Load connections from local storage
 */
const loadConnectionsFromStorage = (): ServerConnection[] => {
  try {
    // Check version
    const savedVersion = localStorage.getItem(VERSION_KEY);
    const currentVersion = CURRENT_VERSION.toString();
    
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
        // If version mismatch, merge with defaults
        if (savedVersion !== currentVersion) {
          const mergedConnections = mergeWithDefaults(parsed);
          // Update storage with merged connections and new version
          saveConnectionsToStorage(mergedConnections);
          localStorage.setItem(VERSION_KEY, currentVersion);
          return mergedConnections;
        }
        
        // Reset connection status to disconnected on load
        return parsed.map(conn => ({
          ...conn,
          status: 'disconnected'
        }));
      }
    }
  } catch (error) {
    console.error('Failed to load connections from local storage:', error);
  }
  
  // Return default connections if loading fails
  const defaultConnections = getDefaultConnections();
  saveConnectionsToStorage(defaultConnections);
  localStorage.setItem(VERSION_KEY, CURRENT_VERSION.toString());
  return defaultConnections;
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
  // Track when auto-connection is in progress
  const [isAutoConnecting, setIsAutoConnecting] = useState(false);
  
  // Use a ref to keep track of the latest connections without triggering re-renders
  const connectionsRef = useRef<ServerConnection[]>(connections);
  // Use a ref to track if auto-connect has already been performed
  const hasAutoConnectedRef = useRef(false);
  
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
  
  /**
   * Automatically connect to all servers with valid URLs that are not already connected
   */
  const autoConnect = useCallback(async () => {
    // Don't auto-connect if already in progress
    if (isAutoConnecting) {
      return;
    }
    
    // Get all server IDs with valid URLs that are not already connected
    const serversToConnect = connections
      .filter(conn => 
        conn.url && 
        conn.url.trim() !== '' && 
        conn.status !== CONNECTION_STATUS.CONNECTED && 
        conn.status !== CONNECTION_STATUS.TESTING
      )
      .map(conn => conn.id);
    
    if (serversToConnect.length === 0) {
      return;
    }
    
    setIsAutoConnecting(true);
    
    try {
      // Connect to each server in sequence
      for (const serverId of serversToConnect) {
        await handleConnect(serverId);
        // Add a small delay between connection attempts to avoid overwhelming the network
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } finally {
      setIsAutoConnecting(false);
      // Mark that auto-connect has been performed
      hasAutoConnectedRef.current = true;
    }
  }, [handleConnect, connections, isAutoConnecting]);
  
  // Auto-connect to servers when the component mounts, but only once
  useEffect(() => {
    // Only auto-connect if it hasn't been done yet
    if (!hasAutoConnectedRef.current) {
      // Use a small delay to ensure the UI is rendered before connection attempts start
      const timer = setTimeout(() => {
        autoConnect();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [autoConnect]);
  
  return {
    connections,
    handleConnect,
    handleDisconnect,
    handleUrlChange,
    autoConnect,
    isAutoConnecting
  };
} 