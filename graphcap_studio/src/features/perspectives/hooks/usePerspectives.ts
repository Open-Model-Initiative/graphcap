// SPDX-License-Identifier: Apache-2.0
/**
 * usePerspectives Hook
 * 
 * This hook fetches available perspectives from the server.
 */

import { useQuery } from '@tanstack/react-query';
import { useServerConnectionsContext } from '@/common/context';
import { SERVER_IDS } from '@/common/constants';
import { Perspective, PerspectiveListResponse } from '../types';
import { API_ENDPOINTS, CACHE_TIMES, perspectivesQueryKeys } from '../services/constants';
import { getGraphCapServerUrl, handleApiError } from '../services/utils';
import { createLogger } from '@/common/utils/logger';
import { ServerConnection } from '@/common/types';

// Create a logger instance for this hook
const logger = createLogger('PerspectivesHooks');

/**
 * Hook to fetch available perspectives from the server
 * 
 * @returns A query result with perspectives data
 */
export function usePerspectives() {
  const { connections } = useServerConnectionsContext();
  const graphcapServerConnection = connections.find((conn: ServerConnection) => conn.id === SERVER_IDS.GRAPHCAP_SERVER);
  const isConnected = graphcapServerConnection?.status === 'connected';
  
  logger.info('Initializing usePerspectives hook');
  
  return useQuery<Perspective[], Error>({
    queryKey: perspectivesQueryKeys.perspectives,
    queryFn: async () => {
      if (!isConnected) {
        logger.info('Server connection not established');
        return [];
      }
      
      const baseUrl = getGraphCapServerUrl(connections);
      if (!baseUrl) {
        logger.warn('No GraphCap server URL available');
        return [];
      }
      
      logger.info(`Server connection established: ${baseUrl}`);
      
      const endpoint = API_ENDPOINTS.LIST_PERSPECTIVES;
      const url = `${baseUrl}${endpoint}`;
      
      logger.info(`Fetching perspectives from server: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        await handleApiError(response, 'Failed to fetch perspectives');
      }
      
      const data = await response.json() as PerspectiveListResponse;
      
      logger.info(`Successfully fetched ${data.perspectives.length} perspectives`);
      
      return data.perspectives;
    },
    staleTime: CACHE_TIMES.PERSPECTIVES,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });
} 