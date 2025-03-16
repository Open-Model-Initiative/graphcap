// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Data Context
 * 
 * This consolidated context provides all data-related functionality:
 * 1. Provider management (selection, fetching)
 * 2. Perspectives data (schemas, metadata)
 * 3. Caption generation and storage
 * 4. Server connection status
 */

import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect, useMemo } from 'react';
import { 
  Perspective, 
  PerspectiveSchema,
  CaptionOptions,
  Provider,
  PerspectiveData
} from '../types';
import { Image } from '@/services/images';
import { usePerspectives } from '../hooks/usePerspectives';
import { useGeneratePerspectiveCaption } from '../hooks/useGeneratePerspectiveCaption';
import { useServerConnectionsContext } from '@/context';
import { SERVER_IDS } from '@/features/server-connections/constants';
import { useProviders } from '../../inference/services/providers';
import {
  saveCaptionToStorage,
  getAllCaptionsForImage
} from '../utils/localStorage';

// Local storage key for selected perspective provider
const SELECTED_PERSPECTIVE_PROVIDER_KEY = 'graphcap-selected-perspective-provider';

/**
 * Save provider ID to localStorage
 * @param providerId - The provider ID to save
 */
const saveProviderIdToStorage = (providerId: number | undefined) => {
  try {
    if (providerId !== undefined) {
      localStorage.setItem(SELECTED_PERSPECTIVE_PROVIDER_KEY, providerId.toString());
    } else {
      localStorage.removeItem(SELECTED_PERSPECTIVE_PROVIDER_KEY);
    }
  } catch (error) {
    console.error('Error saving perspective provider ID to localStorage:', error);
  }
};

/**
 * Load provider ID from localStorage
 * @returns The saved provider ID or undefined
 */
const loadProviderIdFromStorage = (): number | undefined => {
  try {
    const savedProviderId = localStorage.getItem(SELECTED_PERSPECTIVE_PROVIDER_KEY);
    return savedProviderId ? parseInt(savedProviderId, 10) : undefined;
  } catch (error) {
    console.error('Error loading perspective provider ID from localStorage:', error);
    return undefined;
  }
};

// Define the context type with explicit typing
interface PerspectivesDataContextType {
  // Provider state
  selectedProviderId: number | undefined;
  availableProviders: Provider[];
  isGeneratingAll: boolean;
  
  // Provider actions
  setSelectedProviderId: (providerId: number | undefined) => void;
  setAvailableProviders: (providers: Provider[]) => void;
  setIsGeneratingAll: (isGenerating: boolean) => void;
  handleProviderChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  
  // Data fetching
  fetchProviders: () => Promise<void>;
  isLoadingProviders: boolean;
  providerError: unknown;
  
  // Perspectives data
  perspectives: Perspective[];
  schemas: Record<string, PerspectiveSchema>;
  isLoadingPerspectives: boolean;
  perspectivesError: Error | null;
  refetchPerspectives: () => Promise<Perspective[]>;
  
  // Captions data
  captions: Record<string, any>;
  generatedPerspectives: string[];
  isGenerating: boolean;
  isServerConnected: boolean;
  
  // Caption options
  captionOptions: CaptionOptions;
  setCaptionOptions: (options: CaptionOptions) => void;
  
  // Current image
  currentImage: Image | null;
  setCurrentImage: (image: Image | null) => void;
  
  // Generation operations
  generatePerspective: (
    schemaName: string, 
    imagePath: string,
    providerId?: number, 
    options?: CaptionOptions
  ) => Promise<any>;
  
  // Status helpers
  isPerspectiveGenerated: (schemaName: string) => boolean;
  isPerspectiveGenerating: (schemaName: string) => boolean;
  
  // Data helpers
  getPerspectiveData: (schemaName: string) => Record<string, unknown> | null;
}

/**
 * Create the context with an undefined initial value
 * We'll check inside the hook that it's used within a provider
 */
const PerspectivesDataContext = createContext<PerspectivesDataContextType | undefined>(undefined);

// Custom error class for provider errors
export class PerspectivesDataProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PerspectivesDataProviderError';
  }
}

interface PerspectivesDataProviderProps {
  readonly children: ReactNode;
  readonly image: Image | null;
  readonly initialProviderId?: number;
  readonly initialProviders?: Provider[];
  readonly initialCaptionOptions?: CaptionOptions;
}

/**
 * Consolidated provider component for perspectives data
 * Combines functionality from multiple data-related contexts
 */
