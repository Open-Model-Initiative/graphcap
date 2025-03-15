// SPDX-License-Identifier: Apache-2.0
import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Image } from '@/services/images';
import { useEditorContext } from '@/features/editor/context/EditorContext';

// Define the properties data interface
export interface ImagePropertiesData {
  title: string;
  description: string;
  tags: string[];
  rating: number;
  metadata: Record<string, any>;
}

// Define the context type
interface ImagePropertiesContextType {
  // Data
  properties: ImagePropertiesData | null;
  newTag: string;
  isEditing: boolean;
  isLoading: boolean;
  error: string | null;
  image: Image | null;
  
  // Actions
  setNewTag: (tag: string) => void;
  setIsEditing: (isEditing: boolean) => void;
  handlePropertyChange: (key: keyof ImagePropertiesData, value: any) => void;
  handleAddTag: () => void;
  handleRemoveTag: (tag: string) => void;
  handleSave: () => void;
  toggleEditing: () => void;
}

// Create the context with a default undefined value
export const ImagePropertiesContext = createContext<ImagePropertiesContextType | undefined>(undefined);

// Provider props
interface ImagePropertiesProviderProps {
  readonly children: ReactNode;
  readonly image: Image | null;
}

/**
 * Provider component for image properties context
 * 
 * This provider manages the state for image properties, including loading,
 * editing, and saving functionality.
 */
export function ImagePropertiesProvider({ children, image }: ImagePropertiesProviderProps) {
  const { dataset } = useEditorContext();
  
  const [properties, setProperties] = useState<ImagePropertiesData | null>(null);
  const [newTag, setNewTag] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load properties from localStorage if available
  useEffect(() => {
    if (!image) {
      setError("No image selected");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const savedProps = localStorage.getItem(`image-props:${image.path}`);
      if (savedProps) {
        setProperties(JSON.parse(savedProps));
      } else {
        // Initialize with default properties and image info
        setProperties({
          title: image.name || 'Untitled',
          description: '',
          tags: [],
          rating: 0,
          metadata: {
            path: image.path,
            directory: image.directory,
            url: image.url,
            datasetName: dataset?.name ?? undefined
          }
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading image properties:', error);
      setError("Failed to load properties");
      setIsLoading(false);
    }
  }, [image, dataset]);

  const handlePropertyChange = (key: keyof ImagePropertiesData, value: any) => {
    if (!properties) return;
    
    setProperties(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [key]: value
      };
    });
  };

  const handleAddTag = () => {
    if (!newTag.trim() || !properties) return;
    
    setProperties(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      };
    });
    setNewTag('');
  };

  const handleRemoveTag = (tag: string) => {
    if (!properties) return;
    
    setProperties(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        tags: prev.tags.filter(t => t !== tag)
      };
    });
  };

  const handleSave = () => {
    if (!image || !properties) return;
    
    // Save to localStorage for demo purposes
    localStorage.setItem(`image-props:${image.path}`, JSON.stringify(properties));
    setIsEditing(false);
  };

  const toggleEditing = () => setIsEditing(!isEditing);

  // Context value wrapped in useMemo
  const value = useMemo(() => ({
    properties,
    newTag,
    isEditing,
    isLoading,
    error,
    image,
    setNewTag,
    setIsEditing,
    handlePropertyChange,
    handleAddTag,
    handleRemoveTag,
    handleSave,
    toggleEditing
  }), [
    properties,
    newTag,
    isEditing,
    isLoading,
    error,
    image,
    // Functions don't need to be dependencies as they don't change between renders
  ]);

  return (
    <ImagePropertiesContext.Provider value={value}>
      {children}
    </ImagePropertiesContext.Provider>
  );
}

/**
 * Custom hook for accessing the image properties context
 * 
 * This hook ensures the context is used within the provider and provides
 * type safety for consuming components.
 */
export function useImagePropertiesContext() {
  const context = useContext(ImagePropertiesContext);
  
  if (context === undefined) {
    throw new Error('useImagePropertiesContext must be used within an ImagePropertiesProvider');
  }
  
  return context;
} 