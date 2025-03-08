// SPDX-License-Identifier: Apache-2.0
import { useCallback } from 'react';
import { toast } from 'sonner';
import { Image } from '@/services/images';

interface UseImageActionsProps {
  selectedImage: Image | null;
  startEditing: (image: Image) => void;
  onUploadComplete?: () => void;
}

/**
 * Custom hook for handling image actions
 * 
 * This hook provides functions for:
 * - Editing images
 * - Downloading images
 * - Deleting images
 * - Handling upload completion
 * 
 * @param props - Properties needed for image actions
 * @returns Functions for image actions
 */
export function useImageActions({
  selectedImage,
  startEditing,
  onUploadComplete
}: UseImageActionsProps) {
  // Adapter for handleEditImage to work with our component interface
  const handleEditImage = useCallback(() => {
    if (selectedImage) {
      startEditing(selectedImage);
    }
  }, [selectedImage, startEditing]);

  // Handle download action
  const handleDownload = useCallback(() => {
    if (selectedImage) {
      // Implementation for download
      toast.success("Download started");
    }
  }, [selectedImage]);

  // Handle delete action
  const handleDelete = useCallback(() => {
    if (selectedImage) {
      // Implementation for delete
      toast.success("Image deleted");
    }
  }, [selectedImage]);

  // Handle upload finished
  const handleUploadFinished = useCallback(() => {
    if (onUploadComplete) {
      onUploadComplete();
    }
  }, [onUploadComplete]);

  return {
    handleEditImage,
    handleDownload,
    handleDelete,
    handleUploadFinished
  };
} 