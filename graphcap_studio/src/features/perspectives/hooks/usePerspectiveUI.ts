// SPDX-License-Identifier: Apache-2.0
/**
 * Perspective UI Hook
 * 
 * This hook provides UI-related functionality for the perspectives components.
 */

import { useState, useCallback } from 'react';
import { PerspectiveType } from '@/features/perspectives/types';

interface UsePerspectiveUIOptions {
  onGeneratePerspective?: (perspective: PerspectiveType, providerId?: number) => void;
  initialSelectedProviderId?: number;
  perspectiveKey?: PerspectiveType;
}

interface UsePerspectiveUIResult {
  // UI state
  selectedProviderId: number | undefined;
  
  // UI actions
  handleProviderChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleGenerate: () => void;
}

/**
 * Hook for managing UI state and actions for perspective components
 */
export function usePerspectiveUI({
  onGeneratePerspective,
  initialSelectedProviderId,
  perspectiveKey
}: UsePerspectiveUIOptions = {}): UsePerspectiveUIResult {
  // UI state
  const [selectedProviderId, setSelectedProviderId] = useState<number | undefined>(initialSelectedProviderId);
  
  // UI actions
  const handleProviderChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedProviderId(value ? Number(value) : undefined);
  }, []);
  
  const handleGenerate = useCallback(() => {
    if (onGeneratePerspective && perspectiveKey) {
      onGeneratePerspective(perspectiveKey, selectedProviderId);
    }
  }, [onGeneratePerspective, perspectiveKey, selectedProviderId]);
  
  return {
    // UI state
    selectedProviderId,
    
    // UI actions
    handleProviderChange,
    handleGenerate
  };
} 