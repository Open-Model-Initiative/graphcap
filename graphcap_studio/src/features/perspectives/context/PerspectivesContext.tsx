// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Context
 * 
 * This context manages UI state for the perspectives components.
 */

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
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
  
  // Log perspectives data when it changes
  useEffect(() => {
    if (perspectivesData) {
      console.log(`PerspectivesContext received data: ${perspectivesData.length} perspectives`);
      console.log(`Perspective names: ${perspectivesData.map(p => p.name).join(', ')}`);
      
      // Check if perspectives have schemas
      const withSchema = perspectivesData.filter(p => p.schema);
      console.log(`Perspectives with schema: ${withSchema.length}/${perspectivesData.length}`);
      if (withSchema.length === 0 && perspectivesData.length > 0) {
        console.warn('No perspectives have schemas! This will cause the UI to show "No perspectives available"');
        console.debug('First perspective data:', perspectivesData[0]);
      }
    } else {
      console.warn('No perspectives data received');
    }
  }, [perspectivesData]);
  
  // UI actions
  const handleSelectPerspective = useCallback((perspective: PerspectiveType) => {
    console.log(`Setting active perspective to: ${perspective}`);
    setActivePerspective(perspective);
  }, []);
  
  const handleProviderChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    console.log(`Setting selected provider ID to: ${value || 'undefined'}`);
    setSelectedProviderId(value ? Number(value) : undefined);
  }, []);
  
  const value = {
    // UI state
    activePerspective,
    selectedProviderId,
    isGeneratingAll,
    perspectives: perspectivesData || [],
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