// SPDX-License-Identifier: Apache-2.0
import { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Dataset, listDatasetImages, createDataset, addImageToDataset } from '@/services/images';

// Query keys for caching
export const DATASET_QUERY_KEYS = {
  datasets: ['datasets'],
  datasetImages: (datasetName: string) => ['datasets', datasetName, 'images'],
};

/**
 * Custom hook for managing datasets
 * 
 * This hook provides functionality for listing, creating, and managing datasets
 * 
 * @returns Dataset management functions and state
 */
export function useDatasets() {
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [selectedSubfolder, setSelectedSubfolder] = useState<string | null>(null);
  
  // Get query client for prefetching and cache management
  const queryClient = useQueryClient();

  // Fetch datasets with improved caching
  const { 
    data: datasetsData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: DATASET_QUERY_KEYS.datasets,
    queryFn: listDatasetImages,
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Cache data for 30 minutes (formerly cacheTime)
  });

  // Find the currently selected dataset
  const currentDataset = datasetsData?.datasets?.find(d => d.name === selectedDataset);
  
  // Filter images by subfolder if selected
  const filteredImages = currentDataset?.images.filter(image => {
    if (!selectedSubfolder) return true;
    return image.directory.includes(selectedSubfolder);
  }) || [];

  // Set the first dataset as selected by default
  useEffect(() => {
    if (datasetsData?.datasets && datasetsData.datasets.length > 0 && !selectedDataset) {
      setSelectedDataset(datasetsData.datasets[0].name);
    }
  }, [datasetsData, selectedDataset]);

  /**
   * Handle dataset selection
   */
  const handleDatasetChange = useCallback((datasetName: string, subfolder?: string) => {
    setSelectedDataset(datasetName);
    setSelectedSubfolder(subfolder || null);
  }, []);

  /**
   * Create a new dataset
   */
  const handleCreateDataset = useCallback(async (name: string): Promise<void> => {
    try {
      await createDataset(name);
      
      // Invalidate the datasets cache
      queryClient.invalidateQueries({ queryKey: DATASET_QUERY_KEYS.datasets });
      
      // Force an immediate refetch to ensure the UI updates
      await queryClient.refetchQueries({ queryKey: DATASET_QUERY_KEYS.datasets });
      
      // Set the newly created dataset as the selected dataset
      setSelectedDataset(name);
      setSelectedSubfolder(null);
      
      toast.success(`Created dataset ${name}`);
    } catch (error) {
      console.error('Failed to create dataset:', error);
      toast.error(`Failed to create dataset: ${(error as Error).message}`);
      throw error;
    }
  }, [queryClient]);

  /**
   * Add an image to a dataset
   */
  const handleAddToDataset = useCallback(async (imagePath: string, targetDataset: string) => {
    if (!imagePath || !targetDataset) return;
    
    try {
      const result = await addImageToDataset(imagePath, targetDataset);
      
      if (result.success) {
        toast.success(result.message);
        
        // Invalidate queries to refresh the datasets
        queryClient.invalidateQueries({ queryKey: DATASET_QUERY_KEYS.datasets });
        if (selectedDataset) {
          queryClient.invalidateQueries({ queryKey: DATASET_QUERY_KEYS.datasetImages(selectedDataset) });
        }
        queryClient.invalidateQueries({ queryKey: DATASET_QUERY_KEYS.datasetImages(targetDataset) });
        
        // Force a refresh after a short delay
        setTimeout(() => {
          queryClient.refetchQueries({ queryKey: DATASET_QUERY_KEYS.datasets });
        }, 500);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to add image to dataset');
      console.error('Error adding image to dataset:', error);
    }
  }, [queryClient, selectedDataset]);

  /**
   * Handle upload completion
   */
  const handleUploadComplete = useCallback(() => {
    // Invalidate both the datasets query and the specific dataset query to refresh the list
    queryClient.invalidateQueries({ queryKey: DATASET_QUERY_KEYS.datasets });
    if (selectedDataset) {
      queryClient.invalidateQueries({ queryKey: DATASET_QUERY_KEYS.datasetImages(selectedDataset) });
    }
    
    // Force a refresh after a short delay to ensure the UI updates
    setTimeout(() => {
      queryClient.refetchQueries({ queryKey: DATASET_QUERY_KEYS.datasets });
    }, 500);
  }, [queryClient, selectedDataset]);

  return {
    // State
    selectedDataset,
    selectedSubfolder,
    datasetsData,
    currentDataset,
    filteredImages,
    isLoading,
    error,
    
    // Actions
    setSelectedDataset,
    setSelectedSubfolder,
    handleDatasetChange,
    handleCreateDataset,
    handleAddToDataset,
    handleUploadComplete,
    refetch
  };
} 