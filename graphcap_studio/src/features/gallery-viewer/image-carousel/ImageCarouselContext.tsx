// SPDX-License-Identifier: Apache-2.0
import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useDatasetContext } from '@/features/datasets/context/DatasetContext';

interface ImageCarouselContextType {
  // Dataset information
  datasetName: string;
  
  // Upload related
  onUploadComplete?: () => void;
}

const ImageCarouselContext = createContext<ImageCarouselContextType | null>(null);

interface ImageCarouselProviderProps {
  readonly children: ReactNode;
  readonly datasetName?: string; // Make optional
  readonly onUploadComplete?: () => void;
}

/**
 * Provider component for the ImageCarousel context
 * Makes the dataset name and other shared properties available to all child components
 * 
 * @param children - Child components
 * @param datasetName - Optional override for dataset name
 * @param onUploadComplete - Callback when upload is complete
 */
export function ImageCarouselProvider({ 
  children, 
  datasetName: propDatasetName,
  onUploadComplete
}: ImageCarouselProviderProps) {
  // Get current dataset from context
  const { currentDataset } = useDatasetContext();
  
  // Use prop datasetName if provided, otherwise use currentDataset from context
  const datasetName = propDatasetName || currentDataset;

  const contextValue = useMemo(() => ({
    datasetName,
    onUploadComplete,
  }), [datasetName, onUploadComplete]);

  return (
    <ImageCarouselContext.Provider 
      value={contextValue}
    >
      {children}
    </ImageCarouselContext.Provider>
  );
}

/**
 * Hook to access the ImageCarousel context
 * @returns The ImageCarousel context value
 * @throws Error if used outside of an ImageCarouselProvider
 */
export function useImageCarouselContext(): ImageCarouselContextType {
  const context = useContext(ImageCarouselContext);
  
  if (context === null) {
    throw new Error('useImageCarouselContext must be used within an ImageCarouselProvider');
  }
  
  return context;
} 