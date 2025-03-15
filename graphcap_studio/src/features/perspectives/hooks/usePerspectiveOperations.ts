// SPDX-License-Identifier: Apache-2.0
/**
 * Perspective Operations Hook
 * 
 * This hook provides operations for generating and managing perspectives.
 */

import { useCallback } from 'react';
import { Image } from '@/services/images';
import { useImagePerspectives } from '@/features/perspectives/services';
import { usePerspectivesData } from '@/features/perspectives/context';
import { PerspectiveType } from '@/features/perspectives/types';

interface UsePerspectiveOperationsResult {
  // Data
  isLoading: boolean;
  error: string | null;
  captions: any | null;
  generatedPerspectives: string[];
  availablePerspectives: Array<{ name: string; display_name: string; description: string }>;
  availableProviders: Array<{ id: number; name: string }>;
  
  // Operations
  generatePerspective: (perspectiveKey: string, providerId?: number) => void;
  generateAllPerspectives: () => void;
  formatDate: (dateString: string) => string;
}

/**
 * Hook for managing perspective operations
 */
export function usePerspectiveOperations(image: Image): UsePerspectiveOperationsResult {
  const {
    selectedProviderId,
    setIsGeneratingAll,
    availableProviders: contextProviders,
    perspectives: contextPerspectives,
    generatePerspective: contextGeneratePerspective
  } = usePerspectivesData();

  const {
    isLoading,
    error,
    captions,
    generatedPerspectives,
    availablePerspectives,
    availableProviders: imageProviders,
    generatePerspective: generatePerspectiveService,
    generateAllPerspectives: generateAllPerspectivesService
  } = useImagePerspectives(image);

  // Generate a specific perspective
  // Use either the service method or the context method based on what's available
  const generatePerspective = useCallback((perspectiveKey: string, providerId?: number) => {
    if (image && contextGeneratePerspective) {
      // Use the context method if available
      contextGeneratePerspective(perspectiveKey, image.path, providerId || selectedProviderId);
    } else {
      // Fall back to the service method
      generatePerspectiveService(perspectiveKey, providerId);
    }
  }, [contextGeneratePerspective, generatePerspectiveService, image, selectedProviderId]);

  // Generate all perspectives
  const generateAllPerspectives = useCallback(() => {
    setIsGeneratingAll(true);
    generateAllPerspectivesService();
    
    // Reset generating all flag when done
    if (!isLoading) {
      setIsGeneratingAll(false);
    }
  }, [
    generateAllPerspectivesService, 
    isLoading,
    setIsGeneratingAll
  ]);

  // Format date helper
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleString();
  }, []);

  // Use context providers if available, otherwise use the service providers
  const mergedProviders = contextProviders?.length > 0 ? contextProviders : imageProviders;

  return {
    // Data
    isLoading,
    error,
    captions,
    generatedPerspectives,
    availablePerspectives,
    availableProviders: mergedProviders,
    
    // Operations
    generatePerspective,
    generateAllPerspectives,
    formatDate
  };
} 