// SPDX-License-Identifier: Apache-2.0
import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { Image, Dataset } from '@/services/images';

/**
 * Types of view modes available in the editor
 */
export type ViewMode = 'grid' | 'carousel';

/**
 * Interface for the editor context state
 */
interface EditorContextState {
  // View mode state
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  
  // Image selection state
  selectedImage: Image | null;
  setSelectedImage: (image: Image | null) => void;
  
  // Dataset state
  dataset: Dataset | null;
  
  // Action handlers
  handleSelectImage: (image: Image) => void;
  handleEditImage: () => void;
  handleDownload: () => void;
  handleDelete: () => void;
}

/**
 * Props for the EditorContextProvider component
 */
interface EditorContextProviderProps {
  readonly children: ReactNode;
  readonly initialViewMode?: ViewMode;
  readonly dataset: Dataset | null;
  readonly onEditImage?: () => void;
  readonly onDownload?: () => void;
  readonly onDelete?: () => void;
}

/**
 * Context for managing editor UI state
 */
const EditorContext = createContext<EditorContextState | undefined>(undefined);

/**
 * Provider component for the EditorContext
 */
export function EditorContextProvider({ 
  children,
  initialViewMode = 'grid',
  dataset = null,
  onEditImage,
  onDownload,
  onDelete
}: EditorContextProviderProps) {
  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  
  // Image selection state
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  
  // Action handlers
  const handleSelectImage = useCallback((image: Image) => {
    setSelectedImage(image);
  }, []);
  
  const handleEditImage = useCallback(() => {
    if (onEditImage) {
      onEditImage();
    }
  }, [onEditImage]);
  
  const handleDownload = useCallback(() => {
    if (onDownload) {
      onDownload();
    }
  }, [onDownload]);
  
  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete();
    }
  }, [onDelete]);

  const value = useMemo(() => ({
    // View mode
    viewMode,
    setViewMode,
    
    // Image selection
    selectedImage,
    setSelectedImage,
    
    // Dataset state
    dataset,
    
    // Action handlers
    handleSelectImage,
    handleEditImage,
    handleDownload,
    handleDelete
  }), [
    viewMode, 
    selectedImage,
    dataset,
    handleSelectImage, 
    handleEditImage, 
    handleDownload, 
    handleDelete
  ]);

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

/**
 * Hook for accessing the EditorContext
 * 
 * @returns The editor context state
 * @throws Error if used outside of EditorContextProvider
 */
export function useEditorContext() {
  const context = useContext(EditorContext);
  
  if (context === undefined) {
    throw new Error('useEditorContext must be used within an EditorContextProvider');
  }
  
  return context;
} 