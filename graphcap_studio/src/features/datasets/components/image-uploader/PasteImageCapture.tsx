// SPDX-License-Identifier: Apache-2.0
import { usePasteCapture } from "./usePasteCapture";

interface PasteImageCaptureProps {
  /**
   * Children to render inside the paste capture area
   */
  readonly children: React.ReactNode;
  
  /**
   * CSS class name to apply to the container
   */
  readonly className?: string;
  
  /**
   * Optional callback when upload is complete
   */
  readonly onUploadComplete?: () => void;
  
  /**
   * Whether to disable the paste functionality
   */
  readonly disabled?: boolean;
}

/**
 * Component that adds clipboard paste-to-upload functionality to its children.
 * Handles capturing paste events containing images and uploading them to the
 * currently selected dataset.
 * 
 * This component doesn't change the visual appearance of its children.
 */
export function PasteImageCapture({
  children,
  className = "",
  onUploadComplete = () => {},
  disabled = false
}: PasteImageCaptureProps) {
  // Use our custom hook to handle paste functionality
  const { containerRef } = usePasteCapture({
    onUploadComplete,
    disabled
  });
  
  return (
    <div 
      ref={containerRef}
      className={className}
      tabIndex={-1} 
      aria-label="Paste Image Capture"
    >
      {children}
    </div>
  );
} 