// SPDX-License-Identifier: Apache-2.0
/**
 * usePerspectives Hook
 * 
 * This hook fetches available perspectives from the server.
 */

import { useQuery } from '@tanstack/react-query';
import { useServerConnectionsContext } from '@/context';
import { SERVER_IDS } from '@/features/server-connections/constants';
import { Perspective, PerspectiveListResponse } from '../types';
import { API_ENDPOINTS, CACHE_TIMES, perspectivesQueryKeys } from '../services/constants';
import { getGraphCapServerUrl, handleApiError } from '../services/utils';

import { ServerConnection } from '@/features/server-connections/types';

/**
 * Hook to fetch available perspectives from the server
 * 
 * @returns A query result with perspectives data
 */
export function usePerspectives() {
  const { connections } = useServerConnectionsContext();
  const graphcapServerConnection = connections.find((conn: ServerConnection) => conn.id === SERVER_IDS.GRAPHCAP_SERVER);
  const isConnected = graphcapServerConnection?.status === 'connected';
  
  console.log('Initializing usePerspectives hook');
  
  return useQuery<Perspective[], Error>({
    queryKey: perspectivesQueryKeys.perspectives,
    queryFn: async () => {
      if (!isConnected) {
        console.log('Server connection not established');
        return [];
      }
      
      const baseUrl = getGraphCapServerUrl(connections);
      if (!baseUrl) {
        console.warn('No GraphCap server URL available');
        return [];
      }
      
      console.log(`Server connection established: ${baseUrl}`);
      
      const endpoint = API_ENDPOINTS.LIST_PERSPECTIVES;
      const url = `${baseUrl}${endpoint}`;
      
      console.log(`Fetching perspectives from server: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        await handleApiError(response, 'Failed to fetch perspectives');
      }
      
      const data = await response.json() as PerspectiveListResponse;
      
      console.log(`Successfully fetched ${data.perspectives.length} perspectives`);
      
      return data.perspectives;
    },
    staleTime: CACHE_TIMES.PERSPECTIVES,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });
} 