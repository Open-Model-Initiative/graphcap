// SPDX-License-Identifier: Apache-2.0
/**
 * useImagePerspectives Hook
 * 
 * This hook manages perspective data for a specific image.
 */

import { useState, useEffect, useCallback } from 'react';
import { Image } from '@/services/images';
import { useProviders } from '@/features/inference/services/providers';

import { 
  ImageCaptions, 
  PerspectiveType, 
  PerspectiveData, 
  ImagePerspectivesResult,
  CaptionOptions
} from '../types';
import { DEFAULTS } from '../services/constants';
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
  const [activePerspective, setActivePerspective] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatingPerspectives, setGeneratingPerspectives] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  console.debug('useImagePerspectives hook initialized', { 
    imagePath: image?.path
  });
  
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
  const availablePerspectives = perspectivesData || [];
  
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
        console.debug('Setting active perspective to graph_caption');
        setActivePerspective('graph_caption');
      } else {
        console.debug(`Setting active perspective to ${generatedPerspectives[0]}`);
        setActivePerspective(generatedPerspectives[0]);
      }
    }
  }, [captions, generatedPerspectives, activePerspective]);
  
  // Function to generate a perspective using the perspectives API
  const generatePerspective = useCallback(async (perspective: PerspectiveType, providerId?: number, options?: CaptionOptions) => {
    if (!image) {
      console.warn('Cannot generate perspective: No image provided');
      return;
    }
    
    console.log(`Generating perspective: ${perspective}`, { 
      imagePath: image.path,
      providerId,
      options
    });
    
    setError(null);
    // Track which perspective is being generated
    setGeneratingPerspectives(prev => [...prev, perspective]);
    setIsLoading(true);
    
    try {
      // Find the provider by ID if provided
      let providerName = DEFAULTS.PROVIDER; // Default provider
      if (providerId && providersData) {
        const provider = providersData.find(p => p.id === providerId);
        if (provider) {
          providerName = provider.name;
          console.debug(`Using provider: ${providerName} (ID: ${providerId})`);
        } else {
          console.warn(`Provider with ID ${providerId} not found, using default: ${providerName}`);
        }
      }
      
      // Generate the caption
      const result = await generateCaption.mutateAsync({
        imagePath: image.path,
        perspective,
        providerId,
        options: options || {
          temperature: 0.7,
          max_tokens: 4096
        }
      });
      
      // Log the caption result
      console.debug('Caption generation result received');
      console.debug(`Caption content for perspective ${perspective}:`, result.content);
      
      // Create a perspective data object
      const perspectiveData: PerspectiveData = {
        config_name: perspective,
        version: '1.0',
        model: 'api-generated',
        provider: providerName,
        content: result.content || {} // Ensure content is not undefined
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
              provider: providerName,
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
            provider: providerName,
            model: 'api-generated'
          }
        };
      });
      
      // Set the new perspective as active
      console.log(`Setting active perspective to ${perspective}`);
      setActivePerspective(perspective);
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
  }, [image, providersData, generateCaption, generatingPerspectives]);
  
  // Function to generate all perspectives
  const generateAllPerspectives = useCallback(async () => {
    if (!image || !perspectivesData) {
      console.warn('Cannot generate all perspectives: No image or perspectives data');
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
    } finally {
      setIsLoading(false);
      setGeneratingPerspectives([]);
    }
  }, [image, perspectivesData, generatePerspective]);
  
  // Log when the hook's return value changes
  useEffect(() => {
    console.debug('useImagePerspectives state updated', {
      isLoading,
      hasError: error !== null,
      hasCaptions: captions !== null,
      activePerspective,
      generatedPerspectiveCount: generatedPerspectives.length,
      availablePerspectiveCount: availablePerspectives.length,
      availableProviderCount: availableProviders.length,
      generatingPerspectives
    });
    
    // Log the current perspective content if available
    if (perspectiveData && perspectiveData.content) {
      console.debug('Current perspective content:', perspectiveData.content);
    }
  }, [
    isLoading, 
    error, 
    captions, 
    activePerspective, 
    generatedPerspectives, 
    availablePerspectives, 
    availableProviders,
    perspectiveData,
    generatingPerspectives
  ]);
  
  return {
    isLoading,
    error,
    captions,
    activePerspective,
    generatedPerspectives,
    generatingPerspectives,
    setActivePerspective,
    generatePerspective,
    generateAllPerspectives,
    availablePerspectives,
    availableProviders,
    perspectiveData
  };
} 