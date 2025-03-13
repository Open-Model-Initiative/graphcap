// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Service Hooks
 * 
 * This module provides React Query hooks for interacting with the perspectives service.
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerConnectionsContext } from '../../common/context/ServerConnectionsContext';
import { SERVER_IDS } from '../../common/constants';
import { 
  CaptionOptions, 
  CaptionResponse, 
  PerspectiveListResponse,
  ImageCaptions,
  PerspectiveType,
  PerspectiveData,
  ImagePerspectivesResult
} from './types';
import { API_ENDPOINTS, CACHE_TIMES, DEFAULTS, perspectivesQueryKeys } from './constants';
import { ensureWorkspacePath, getGraphCapServerUrl, handleApiError, isUrl } from './utils';
import { Image } from '@/services/images';
import { useProviders } from '@/services/providers';
import { perspectivesApi } from './api';

/**
 * Hook to get all available perspectives
 */
export function usePerspectives() {
  const { connections } = useServerConnectionsContext();
  const graphcapServerConnection = connections.find(conn => conn.id === SERVER_IDS.GRAPHCAP_SERVER);
  const isConnected = graphcapServerConnection?.status === 'connected';
  
  return useQuery({
    queryKey: perspectivesQueryKeys.perspectives,
    queryFn: async () => {
      const baseUrl = getGraphCapServerUrl(connections);
      const response = await fetch(`${baseUrl}${API_ENDPOINTS.LIST_PERSPECTIVES}`);
      
      if (!response.ok) {
        await handleApiError(response, 'Failed to fetch perspectives');
      }
      
      return response.json() as Promise<PerspectiveListResponse>;
    },
    enabled: isConnected,
    staleTime: CACHE_TIMES.PERSPECTIVES_STALE_TIME,
  });
}

/**
 * Hook to generate a caption for an image using a perspective
 */