export function PerspectivesDataProvider({ 
  children,
  image: initialImage,
  initialProviderId,
  initialProviders = [],
  initialCaptionOptions = {}
}: PerspectivesDataProviderProps) {
  // Server connection state
  const { connections } = useServerConnectionsContext();
  const isServerConnected = !!connections.find(
    conn => conn.id === SERVER_IDS.GRAPHCAP_SERVER && conn.status === 'connected'
  );
  
  // Provider state - initialize from props or localStorage
  const [selectedProviderId, setSelectedProviderId] = useState<number | undefined>(() => {
    return initialProviderId ?? loadProviderIdFromStorage();
  });
  const [availableProviders, setAvailableProviders] = useState<Provider[]>(initialProviders);
  const [isGeneratingAll, setIsGeneratingAll] = useState<boolean>(false);
  
  // Caption options state
  const [captionOptions, setCaptionOptions] = useState<CaptionOptions>(initialCaptionOptions);
  
  // Save selectedProviderId to localStorage when it changes
  useEffect(() => {
    saveProviderIdToStorage(selectedProviderId);
  }, [selectedProviderId]);
  
  // Image state
  const [currentImage, setCurrentImage] = useState<Image | null>(initialImage);
  
  // Caption state
  const [captions, setCaptions] = useState<Record<string, any>>({});
  const [generatingPerspectives, setGeneratingPerspectives] = useState<string[]>([]);
  
  // Caption generation mutation
  const generateCaptionMutation = useGeneratePerspectiveCaption();
  
  // Use the providers query from inference services
  const { 
    data: providersData,
    isLoading: isLoadingProviders,
    error: providerError,
    refetch: refetchProviders
  } = useProviders();
  
  // Use the perspectives query
  const { 
    data: perspectivesData, 
    isLoading: isLoadingPerspectives, 
    error: perspectivesError, 
    refetch: refetchPerspectivesQuery 
  } = usePerspectives();
  
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
  
  // Update providers when data is fetched
  useEffect(() => {
    if (providersData) {
      setAvailableProviders(providersData);
    }
  }, [providersData]);
  
  // Update current image when initialImage changes
  useEffect(() => {
    setCurrentImage(initialImage);
  }, [initialImage]);
  
  // Provider change handler
  const handleProviderChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      const value = e.target.value;
      setSelectedProviderId(value ? Number(value) : undefined);
    } catch (error) {
      console.error('Error handling provider change:', error);
      // Continue with undefined provider ID on error
      setSelectedProviderId(undefined);
    }
  }, []);
  
  // Method to fetch providers on demand
  const fetchProviders = useCallback(async () => {
    await refetchProviders();
  }, [refetchProviders]);
  
  // Refetch perspectives and return the data
  const refetchPerspectives = async (): Promise<Perspective[]> => {
    if (!isServerConnected) {
      throw new Error('Cannot refetch perspectives: Server connection not established');
    }
    
    try {
      const result = await refetchPerspectivesQuery();
      return result.data || [];
    } catch (error) {
      console.error('Error refetching perspectives:', error);
      throw error;
    }
  };
  
  // Load captions from localStorage when image changes
  useEffect(() => {
    if (!currentImage) {
      setCaptions({});
      return;
    }
    
    // Use directory as dataset ID and name as filename for localStorage
    const datasetId = currentImage.directory || 'unknown';
    const filename = currentImage.name;
    
    // Load all captions for this image from localStorage
    const storedCaptions = getAllCaptionsForImage(datasetId, filename);
    
    // Format captions to match expected structure
    if (Object.keys(storedCaptions).length > 0) {
      setCaptions({
        perspectives: storedCaptions
      });
    } else {
      setCaptions({});
    }
  }, [currentImage]);
  
  // Get generated perspectives based on captions
  const generatedPerspectives = React.useMemo(() => {
    if (!captions.perspectives) return [];
    return Object.keys(captions.perspectives);
  }, [captions]);
  
  // Generate a perspective caption and save to localStorage
  const generatePerspective = useCallback(async (
    schemaName: string,
    imagePath: string,
    providerId?: number,
    options?: CaptionOptions
  ) => {
    if (!isServerConnected) {
      throw new Error('Cannot generate caption: Server connection not established');
    }
    
    if (!currentImage) return;
    
    try {
      // Add to generating list
      setGeneratingPerspectives(prev => [...prev, schemaName]);
      
      // Get selected provider name
      const provider = providersData?.find(p => p.id === (providerId ?? selectedProviderId));
      const providerName = provider?.name || 'unknown';
      
      // Log the options to ensure they're being passed correctly
      console.debug(`Generating perspective "${schemaName}" with options:`, {
        providedOptions: options,
        contextOptions: captionOptions,
        finalOptions: options || captionOptions || {}
      });
      
      // Use the direct mutation to generate caption via API
      const result = await generateCaptionMutation.mutateAsync({
        perspective: schemaName,
        imagePath,
        providerId: providerId ?? selectedProviderId,
        options: options ?? captionOptions
      });
      
      // Validate required data
      if (!result.metadata?.model) {
        console.error(`ERROR: Missing model information in API response for perspective ${schemaName}`);
      }
      
      if (!providerName) {
        console.error(`ERROR: Missing provider information for perspective ${schemaName}`);
      }
      
      if (!options && !captionOptions) {
        console.error(`ERROR: Missing generation options for perspective ${schemaName}`);
      }
      
      // Format the data as PerspectiveData object - no defaults!
      const perspectiveData: PerspectiveData = {
        config_name: schemaName,
        version: '1.0',
        model: result.metadata?.model || (() => {
          console.error(`CRITICAL ERROR: Missing model information in API response for perspective ${schemaName}`);
          return "MISSING_MODEL";
        })(),
        provider: providerName || (() => {
          console.error(`CRITICAL ERROR: Missing provider information for perspective ${schemaName}`);
          return "MISSING_PROVIDER";
        })(),
        content: result.content ?? result.result ?? {},
        options: options || captionOptions || (() => {
          console.error(`CRITICAL ERROR: Missing generation options for perspective ${schemaName}`);
          return {};
        })()
      };
      
      // Save formatted data to localStorage
      saveCaptionToStorage(
        currentImage.directory || 'unknown',
        currentImage.name,
        schemaName,
        perspectiveData
      );
      
      // Update state
      setCaptions(prev => ({
        ...prev,
        perspectives: {
          ...(prev.perspectives || {}),
          [schemaName]: perspectiveData
        }
      }));

      return perspectiveData;
    } catch (error) {
      console.error(`Error generating perspective "${schemaName}":`, error);
      throw error;
    } finally {
      // Remove from generating list
      setGeneratingPerspectives(prev => prev.filter(name => name !== schemaName));
    }
  }, [currentImage, generateCaptionMutation, isServerConnected, selectedProviderId, captionOptions, providersData]);
  
  // Helper to check if a perspective is generated
  const isPerspectiveGenerated = useCallback((schemaName: string) => {
    return !!captions.perspectives?.[schemaName];
  }, [captions]);
  
  // Helper to check if a perspective is currently generating
  const isPerspectiveGenerating = useCallback((schemaName: string) => {
    return generatingPerspectives.includes(schemaName);
  }, [generatingPerspectives]);
  
  // Helper to get the data for a specific perspective
  const getPerspectiveData = useCallback((schemaName: string) => {
    // Try to get data from our in-memory state
    const perspectiveData = captions.perspectives?.[schemaName];
    
    console.log('getPerspectiveData for', schemaName, perspectiveData);
    
    // Always return the complete perspective data object
    // to preserve options and metadata
    return perspectiveData;
  }, [captions]);
  
  // Create consolidated context value
  const value: PerspectivesDataContextType = useMemo(() => ({
    // Provider state
    selectedProviderId,
    availableProviders,
    isGeneratingAll,
    
    // Provider actions
    setSelectedProviderId,
    setAvailableProviders,
    setIsGeneratingAll,
    handleProviderChange,
    
    // Data fetching - providers
    fetchProviders,
    isLoadingProviders,
    providerError,
    
    // Perspectives data
    perspectives: perspectivesData || [],
    schemas,
    isLoadingPerspectives,
    perspectivesError,
    refetchPerspectives,
    
    // Captions data
    captions,
    generatedPerspectives,
    isGenerating: generatingPerspectives.length > 0,
    isServerConnected,
    
    // Caption options
    captionOptions,
    setCaptionOptions,
    
    // Current image
    currentImage,
    setCurrentImage,
    
    // Generation operations
    generatePerspective,
    
    // Status helpers
    isPerspectiveGenerated,
    isPerspectiveGenerating,
    
    // Data helpers
    getPerspectiveData
  }), [
    selectedProviderId, 
    availableProviders, 
    isGeneratingAll,
    setSelectedProviderId,
    setAvailableProviders,
    setIsGeneratingAll,
    handleProviderChange,
    fetchProviders,
    isLoadingProviders,
    providerError,
    perspectivesData,
    schemas,
    isLoadingPerspectives,
    perspectivesError,
    refetchPerspectives,
    captions,
    generatedPerspectives,
    generatingPerspectives,
    isServerConnected,
    captionOptions,
    setCaptionOptions,
    currentImage,
    setCurrentImage,
    generatePerspective,
    isPerspectiveGenerated,
    isPerspectiveGenerating,
    getPerspectiveData
  ]);
  
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