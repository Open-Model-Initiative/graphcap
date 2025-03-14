// SPDX-License-Identifier: Apache-2.0
/**
 * useGeneratePerspectiveCaption Hook
 * 
 * This hook provides functionality to generate captions for images using perspectives.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerConnectionsContext } from '@/context';
import { SERVER_IDS } from '@/features/server-connections/constants';
import { CaptionOptions, CaptionResponse } from '../types';
import { API_ENDPOINTS, perspectivesQueryKeys } from '../services/constants';
import { getGraphCapServerUrl, ensureWorkspacePath, handleApiError } from '../services/utils';
import { createLogger } from '@/common/utils/logger';
import { ServerConnection } from '@/features/server-connections/types';

// Create a logger instance for this hook
const logger = createLogger('PerspectivesHooks');

/**
 * Hook to generate a perspective caption for an image
 * 
 * @returns A mutation for generating captions
 */
export function useGeneratePerspectiveCaption() {
  const queryClient = useQueryClient();
  const { connections } = useServerConnectionsContext();
  
  logger.info('Initializing useGeneratePerspectiveCaption hook');
  
  return useMutation<CaptionResponse, Error, {
    perspective: string;
    imagePath: string;
    providerId?: number;
    provider?: string;
    options?: CaptionOptions;
  }>({
    mutationFn: async ({ perspective, imagePath, providerId, provider, options }) => {
      const graphcapServerConnection = connections.find((conn: ServerConnection) => conn.id === SERVER_IDS.GRAPHCAP_SERVER);
      const isConnected = graphcapServerConnection?.status === 'connected';
      
      if (!isConnected) {
        throw new Error('Server connection not established');
      }
      
      const baseUrl = getGraphCapServerUrl(connections);
      if (!baseUrl) {
        throw new Error('No GraphCap server URL available');
      }
      
      // Normalize the image path to ensure it starts with /workspace
      const normalizedImagePath = ensureWorkspacePath(imagePath);
      
      logger.info(`Generating caption for image: ${normalizedImagePath} using perspective: ${perspective}`);
      
      const endpoint = API_ENDPOINTS.REST_GENERATE_CAPTION;
      const url = `${baseUrl}${endpoint}`;
      
      // Prepare the request body according to the server's expected format
      const requestBody = {
        perspective,
        image_path: normalizedImagePath,
        provider_id: providerId,
        max_tokens: options?.max_tokens ?? 4000,
        temperature: options?.temperature ?? 0.7,
        top_p: options?.top_p ?? 0.95,
        repetition_penalty: options?.repetition_penalty ?? 1.1,
        context: options?.context ?? [],
        global_context: options?.global_context ?? ''
      };
      
      logger.info(`Sending caption generation request to: ${url}`, {
        perspective,
        image_path: normalizedImagePath,
        provider_id: providerId,
        options: {
          max_tokens: requestBody.max_tokens,
          temperature: requestBody.temperature,
          top_p: requestBody.top_p,
          repetition_penalty: requestBody.repetition_penalty,
          context: requestBody.context,
          global_context: requestBody.global_context
        }
      });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        await handleApiError(response, 'Failed to generate caption');
      }
      
      const data = await response.json() as CaptionResponse;
      
      logger.info(`Successfully generated caption for perspective: ${perspective}`, {
        content: data.result || data.content
      });
      
      return data;
    },
    onSuccess: (result, variables) => {
      logger.debug('Caption generation successful, invalidating queries', { 
        imagePath: variables.imagePath,
        perspective: variables.perspective
      });
      
      // Invalidate the specific caption query
      queryClient.invalidateQueries({ 
        queryKey: perspectivesQueryKeys.caption(variables.imagePath, variables.perspective) 
      });
    },
    onError: (error) => {
      logger.error('Caption generation failed', error);
    }
  });
} 