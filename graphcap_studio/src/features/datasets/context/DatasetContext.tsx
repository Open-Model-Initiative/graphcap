// SPDX-License-Identifier: Apache-2.0
import { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { Image } from '@/services/images';
import { Dataset } from '@/services/dataset';
import { useCreateDataset, useAddImageToDataset } from '@/services/dataset';
import { getQueryClient } from '@/common/utils/queryClient';
import { toast } from 'sonner';

/**
 * Interface for the dataset context state
 */
interface DatasetContextState {
  // Dataset state
  datasets: Dataset[];
  setDatasets: (datasets: Dataset[]) => void;
  currentDataset: string;
  setCurrentDataset: (dataset: string) => void;
  selectedSubfolder: string | null;
  setSelectedSubfolder: (subfolder: string | null) => void;
  
  // Image selection state
  selectedImage: Image | null;
  setSelectedImage: (image: Image | null) => void;
  
  // Action handlers
  handleSelectImage: (image: Image) => void;
  handleAddToDataset: (imagePath: string, targetDataset: string) => void;
  handleCreateDataset: (name: string) => Promise<void>;
}

/**
 * Props for the DatasetContextProvider component
 */
interface DatasetContextProviderProps {
  readonly children: ReactNode;
  readonly initialDatasets?: Dataset[];
  readonly initialCurrentDataset?: string;
  readonly initialSelectedSubfolder?: string | null;
  readonly onAddToDataset?: (imagePath: string, targetDataset: string) => void;
  readonly onCreateDataset?: (name: string) => Promise<void>;
}

/**
 * Context for managing dataset UI state
 */
const DatasetContext = createContext<DatasetContextState | undefined>(undefined);

/**
 * Provider component for the DatasetContext
 */
export function DatasetContextProvider({ 
  children,
  initialDatasets = [],
  initialCurrentDataset = '',
  initialSelectedSubfolder = null,
  onAddToDataset,
  onCreateDataset,
}: DatasetContextProviderProps) {
  // Dataset state
  const [datasets, setDatasets] = useState<Dataset[]>(initialDatasets);
  const [currentDataset, setCurrentDataset] = useState<string>(initialCurrentDataset);
  const [selectedSubfolder, setSelectedSubfolder] = useState<string | null>(initialSelectedSubfolder);
  
  // Image selection state
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  
  // Get mutations from dataset service
  const createDatasetMutation = useCreateDataset();
  const addImageToDatasetMutation = useAddImageToDataset();
  
  // Update datasets when initialDatasets changes
  useEffect(() => {
    setDatasets(initialDatasets);
  }, [initialDatasets]);
  
  // Update current dataset when initialCurrentDataset changes
  useEffect(() => {
    if (initialCurrentDataset && initialCurrentDataset !== currentDataset) {
      setCurrentDataset(initialCurrentDataset);
    }
  }, [initialCurrentDataset, currentDataset]);
  
  // Update selected subfolder when initialSelectedSubfolder changes
  useEffect(() => {
    setSelectedSubfolder(initialSelectedSubfolder);
  }, [initialSelectedSubfolder]);
  
  // Action handlers
  const handleSelectImage = useCallback((image: Image) => {
    setSelectedImage(image);
  }, []);
  
  const handleAddToDataset = useCallback(async (imagePath: string, targetDataset: string) => {
    if (!imagePath || !targetDataset) return;
    
    try {
      // Use the provided handler if available
      if (onAddToDataset) {
        onAddToDataset(imagePath, targetDataset);
        return;
      }
      
      // Otherwise use the mutation from dataset service
      const result = await addImageToDatasetMutation.mutateAsync({ 
        imagePath, 
        datasetName: targetDataset 
      });
      
      if (result.success) {
        toast.success(result.message || `Image added to dataset ${targetDataset} successfully`);
      } else {
        toast.error(result.message || 'Failed to add image to dataset');
      }
    } catch (error) {
      toast.error(`Failed to add image to dataset: ${(error as Error).message}`);
      console.error('Error adding image to dataset:', error);
    }
  }, [onAddToDataset, addImageToDatasetMutation]);
  
  const handleCreateDataset = useCallback(async (name: string): Promise<void> => {
    try {
      // Use the provided handler if available
      if (onCreateDataset) {
        await onCreateDataset(name);
        return;
      }
      
      // Otherwise use the mutation from dataset service
      await createDatasetMutation.mutateAsync(name);
      toast.success(`Created dataset ${name}`);
    } catch (error) {
      console.error('Failed to create dataset:', error);
      toast.error(`Failed to create dataset: ${(error as Error).message}`);
      throw error;
    }
  }, [onCreateDataset, createDatasetMutation]);

  const value = useMemo(() => ({
    // Dataset state
    datasets,
    setDatasets,
    currentDataset,
    setCurrentDataset,
    selectedSubfolder,
    setSelectedSubfolder,
    
    // Image selection
    selectedImage,
    setSelectedImage,
    
    // Action handlers
    handleSelectImage,
    handleAddToDataset,
    handleCreateDataset
  }), [
    datasets, 
    currentDataset, 
    selectedSubfolder,
    selectedImage, 
    handleSelectImage, 
    handleAddToDataset,
    handleCreateDataset
  ]);

  return <DatasetContext.Provider value={value}>{children}</DatasetContext.Provider>;
}

/**
 * Hook for accessing the DatasetContext
 * 
 * @returns The dataset context state
 * @throws Error if used outside of DatasetContextProvider
 */
export function useDatasetContext() {
  const context = useContext(DatasetContext);
  
  if (context === undefined) {
    throw new Error('useDatasetContext must be used within a DatasetContextProvider');
  }
  
  return context;
} 