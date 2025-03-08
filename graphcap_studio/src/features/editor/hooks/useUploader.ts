// SPDX-License-Identifier: Apache-2.0
import { useState, useCallback } from 'react';

/**
 * Custom hook for managing image uploads
 * 
 * This hook provides functionality for showing/hiding the uploader
 * 
 * @returns Uploader functions and state
 */
export function useUploader() {
  const [showUploader, setShowUploader] = useState(false);

  /**
   * Toggle uploader visibility
   */
  const handleToggleUploader = useCallback(() => {
    setShowUploader(!showUploader);
  }, [showUploader]);

  return {
    showUploader,
    setShowUploader,
    handleToggleUploader
  };
} 