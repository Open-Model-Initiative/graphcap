// SPDX-License-Identifier: Apache-2.0
/**
 * useImagePerspectives Hook
 * 
 * This hook manages perspective data for a specific image.
 */

import { useState, useEffect, useCallback } from 'react';
import { Image } from '@/services/images';
import { useProviders } from '@/features/inference/services/providers';
import { useServerConnectionsContext } from '@/context';
import { SERVER_IDS } from '@/features/server-connections/constants';

import { 
  ImageCaptions, 
  PerspectiveType, 
  PerspectiveData, 
  ImagePerspectivesResult,
  CaptionOptions
} from '../types';
import { usePerspectives } from './usePerspectives';
import { useGeneratePerspectiveCaption } from './useGeneratePerspectiveCaption';

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
  const [isLoading, setIsLoading] = useState(false);
  const [generatingPerspectives, setGeneratingPerspectives] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Get server connection status
  const { connections } = useServerConnectionsContext();
  const graphcapServerConnection = connections.find(conn => conn.id === SERVER_IDS.GRAPHCAP_SERVER);
  const isServerConnected = graphcapServerConnection?.status === 'connected';
  
  console.debug('useImagePerspectives hook initialized', { 
    imagePath: image?.path,
    isServerConnected
  });
  
  // Derived state
  const generatedPerspectives = captions ? Object.keys(captions.perspectives) : [];
  
  // Get available perspectives from the server
  const { data: perspectivesData } = usePerspectives();
  
  // Get available providers
  const { data: providersData } = useProviders();
  
  // Generate caption mutation
  const generateCaption = useGeneratePerspectiveCaption();
  
  // Derived state for available perspectives
  const availablePerspectives = perspectivesData || [];
  
  // Derived state for available providers
  const availableProviders = providersData?.map(provider => ({
    id: provider.id,
    name: provider.name
  })) || [];
  
  // Function to generate a perspective using the perspectives API
  const generatePerspective = useCallback(async (perspective: PerspectiveType, providerId?: number, options?: CaptionOptions) => {
    if (!image) {
      console.warn('Cannot generate perspective: No image provided');
      setError('No image provided');
      return;
    }

    if (!options) {
      console.warn('No options provided, using default options');
      setError('No options provided');
      return;
    }
    
    if (!isServerConnected) {
      console.warn('Cannot generate perspective: Server connection not established');
      setError('Server connection not established');
      return;
    }
    
    // Find the provider by ID if provided
    let provider_name: string | undefined;
    if (providerId && providersData) {
      const provider = providersData.find(p => p.id === providerId);
      if (provider) {
        provider_name = provider.name;
        console.debug(`Using provider: ${provider_name} (ID: ${providerId})`);
      } else {
        console.warn(`Provider with ID ${providerId} not found`);
        setError(`Provider with ID ${providerId} not found`);
        return;
      }
    } else {
      console.warn('No provider ID specified');
      setError('No provider ID specified');
      return;
    }
    
    console.log(`Generating perspective: ${perspective}`, { 
      imagePath: image.path,
      provider_name,
      options
    });
    
    setError(null);
    // Track which perspective is being generated
    setGeneratingPerspectives(prev => [...prev, perspective]);
    setIsLoading(true);
    
    try {
      // Generate the caption
      const result = await generateCaption.mutateAsync({
        imagePath: image.path,
        perspective,
        provider_name,
        options
      });
      
      // Log the caption result
      console.debug('Caption generation result received');
      console.debug(`Caption content for perspective ${perspective}:`, result.content || result.result);
      
      // Create a perspective data object
      const perspectiveData: PerspectiveData = {
        config_name: perspective,
        version: '1.0',
        model: 'api-generated',
        provider: provider_name,
        content: result.content || result.result || {},
        options: options
      };
      
      // Update the captions with the new perspective
      setCaptions(prevCaptions => {
        if (!prevCaptions) {
          // Create a new captions object if none exists
          console.debug('Creating new captions object');
          return {
            image,
            perspectives: {
              [perspective]: perspectiveData
            },
            metadata: {
              captioned_at: new Date().toISOString(),
              provider: provider_name,
              model: 'api-generated'
            }
          };
        }
        
        // Update existing captions
        console.debug('Updating existing captions');
        return {
          ...prevCaptions,
          perspectives: {
            ...prevCaptions.perspectives,
            [perspective]: perspectiveData
          },
          metadata: {
            ...prevCaptions.metadata,
            captioned_at: new Date().toISOString(),
            provider: provider_name,
            model: 'api-generated'
          }
        };
      });
    } catch (err) {
      console.error('Error generating perspective', err);
      setError(err instanceof Error ? err.message : 'Failed to generate perspective');
    } finally {
      // Remove the perspective from the generating list
      setGeneratingPerspectives(prev => prev.filter(p => p !== perspective));
      // Only set isLoading to false if no perspectives are being generated
      setIsLoading(prev => {
        const updatedGenerating = generatingPerspectives.filter(p => p !== perspective);
        return updatedGenerating.length > 0;
      });
    }
  }, [image, providersData, generateCaption, generatingPerspectives, isServerConnected]);
  
  // Function to generate all perspectives
  const generateAllPerspectives = useCallback(async () => {
    if (!image || !perspectivesData) {
      console.warn('Cannot generate all perspectives: No image or perspectives data');
      setError('No image or perspectives data available');
      return;
    }
    
    if (!isServerConnected) {
      console.warn('Cannot generate all perspectives: Server connection not established');
      setError('Server connection not established');
      return;
    }
    
    console.log('Generating all perspectives', { 
      imagePath: image.path,
      perspectiveCount: perspectivesData.length
    });
    
    setIsLoading(true);
    // Track all perspectives as generating
    setGeneratingPerspectives(perspectivesData.map(p => p.name));
    
    try {
      // Generate each perspective one by one
      for (const perspective of perspectivesData) {
        console.debug(`Generating perspective: ${perspective.name}`);
        await generatePerspective(perspective.name);
      }
      
      console.log('All perspectives generated successfully');
    } catch (err) {
      console.error('Error generating all perspectives', err);
      setError(err instanceof Error ? err.message : 'Failed to generate all perspectives');
    } finally {
      setIsLoading(false);
      setGeneratingPerspectives([]);
    }
  }, [image, perspectivesData, generatePerspective, isServerConnected]);
  
  // Reset error when server connection changes
  useEffect(() => {
    if (isServerConnected && error === 'Server connection not established') {
      setError(null);
    }
  }, [isServerConnected, error]);
  
  // Log when the hook's return value changes
  useEffect(() => {
    console.debug('useImagePerspectives state updated', {
      isLoading,
      hasError: error !== null,
      hasCaptions: captions !== null,
      generatedPerspectiveCount: generatedPerspectives.length,
      availablePerspectiveCount: availablePerspectives.length,
      availableProviderCount: availableProviders.length,
      generatingPerspectives,
      isServerConnected
    });
    
    if (captions?.perspectives) {
      console.debug('Current perspectives:', Object.keys(captions.perspectives));
    }
  }, [
    isLoading, 
    error, 
    captions, 
    generatedPerspectives, 
    availablePerspectives, 
    availableProviders,
    generatingPerspectives,
    isServerConnected
  ]);
  
  return {
    isLoading,
    error,
    captions,
    generatedPerspectives,
    generatingPerspectives,
    generatePerspective,
    generateAllPerspectives,
    availablePerspectives,
    availableProviders
  };
} 