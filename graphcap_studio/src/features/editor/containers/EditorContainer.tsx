// SPDX-License-Identifier: Apache-2.0
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Image, listDatasetImages, preloadImage,  addImageToDataset, createDataset } from '@/services/images';
import { ImageEditor } from '../components/ImageEditor';
import { EditorContextProvider, useEditorContext, ViewMode } from '../context/EditorContext';
import { EditorLayout } from '../components/layout';
import { ImageViewerToggle } from '../components/ui';
import { 
  ViewerContainer, 
  NavigationContainer, 
  PropertiesContainer 
} from '../components/containers';

interface EditorContainerProps {
  directory?: string;
  onClose?: () => void;
}

// Query keys for caching
const QUERY_KEYS = {
  datasets: ['datasets'],
  datasetImages: (datasetName: string) => ['datasets', datasetName, 'images'],
};

/**
 * A container component that integrates the image editor with the gallery
 */
export function EditorContainer({ directory, onClose }: EditorContainerProps) {
  return (
    <EditorContextProvider>
      <EditorContainerInner directory={directory} onClose={onClose} />
    </EditorContextProvider>
  );
}

/**
 * Inner component that uses the EditorContext
 */
function EditorContainerInner({ directory, onClose }: EditorContainerProps) {
  const { viewMode, setViewMode } = useEditorContext();
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [selectedSubfolder, setSelectedSubfolder] = useState<string | null>(null);
  const [showProperties, setShowProperties] = useState(true);
  const [isCreateDatasetModalOpen, setIsCreateDatasetModalOpen] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  
  // Get query client for prefetching and cache management
  const queryClient = useQueryClient();

  // Fetch datasets with improved caching
  const { 
    data: datasetsData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: QUERY_KEYS.datasets,
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

  // Preload images for better performance
  const preloadImages = useCallback((images: Image[], count = 10) => {
    // Preload the first N images as thumbnails
    images.slice(0, count).forEach(image => {
      preloadImage(image.path, 'thumbnail');
    });
    
    // If we have a selected image, preload it at full resolution
    if (selectedImage) {
      preloadImage(selectedImage.path, 'full');
    }
  }, [selectedImage]);

  // Preload images when dataset changes
  useEffect(() => {
    if (filteredImages.length > 0) {
      preloadImages(filteredImages);
    }
  }, [filteredImages, preloadImages]);

  // Set carousel index to match selected image
  useEffect(() => {
    if (selectedImage && filteredImages.length > 0) {
      const index = filteredImages.findIndex(img => img.path === selectedImage.path);
      if (index !== -1) {
        setCarouselIndex(index);
      }
    }
  }, [selectedImage, filteredImages]);

  // Ensure selected image is set when switching to carousel view
  useEffect(() => {
    if (viewMode === 'carousel' && filteredImages.length > 0 && !selectedImage) {
      // If no image is selected in carousel view, select the first one
      setSelectedImage(filteredImages[0]);
    }
  }, [viewMode, filteredImages, selectedImage]);

  const handleSelectImage = (image: Image) => {
    setSelectedImage(image);
    
    // Find the index of the selected image for carousel view
    const index = filteredImages.findIndex(img => img.path === image.path);
    if (index !== -1) {
      setCarouselIndex(index);
    }
    
    // Preload the full-size image
    preloadImage(image.path, 'full');
    
    // Show properties panel when an image is selected
    setShowProperties(true);
  };

  const handleEditImage = () => {
    if (selectedImage) {
      setIsEditing(true);
    } else {
      toast.error('Please select an image to edit');
    }
  };

  const handleSave = () => {
    toast.success('Image saved successfully');
    setIsEditing(false);
    
    // Invalidate cache for this dataset to refresh the images
    if (selectedDataset) {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.datasetImages(selectedDataset) });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleDatasetChange = (datasetName: string, subfolder?: string) => {
    setSelectedDataset(datasetName);
    setSelectedSubfolder(subfolder || null);
    setSelectedImage(null);
    setIsEditing(false);
    setShowProperties(false);
    
    // Prefetch images for the selected dataset
    if (datasetsData?.datasets) {
      const dataset = datasetsData.datasets.find(d => d.name === datasetName);
      if (dataset) {
        // Preload the first few images
        preloadImages(dataset.images);
      }
    }
  };

  const handleToggleProperties = () => {
    // In carousel view, we don't want to hide properties completely
    if (viewMode === 'carousel' && showProperties) {
      // Instead of hiding properties, we could minimize them or show a notification
      toast.info('Properties panel is always visible in carousel view');
      return;
    }
    
    setShowProperties(!showProperties);
  };

  const handleSaveProperties = (properties: Record<string, any>) => {
    if (!selectedImage) return;
    
    // In a real implementation, this would save to a JSON file or database
    toast.success('Properties saved successfully');
    console.log('Saving properties for image:', selectedImage.path, properties);
  };

  /**
   * Handle adding an image to a dataset
   */
  const handleAddToDataset = async (imagePath: string, targetDataset: string) => {
    if (!imagePath || !targetDataset) return;
    
    try {
      const result = await addImageToDataset(imagePath, targetDataset);
      
      if (result.success) {
        toast.success(result.message);
        
        // Invalidate queries to refresh the datasets
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.datasets });
        if (selectedDataset) {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.datasetImages(selectedDataset) });
        }
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.datasetImages(targetDataset) });
        
        // Force a refresh after a short delay
        setTimeout(() => {
          queryClient.refetchQueries({ queryKey: QUERY_KEYS.datasets });
        }, 500);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to add image to dataset');
      console.error('Error adding image to dataset:', error);
    }
  };

  const handleSetViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    
    // If switching to carousel and we have a selected image, make sure it's visible
    if (mode === 'carousel') {
      if (!selectedImage && filteredImages.length > 0) {
        // If no image is selected, select the first one
        setSelectedImage(filteredImages[0]);
      }
      // Always ensure properties are visible in carousel mode
      setShowProperties(true);
    } else if (mode === 'grid' && selectedImage) {
      // When switching to grid, maintain the selected image and properties panel
      setShowProperties(true);
      
      // Force a refresh of the selected image to ensure it's displayed correctly
      const currentImage = selectedImage;
      setSelectedImage(null);
      setTimeout(() => {
        setSelectedImage(currentImage);
      }, 50);
    }
  };

  const handleCreateDataset = useCallback(async (name: string): Promise<void> => {
    try {
      await createDataset(name);
      
      // Invalidate the datasets cache
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.datasets });
      
      toast.success(`Created dataset ${name}`);
    } catch (error) {
      console.error('Failed to create dataset:', error);
      toast.error(`Failed to create dataset: ${(error as Error).message}`);
      throw error;
    }
  }, [queryClient]);

  const handleUploadComplete = () => {
    // Invalidate both the datasets query and the specific dataset query to refresh the list
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.datasets });
    if (selectedDataset) {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.datasetImages(selectedDataset) });
    }
    
    // Force a refresh after a short delay to ensure the UI updates
    setTimeout(() => {
      queryClient.refetchQueries({ queryKey: QUERY_KEYS.datasets });
    }, 500);
  };

  const handleToggleUploader = () => {
    setShowUploader(!showUploader);
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-900 text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-900">
        <div className="max-w-md rounded-lg bg-red-900/20 p-6 text-center">
          <h3 className="text-lg font-medium text-red-400">Error loading images</h3>
          <p className="mt-2 text-sm text-gray-300">
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
          <button
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isEditing && selectedImage) {
    return (
      <div className="flex h-full w-full flex-col bg-gray-900">
        <div className="flex h-12 items-center justify-between border-b border-gray-700 bg-gray-800 px-4">
          <h2 className="text-lg font-medium text-white">
            Editing: {selectedImage.name}
          </h2>
          <div className="flex space-x-2">
            <button
              className="rounded-md bg-gray-700 px-3 py-1 text-sm text-white hover:bg-gray-600"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-500"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <ImageEditor imagePath={selectedImage.path} onSave={handleSave} onCancel={handleCancel} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header with actions */}
      <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800 p-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-white">Image Gallery</h1>
          
          {/* View mode toggle */}
          <ImageViewerToggle
            viewMode={viewMode}
            onToggle={setViewMode}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Upload button */}
          <button
            className="rounded bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700"
            onClick={handleToggleUploader}
          >
            Upload Images
          </button>
          
          {/* Properties toggle */}
          <button
            className={`rounded px-3 py-1 text-sm font-medium ${
              showProperties
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={handleToggleProperties}
          >
            {showProperties ? 'Hide Properties' : 'Show Properties'}
          </button>
          
          {/* Close button */}
          {onClose && (
            <button
              className="rounded bg-gray-700 px-3 py-1 text-sm font-medium text-white hover:bg-gray-600"
              onClick={onClose}
            >
              Close
            </button>
          )}
        </div>
      </div>
      
      {/* Main content with resizable layout */}
      <div className="flex-1 overflow-hidden">
        <EditorLayout
          navigation={
            <NavigationContainer
              datasets={datasetsData?.datasets || []}
              selectedDataset={selectedDataset}
              selectedSubfolder={selectedSubfolder}
              onSelectDataset={handleDatasetChange}
              onSelectSubfolder={setSelectedSubfolder}
              onCreateDataset={handleCreateDataset}
              isLoading={isLoading}
            />
          }
          viewer={
            <ViewerContainer
              images={filteredImages}
              selectedImage={selectedImage}
              onSelectImage={handleSelectImage}
              onEditImage={handleEditImage}
              onAddToDataset={selectedImage && selectedDataset ? 
                () => handleAddToDataset(selectedImage.path, selectedDataset) : undefined}
              isLoading={isLoading}
              isEmpty={filteredImages.length === 0}
            />
          }
          properties={
            <PropertiesContainer
              selectedImage={selectedImage}
              datasets={datasetsData?.datasets || []}
              onAddToDataset={(image, datasetName) => handleAddToDataset(image.path, datasetName)}
              onEditImage={handleEditImage}
            />
          }
          showProperties={showProperties}
        />
      </div>
    </div>
  );
} 