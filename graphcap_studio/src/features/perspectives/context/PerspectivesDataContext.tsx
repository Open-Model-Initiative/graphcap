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
 * Save provider name to localStorage
 * @param providerName - The provider name to save
 */
const saveProviderNameToStorage = (providerName: string | undefined) => {
  try {
    if (providerName !== undefined) {
      localStorage.setItem(SELECTED_PERSPECTIVE_PROVIDER_KEY, providerName);
    } else {
      localStorage.removeItem(SELECTED_PERSPECTIVE_PROVIDER_KEY);
    }
  } catch (error) {
    console.error('Error saving perspective provider name to localStorage:', error);
  }
};

/**
 * Load provider name from localStorage
 * @returns The selected provider name, or undefined if none is stored
 */
const loadProviderNameFromStorage = (): string | undefined => {
  try {
    const storedProvider = localStorage.getItem(SELECTED_PERSPECTIVE_PROVIDER_KEY);
    return storedProvider ?? undefined;
  } catch (error) {
    console.error('Error loading perspective provider name from localStorage:', error);
    return undefined;
  }
};

// Define the context type with explicit typing
interface PerspectivesDataContextType {
  // Provider state
  selectedProvider: string | undefined;
  availableProviders: Provider[];
  isGeneratingAll: boolean;
  
  // Provider actions
  setSelectedProvider: (provider: string | undefined) => void;
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
    provider_name?: string, 
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
  readonly initialProvider?: string;
  readonly initialProviders?: Provider[];
  readonly initialCaptionOptions?: CaptionOptions;
}

/**
 * Provider component for perspectives data
 * @param props - Provider props
 */
export function PerspectivesDataProvider({ 
  children,
  image: initialImage,
  initialProvider,
  initialProviders = [],
  initialCaptionOptions = {}
}: PerspectivesDataProviderProps) {
  // Server connection state
  const { connections } = useServerConnectionsContext();
  const graphcapServerConnection = connections.find(conn => conn.id === SERVER_IDS.GRAPHCAP_SERVER);
  const isServerConnected = graphcapServerConnection?.status === 'connected';
  
  // Current image state
  const [currentImage, setCurrentImage] = useState<Image | null>(initialImage);
  
  // Provider state
  const [selectedProvider, setSelectedProvider] = useState<string | undefined>(
    initialProvider ?? loadProviderNameFromStorage()
  );
  const [availableProviders, setAvailableProviders] = useState<Provider[]>(initialProviders);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  
  // Caption options state
  const [captionOptions, setCaptionOptions] = useState<CaptionOptions>(initialCaptionOptions);
  
  // Captions state
  const [captions, setCaptions] = useState<any>({});
  
  // Generation state
  const [generatingPerspectives, setGeneratingPerspectives] = useState<string[]>([]);
  
  // Data fetching - perspectives
  const { 
    data: perspectivesData, 
    isLoading: isLoadingPerspectives, 
    error: perspectivesError,
    refetch: refetchPerspectivesQuery
  } = usePerspectives();
  
  // Data fetching - providers
  const { 
    data: providersData, 
    isLoading: isLoadingProviders, 
    error: providerError,
    refetch: refetchProviders
  } = useProviders();
  
  // Generate caption mutation
  const generateCaptionMutation = useGeneratePerspectiveCaption();
  
  // Save selected provider when it changes
  useEffect(() => {
    saveProviderNameToStorage(selectedProvider);
  }, [selectedProvider]);
  
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
      setSelectedProvider(value || undefined);
    } catch (error) {
      console.error('Error handling provider change:', error);
      // Continue with undefined provider on error
      setSelectedProvider(undefined);
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
      return result.data ?? [];
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
    
    // Load all captions for this image from localStorage using the image path
    const storedCaptions = getAllCaptionsForImage(currentImage.path);
    
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
    provider_name?: string,
    options?: CaptionOptions
  ) => {
    if (!isServerConnected) {
      throw new Error('Cannot generate caption: Server connection not established');
    }
    
    if (!currentImage) return;
    
    try {
      // Add to generating list
      setGeneratingPerspectives(prev => [...prev, schemaName]);
      
      // Use provided provider or selected provider
      const effectiveProvider = provider_name ?? selectedProvider;
      
      if (!effectiveProvider) {
        throw new Error('No provider selected for caption generation');
      }
      
      // Log the options to ensure they're being passed correctly
      console.debug(`Generating perspective "${schemaName}" with options:`, {
        providedOptions: options,
        contextOptions: captionOptions,
        finalOptions: options ?? captionOptions ?? {},
        provider: effectiveProvider
      });
      
      // Use the direct mutation to generate caption via API
      const result = await generateCaptionMutation.mutateAsync({
        perspective: schemaName,
        imagePath,
        provider_name: effectiveProvider,
        options: options ?? captionOptions
      });
      
      // Validate required data
      if (!result.metadata?.model) {
        console.error(`ERROR: Missing model information in API response for perspective ${schemaName}`);
      }
      
      if (!effectiveProvider) {
        console.error(`ERROR: Missing provider information for perspective ${schemaName}`);
      }
      
      if (!options && !captionOptions) {
        console.error(`ERROR: Missing generation options for perspective ${schemaName}`);
      }
      
      // Format the data as PerspectiveData object - no defaults!
      const perspectiveData: PerspectiveData = {
        config_name: schemaName,
        version: '1.0',
        model: result.metadata?.model ?? (() => {
          console.error(`CRITICAL ERROR: Missing model information in API response for perspective ${schemaName}`);
          return "MISSING_MODEL";
        })(),
        provider: effectiveProvider,
        content: result.result || {},
        options: options || captionOptions
      };
      
      // Update captions state with this new perspective data
      setCaptions((prev: Record<string, any>) => {
        const newCaptions = {
          ...prev,
          perspectives: {
            ...prev.perspectives,
            [schemaName]: perspectiveData
          },
          metadata: {
            captioned_at: new Date().toISOString(), 
            provider: effectiveProvider,
            model: result.metadata?.model ?? 'unknown'
          }
        };
        
        // Save to localStorage for persistence
        if (currentImage) {
          saveCaptionToStorage(currentImage.path, newCaptions);
        }
        
        return newCaptions;
      });
      
      // Return the result for chaining
      return result;
      
    } catch (error) {
      console.error(`Error generating perspective "${schemaName}":`, error);
      throw error;
    } finally {
      // Remove from generating list whether successful or failed
      setGeneratingPerspectives(prev => prev.filter(p => p !== schemaName));
    }
  }, [
    isServerConnected, 
    currentImage, 
    selectedProvider, 
    captionOptions, 
    generateCaptionMutation
  ]);
  
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
    
    console.debug('getPerspectiveData for', schemaName, perspectiveData);
    
    // Always return the complete perspective data object
    // to preserve options and metadata
    return perspectiveData;
  }, [captions]);
  
  // Create consolidated context value
  const value: PerspectivesDataContextType = useMemo(() => ({
    // Provider state
    selectedProvider,
    availableProviders,
    isGeneratingAll,
    
    // Provider actions
    setSelectedProvider,
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
    selectedProvider, 
    availableProviders, 
    isGeneratingAll,
    setSelectedProvider,
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