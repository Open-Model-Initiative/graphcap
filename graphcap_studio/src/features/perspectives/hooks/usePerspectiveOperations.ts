// SPDX-License-Identifier: Apache-2.0
/**
 * Perspective Operations Hook
 * 
 * This hook provides operations for generating and managing perspectives.
 */

import { useCallback } from 'react';
import { Image } from '@/services/images';
import { useImagePerspectives } from '@/features/perspectives/services';
import { usePerspectivesContext } from '@/features/perspectives/context/PerspectivesContext';
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
    activePerspective,
    setActivePerspective,
    selectedProviderId,
    setIsGeneratingAll
  } = usePerspectivesContext();

  const {
    isLoading,
    error,
    captions,
    generatedPerspectives,
    availablePerspectives,
    availableProviders,
    generatePerspective: generatePerspectiveService,
    generateAllPerspectives: generateAllPerspectivesService
  } = useImagePerspectives(image);

  // Generate a specific perspective
  const generatePerspective = useCallback((perspectiveKey: string, providerId?: number) => {
    generatePerspectiveService(perspectiveKey, providerId);
    
    // Set as active perspective when generated
    if (!activePerspective) {
      setActivePerspective(perspectiveKey as PerspectiveType);
    }
  }, [activePerspective, generatePerspectiveService, setActivePerspective]);

  // Generate all perspectives
  const generateAllPerspectives = useCallback(() => {
    setIsGeneratingAll(true);
    generateAllPerspectivesService();
    
    // Set first perspective as active when all are generated
    if (availablePerspectives.length > 0 && !activePerspective) {
      setActivePerspective(availablePerspectives[0].name as PerspectiveType);
    }
    
    // Reset generating all flag when done
    if (!isLoading) {
      setIsGeneratingAll(false);
    }
  }, [
    availablePerspectives, 
    activePerspective, 
    generateAllPerspectivesService, 
    isLoading, 
    setActivePerspective, 
    setIsGeneratingAll
  ]);

  /**
   * Format a date string from the format YYYYMMDD_HHMMSS to a more readable format
   */
  const formatDate = useCallback((dateString: string): string => {
    // Check if the date is in ISO format
    if (dateString.includes('T') && dateString.includes('Z')) {
      return new Date(dateString).toLocaleString();
    }
    
    // Check if the date is in the expected format
    const regex = /^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})$/;
    const match = regex.exec(dateString);
    if (!match) return dateString;
    
    const [, year, month, day, hour, minute, second] = match;
    
    // Create a date object
    const date = new Date(
      parseInt(year),
      parseInt(month) - 1, // Month is 0-indexed in JavaScript
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second)
    );
    
    // Format the date
    return date.toLocaleString();
  }, []);

  return {
    // Data
    isLoading,
    error,
    captions,
    generatedPerspectives,
    availablePerspectives,
    availableProviders,
    
    // Operations
    generatePerspective,
    generateAllPerspectives,
    formatDate
  };
} 