// SPDX-License-Identifier: Apache-2.0
import { toast } from "@/utils/toast";
import { useCallback, useEffect, useRef } from "react";
import { useImageUploader } from "./useImageUploader";

interface UsePasteCaptureOptions {
  /**
   * Optional callback when upload is complete
   */
  readonly onUploadComplete?: () => void;
  
  /**
   * Whether to disable the paste functionality
   */
  readonly disabled?: boolean;
}

interface UsePasteCaptureResult {
  /**
   * Ref to attach to the element that should capture paste events
   */
  containerRef: React.RefObject<HTMLDivElement>;
  
  /**
   * Whether paste uploads are currently disabled
   */
  isDisabled: boolean;
}

/**
 * Custom hook that handles capturing clipboard paste events with images
 * and uploading them to the currently selected dataset.
 */
export function usePasteCapture({
  onUploadComplete = () => {},
  disabled = false
}: UsePasteCaptureOptions = {}): UsePasteCaptureResult {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Get the image uploader hook for paste handling
  const { handlePaste, isDisabled: uploaderDisabled } = useImageUploader({
    onUploadComplete
  });
  
  // Combined disabled state
  const isDisabled = disabled || uploaderDisabled;
  
  // Handle paste events
  const onPaste = useCallback(async (e: ClipboardEvent) => {
    if (isDisabled) return;
    
    try {
      handlePaste(e);
    } catch (error) {
      console.error("Error handling paste:", error);
      toast.error({ 
        title: "Paste Failed", 
        description: "Could not paste image" 
      });
    }
  }, [handlePaste, isDisabled]);
  
  // Set up the paste event listener
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    
    element.addEventListener("paste", onPaste);
    
    return () => {
      element.removeEventListener("paste", onPaste);
    };
  }, [onPaste]);
  
  return {
    containerRef: containerRef as React.RefObject<HTMLDivElement>,
    isDisabled
  };
} 