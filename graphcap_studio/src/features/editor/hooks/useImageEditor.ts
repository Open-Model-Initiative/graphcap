// SPDX-License-Identifier: Apache-2.0
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Image } from '@/services/images';
import { queryKeys } from '@/services/dataset';

interface UseImageEditorProps {
  selectedDataset: string | null;
}

/**
 * Custom hook for managing image editing
 * 
 * This hook provides functionality for editing images
 * 
 * @param props - Hook properties
 * @returns Image editing functions and state
 */
export function useImageEditor({ selectedDataset }: UseImageEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  /**
   * Start editing an image
   */
  const handleEditImage = useCallback((selectedImage: Image | null) => {
    if (selectedImage) {
      setIsEditing(true);
    } else {
      toast.error('Please select an image to edit');
    }
  }, []);

  /**
   * Save edited image
   */
  const handleSave = useCallback(() => {
    toast.success('Image saved successfully');
    setIsEditing(false);
    
    // Invalidate cache for this dataset to refresh the images
    if (selectedDataset) {
      queryClient.invalidateQueries({ queryKey: queryKeys.datasetByName(selectedDataset) });
      queryClient.invalidateQueries({ queryKey: queryKeys.datasetImages });
    }
  }, [queryClient, selectedDataset]);

  /**
   * Cancel editing
   */
  const handleCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  return {
    // State
    isEditing,
    
    // Actions
    setIsEditing,
    handleEditImage,
    handleSave,
    handleCancel
  };
} 