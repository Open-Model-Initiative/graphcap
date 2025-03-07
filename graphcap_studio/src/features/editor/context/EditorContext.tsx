// SPDX-License-Identifier: Apache-2.0
import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { Image, Dataset } from '@/services/images';

/**
 * Interface for the editor context state
 */
interface EditorContextState {
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
  dataset = null,
  onEditImage,
  onDownload,
  onDelete
}: EditorContextProviderProps) {
  // Image selection state
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  
  // Action handlers
  const handleSelectImage = useCallback((image: Image) => {
    setSelectedImage(image);
  }, []);
  
  const handleEditImage = useCallback(() => {
    if (selectedImage && onEditImage) {
      onEditImage();
    }
  }, [selectedImage, onEditImage]);
  
  const handleDownload = useCallback(() => {
    if (selectedImage && onDownload) {
      onDownload();
    }
  }, [selectedImage, onDownload]);
  
  const handleDelete = useCallback(() => {
    if (selectedImage && onDelete) {
      onDelete();
    }
  }, [selectedImage, onDelete]);
  
  // Create the context value
  const contextValue = useMemo<EditorContextState>(() => ({
    selectedImage,
    setSelectedImage,
    dataset,
    handleSelectImage,
    handleEditImage,
    handleDownload,
    handleDelete
  }), [
    selectedImage,
    setSelectedImage,
    dataset,
    handleSelectImage,
    handleEditImage,
    handleDownload,
    handleDelete
  ]);
  
  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
}

/**
 * Hook to access the editor context
 */
export function useEditorContext() {
  const context = useContext(EditorContext);
  
  if (context === undefined) {
    throw new Error('useEditorContext must be used within an EditorContextProvider');
  }
  
  return context;
} 