export function useGeneratePerspectiveCaption() {
  const queryClient = useQueryClient();
  const { connections } = useServerConnectionsContext();
  
  return useMutation({
    mutationFn: async ({ 
      imagePath, 
      perspective, 
      provider = DEFAULTS.PROVIDER,
      options = {}
    }: { 
      imagePath: string; 
      perspective: string; 
      provider?: string;
      options?: CaptionOptions;
    }) => {
      // Get the base URL for the GraphCap server
      const baseUrl = getGraphCapServerUrl(connections);
      
      // Prepare the request for the REST API
      const request = {
        perspective,
        image_path: imagePath,
        provider,
        // Add optional parameters if provided
        ...(options.max_tokens && { max_tokens: options.max_tokens }),
        ...(options.temperature && { temperature: options.temperature }),
        ...(options.top_p && { top_p: options.top_p }),
        ...(options.repetition_penalty && { repetition_penalty: options.repetition_penalty }),
        ...(options.global_context && { global_context: options.global_context }),
        ...(options.context && { context: options.context }),
      };
      
      // Ensure the image path has the correct workspace prefix
      const normalizedImagePath = ensureWorkspacePath(request.image_path);
      console.log('Generating caption for image path:', normalizedImagePath);
      
      // Update the request with the normalized path
      const normalizedRequest = {
        ...request,
        image_path: normalizedImagePath,
      };
      
      // Make the API request directly instead of using perspectivesApi
      const response = await fetch(`${baseUrl}${API_ENDPOINTS.REST_GENERATE_CAPTION}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(normalizedRequest),
      });
      
      if (!response.ok) {
        await handleApiError(response, 'Failed to generate caption');
      }
      
      const data = await response.json();
      return data as CaptionResponse;
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific caption query
      queryClient.invalidateQueries({ 
        queryKey: perspectivesQueryKeys.caption(variables.imagePath, variables.perspective) 
      });
    },
  });
}

/**
 * Hook for fetching and managing perspective data for an image
 * 
 * This hook combines the functionality of the perspectives API and captions
 * to provide a unified interface for working with image perspectives.
 * 
 * @param image - The image to get perspectives for
 * @returns An object with perspective data and functions to manage it
 */
export function useImagePerspectives(image: Image | null): ImagePerspectivesResult {
  const [captions, setCaptions] = useState<ImageCaptions | null>(null);
  const [activePerspective, setActivePerspective] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { connections } = useServerConnectionsContext();
  
  // Derived state
  const generatedPerspectives = captions ? Object.keys(captions.perspectives) : [];
  const perspectiveData = activePerspective && captions?.perspectives[activePerspective] 
    ? captions.perspectives[activePerspective] 
    : null;
  
  // Get available perspectives from the server
  const { data: perspectivesData } = usePerspectives();
  
  // Get available providers
  const { data: providersData } = useProviders();
  
  // Generate caption mutation
  const generateCaption = useGeneratePerspectiveCaption();
  
  // Derived state for available perspectives
  const availablePerspectives = perspectivesData?.perspectives || [];
  
  // Derived state for available providers
  const availableProviders = providersData?.map(provider => ({
    id: provider.id,
    name: provider.name
  })) || [];
  
  // Set the active perspective when captions are loaded
  useEffect(() => {
    if (captions && generatedPerspectives.length > 0 && !activePerspective) {
      // Prefer graph_caption if available, otherwise use the first available perspective
      if (generatedPerspectives.includes('graph_caption')) {
        setActivePerspective('graph_caption');
      } else {
        setActivePerspective(generatedPerspectives[0]);
      }
    }
  }, [captions, generatedPerspectives, activePerspective]);
  
  // Function to generate a perspective using the perspectives API
  const generatePerspective = useCallback(async (perspective: PerspectiveType, providerId?: number) => {
    if (!image) return;
    
    console.log(`Generating perspective: ${perspective}`);
    setError(null);
    
    try {
      // Find the provider by ID if provided
      let providerName = DEFAULTS.PROVIDER; // Default provider
      if (providerId && providersData) {
        const provider = providersData.find(p => p.id === providerId);
        if (provider) {
          providerName = provider.name;
        }
      }
      console.log("Generating caption for perspective:", perspective, "with provider:", providerName);
      
      // Generate the caption
      const result = await generateCaption.mutateAsync({
        imagePath: image.path,
        perspective,
        provider: providerName,
        options: {
          temperature: 0.7,
          max_tokens: 4096
        }
      });
      
      // Create a perspective data object
      const perspectiveData: PerspectiveData = {
        config_name: perspective,
        version: '1.0',
        model: 'api-generated',
        provider: providerName,
        content: result.result
      };
      
      // Update the captions with the new perspective
      setCaptions(prevCaptions => {
        if (!prevCaptions) {
          // Create a new captions object if none exists
          return {
            image,
            perspectives: {
              [perspective]: perspectiveData
            },
            metadata: {
              captioned_at: new Date().toISOString(),
              provider: providerName,
              model: 'api-generated'
            }
          };
        }
        
        // Update existing captions
        return {
          ...prevCaptions,
          perspectives: {
            ...prevCaptions.perspectives,
            [perspective]: perspectiveData
          },
          metadata: {
            ...prevCaptions.metadata,
            captioned_at: new Date().toISOString(),
            provider: providerName,
            model: 'api-generated'
          }
        };
      });
      
      // Set the new perspective as active
      setActivePerspective(perspective);
    } catch (err) {
      console.error('Error generating perspective:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate perspective');
    }
  }, [image, providersData, generateCaption]);
  
  // Function to generate all perspectives
  const generateAllPerspectives = useCallback(async () => {
    if (!image || !perspectivesData) return;
    
    console.log('Generating all perspectives');
    
    // Generate each perspective one by one
    for (const perspective of perspectivesData.perspectives) {
      await generatePerspective(perspective.name);
    }
  }, [image, perspectivesData, generatePerspective]);
  
  return {
    isLoading,
    error,
    captions,
    activePerspective,
    generatedPerspectives,
    setActivePerspective,
    generatePerspective,
    generateAllPerspectives,
    availablePerspectives,
    availableProviders,
    perspectiveData
  };
} 