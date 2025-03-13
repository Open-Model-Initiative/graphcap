// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Context
 * 
 * This context manages UI state for the perspectives components.
 */

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { PerspectiveType, usePerspectives, Perspective } from '@/features/perspectives/services';

interface PerspectivesContextType {
  // UI state
  activePerspective: PerspectiveType | null;
  selectedProviderId: number | undefined;
  isGeneratingAll: boolean;
  perspectives: Perspective[];
  isLoading: boolean;
  error: Error | null;
  
  // UI actions
  setActivePerspective: (perspective: PerspectiveType | null) => void;
  setSelectedProviderId: (providerId: number | undefined) => void;
  setIsGeneratingAll: (isGenerating: boolean) => void;
  handleSelectPerspective: (perspective: PerspectiveType) => void;
  handleProviderChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const PerspectivesContext = createContext<PerspectivesContextType | undefined>(undefined);

interface PerspectivesProviderProps {
  children: ReactNode;
  initialActivePerspective?: PerspectiveType | null;
  initialSelectedProviderId?: number | undefined;
}

export function PerspectivesProvider({ 
  children, 
  initialActivePerspective = null,
  initialSelectedProviderId = undefined
}: PerspectivesProviderProps) {
  // UI state
  const [activePerspective, setActivePerspective] = useState<PerspectiveType | null>(initialActivePerspective);
  const [selectedProviderId, setSelectedProviderId] = useState<number | undefined>(initialSelectedProviderId);
  const [isGeneratingAll, setIsGeneratingAll] = useState<boolean>(false);
  
  // Fetch perspectives using React Query
  const { data: perspectivesData, isLoading, error } = usePerspectives();
  
  // UI actions
  const handleSelectPerspective = useCallback((perspective: PerspectiveType) => {
    setActivePerspective(perspective);
  }, []);
  
  const handleProviderChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedProviderId(value ? Number(value) : undefined);
  }, []);
  
  const value = {
    // UI state
    activePerspective,
    selectedProviderId,
    isGeneratingAll,
    perspectives: perspectivesData?.perspectives || [],
    isLoading,
    error,
    
    // UI actions
    setActivePerspective,
    setSelectedProviderId,
    setIsGeneratingAll,
    handleSelectPerspective,
    handleProviderChange,
  };
  
  return (
    <PerspectivesContext.Provider value={value}>
      {children}
    </PerspectivesContext.Provider>
  );
}

export function usePerspectivesContext() {
  const context = useContext(PerspectivesContext);
  if (context === undefined) {
    throw new Error('usePerspectivesContext must be used within a PerspectivesProvider');
  }
  return context;
} 