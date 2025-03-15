// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Data Context
 * 
 * This context provides access to perspectives data from the server.
 * It separates data concerns from UI state management.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { 
  Perspective, 
  PerspectiveSchema,
  CaptionOptions,
  CaptionResponse 
} from '../types';
import { usePerspectives } from '../hooks/usePerspectives';
import { useGeneratePerspectiveCaption } from '../hooks/useGeneratePerspectiveCaption';
import { useServerConnectionsContext } from '@/context';
import { SERVER_IDS } from '@/features/server-connections/constants';

// Define the context type with explicit typing
interface PerspectivesDataContextType {
  // Data state
  perspectives: Perspective[];
  schemas: Record<string, PerspectiveSchema>;
  isLoading: boolean;
  isServerConnected: boolean;
  error: Error | null;
  
  // Data operations
  generateCaption: (perspective: string, imagePath: string, providerId?: number, options?: CaptionOptions) => Promise<CaptionResponse>;
  refetchPerspectives: () => Promise<Perspective[]>;
}

// Create context with undefined default value
const PerspectivesDataContext = createContext<PerspectivesDataContextType | undefined>(undefined);

/**
 * Error type for when the PerspectivesDataContext is used outside of a provider
 */
export class PerspectivesDataProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PerspectivesDataProviderError';
  }
}

interface PerspectivesDataProviderProps {
  children: ReactNode;
}

/**
 * Provider component for perspectives data
 * Handles data fetching and provides data operations
 */
export function PerspectivesDataProvider({ children }: PerspectivesDataProviderProps) {
  // Get server connection status
  const { connections } = useServerConnectionsContext();
  const graphcapServerConnection = connections.find(conn => conn.id === SERVER_IDS.GRAPHCAP_SERVER);
  const isServerConnected = graphcapServerConnection?.status === 'connected';
  
  // Use the existing React Query hooks for data fetching
  const { 
    data: perspectivesData, 
    isLoading, 
    error, 
    refetch 
  } = usePerspectives();
  
  const generateCaptionMutation = useGeneratePerspectiveCaption();
  
  // Convert perspectives array to schemas record for easier access
  const schemas = React.useMemo(() => {
    if (!perspectivesData) return {};
    
    return perspectivesData.reduce((acc, perspective) => {
      if (perspective.schema) {
        acc[perspective.name] = perspective.schema;
      }
      return acc;
    }, {} as Record<string, PerspectiveSchema>);
  }, [perspectivesData]);
  
  // Generate caption function that wraps the mutation
  const generateCaption = async (
    perspective: string, 
    imagePath: string, 
    providerId?: number, 
    options?: CaptionOptions
  ): Promise<CaptionResponse> => {
    if (!isServerConnected) {
      throw new Error('Cannot generate caption: Server connection not established');
    }
    
    try {
      return await generateCaptionMutation.mutateAsync({
        perspective,
        imagePath,
        providerId,
        options
      });
    } catch (error) {
      console.error(`Error generating caption for perspective "${perspective}":`, error);
      throw error;
    }
  };
  
  // Refetch perspectives and return the data
  const refetchPerspectives = async (): Promise<Perspective[]> => {
    if (!isServerConnected) {
      throw new Error('Cannot refetch perspectives: Server connection not established');
    }
    
    try {
      const result = await refetch();
      return result.data || [];
    } catch (error) {
      console.error('Error refetching perspectives:', error);
      throw error;
    }
  };
  
  // Create context value object
  const value: PerspectivesDataContextType = {
    perspectives: perspectivesData || [],
    schemas,
    isLoading,
    isServerConnected,
    error,
    generateCaption,
    refetchPerspectives
  };
  
  return (
    <PerspectivesDataContext.Provider value={value}>
      {children}
    </PerspectivesDataContext.Provider>
  );
}

/**
 * Hook to access perspectives data context
 * Must be used within a PerspectivesDataProvider
 */
export function usePerspectivesData() {
  const context = useContext(PerspectivesDataContext);
  
  if (context === undefined) {
    console.error('usePerspectivesData was called outside of a PerspectivesDataProvider');
    throw new PerspectivesDataProviderError(
      'usePerspectivesData must be used within a PerspectivesDataProvider'
    );
  }
  
  return context;
} 