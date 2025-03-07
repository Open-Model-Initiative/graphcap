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
  datasets: Dataset[];
  setDatasets: (datasets: Dataset[]) => void;
  currentDataset: string;
  setCurrentDataset: (dataset: string) => void;
  
  // Action handlers
  handleSelectImage: (image: Image) => void;
  handleAddToDataset: (imagePath: string, targetDataset: string) => void;
  handleEditImage: () => void;
  handleDownload: () => void;
  handleDelete: () => void;
}

/**
 * Props for the EditorContextProvider component
 */
interface EditorContextProviderProps {
  readonly children: ReactNode;
  readonly initialDatasets?: Dataset[];
  readonly initialCurrentDataset?: string;
  readonly initialViewMode?: ViewMode;
  readonly onAddToDataset?: (imagePath: string, targetDataset: string) => void;
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
  initialDatasets = [],
  initialCurrentDataset = '',
  initialViewMode = 'grid',
  onAddToDataset,
  onEditImage,
  onDownload,
  onDelete
}: EditorContextProviderProps) {
  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  
  // Image selection state
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  
  // Dataset state
  const [datasets, setDatasets] = useState<Dataset[]>(initialDatasets);
  const [currentDataset, setCurrentDataset] = useState<string>(initialCurrentDataset);
  
  // Action handlers
  const handleSelectImage = useCallback((image: Image) => {
    setSelectedImage(image);
  }, []);
  
  const handleAddToDataset = useCallback((imagePath: string, targetDataset: string) => {
    if (onAddToDataset) {
      onAddToDataset(imagePath, targetDataset);
    }
  }, [onAddToDataset]);
  
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
    
    // Dataset
    datasets,
    setDatasets,
    currentDataset,
    setCurrentDataset,
    
    // Action handlers
    handleSelectImage,
    handleAddToDataset,
    handleEditImage,
    handleDownload,
    handleDelete
  }), [
    viewMode, 
    selectedImage, 
    datasets, 
    currentDataset, 
    handleSelectImage, 
    handleAddToDataset, 
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