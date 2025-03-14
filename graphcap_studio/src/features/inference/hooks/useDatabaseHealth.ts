// SPDX-License-Identifier: Apache-2.0
import { useCallback } from 'react';
import { useServerConnectionsContext } from '@/context/ServerConnectionsContext';
import { SERVER_IDS } from '@/features/server-connections';

/**
 * Custom hook for checking database health
 */
export function useDatabaseHealth() {
  const { connections } = useServerConnectionsContext();
  const dataServiceConnection = connections.find(conn => conn.id === SERVER_IDS.DATA_SERVICE);
  
  const checkDatabaseConnection = useCallback(async () => {
    if (!dataServiceConnection?.url) {
      return { error: 'Data service not connected' };
    }
    
    try {
      const response = await fetch(`${dataServiceConnection.url}/health/db`);
      if (response.ok) {
        return { success: true, message: 'Database connection is healthy' };
      } else {
        const data = await response.json();
        return { error: data.error || 'Unknown database error' };
      }
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to check database health' 
      };
    }
  }, [dataServiceConnection?.url]);
  
  return {
    checkDatabaseConnection,
    isConnected: dataServiceConnection?.status === 'connected'
  };
} 