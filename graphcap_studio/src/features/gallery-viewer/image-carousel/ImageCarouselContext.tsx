// SPDX-License-Identifier: Apache-2.0
import { createContext, useContext, ReactNode, useMemo } from 'react';

interface ImageCarouselContextType {
  // Dataset information
  datasetName: string;
  
  // Upload related
  onUploadComplete?: () => void;
  
}

const ImageCarouselContext = createContext<ImageCarouselContextType | null>(null);

interface ImageCarouselProviderProps {
  readonly children: ReactNode;
  readonly datasetName: string;
  readonly onUploadComplete?: () => void;
}

/**
 * Provider component for the ImageCarousel context
 * Makes the dataset name and other shared properties available to all child components
 * 
 * @param children - Child components
 * @param datasetName - Name of the dataset being viewed
 * @param onUploadComplete - Callback when upload is complete
 */
export function ImageCarouselProvider({ 
  children, 
  datasetName,
  onUploadComplete
}: ImageCarouselProviderProps) {
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