// SPDX-License-Identifier: Apache-2.0
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Image, Dataset, listDatasetImages, preloadImage, getThumbnailUrl } from '@/services/images';
import { ImageEditor } from '../components/ImageEditor';
import { ImageGallery } from '../components/ImageGallery';
import { DatasetTree } from '../components/DatasetTree';
import { ImageProperties } from '../components/ImageProperties';
import { EditorContextProvider, useEditorContext, ViewMode } from '../context/EditorContext';

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
  const [showProperties, setShowProperties] = useState(false);
  
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

  const handleSelectImage = (image: Image) => {
    setSelectedImage(image);
    setShowProperties(true);
    
    // Preload the full-size image
    preloadImage(image.path, 'full');
    
    // Prefetch adjacent images
    const currentIndex = filteredImages.findIndex(img => img.path === image.path);
    if (currentIndex !== -1) {
      // Preload next 3 images
      for (let i = 1; i <= 3; i++) {
        const nextIndex = currentIndex + i;
        if (nextIndex < filteredImages.length) {
          preloadImage(filteredImages[nextIndex].path, 'thumbnail');
        }
      }
      
      // Preload previous 3 images
      for (let i = 1; i <= 3; i++) {
        const prevIndex = currentIndex - i;
        if (prevIndex >= 0) {
          preloadImage(filteredImages[prevIndex].path, 'thumbnail');
        }
      }
    }
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
    setShowProperties(!showProperties);
  };

  const handleSaveProperties = (properties: Record<string, any>) => {
    if (!selectedImage) return;
    
    // In a real implementation, this would save to a JSON file or database
    toast.success('Properties saved successfully');
    console.log('Saving properties for image:', selectedImage.path, properties);
  };

  const handleSetViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    
    // If switching to carousel and we have a selected image, make sure it's visible
    if (mode === 'carousel' && !selectedImage && filteredImages.length > 0) {
      // If no image is selected, select the first one
      setSelectedImage(filteredImages[0]);
      setShowProperties(true);
    }
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
    <div className="flex h-full w-full flex-col bg-gray-900">
      {/* Header */}
      <div className="flex h-12 items-center justify-between border-b border-gray-700 bg-gray-800 px-4">
        <h2 className="text-lg font-medium text-white">Image Editor</h2>
        <div className="flex space-x-2">
          {/* View mode toggle buttons with icons */}
          <div className="flex rounded-md overflow-hidden border border-gray-600">
            <button
              className={`flex items-center justify-center p-2 text-white transition-colors ${
                viewMode === 'grid' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              onClick={() => handleSetViewMode('grid')}
              title="Grid View"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              className={`flex items-center justify-center p-2 text-white transition-colors ${
                viewMode === 'carousel' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              onClick={() => handleSetViewMode('carousel')}
              title="Carousel View"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21V3" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 21V3" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18" />
              </svg>
            </button>
          </div>
          
          {selectedImage && (
            <>
              <button
                className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-500"
                onClick={handleEditImage}
              >
                Edit Image
              </button>
              <button
                className={`rounded-md px-3 py-1 text-sm text-white ${
                  showProperties ? 'bg-purple-600 hover:bg-purple-500' : 'bg-gray-700 hover:bg-gray-600'
                }`}
                onClick={handleToggleProperties}
              >
                {showProperties ? 'Hide Properties' : 'Show Properties'}
              </button>
            </>
          )}
          {onClose && (
            <button
              className="rounded-md bg-gray-700 px-3 py-1 text-sm text-white hover:bg-gray-600"
              onClick={onClose}
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Dataset tree */}
        <div className="w-64 overflow-auto border-r border-gray-700 bg-gray-800">
          <DatasetTree
            datasets={datasetsData?.datasets || []}
            selectedDataset={selectedDataset}
            selectedSubfolder={selectedSubfolder}
            onSelectNode={handleDatasetChange}
          />
        </div>

        {/* Main content - Image gallery */}
        <div className={`flex-1 overflow-hidden ${showProperties ? 'flex' : ''}`}>
          <div className={showProperties ? 'flex-1' : 'w-full h-full'}>
            <ImageGallery
              images={filteredImages}
              onSelectImage={handleSelectImage}
              selectedImage={selectedImage}
              isLoading={isLoading}
              isEmpty={filteredImages.length === 0}
            />
          </div>

          {/* Right sidebar - Image properties */}
          {showProperties && selectedImage && (
            <div className="w-80 overflow-auto border-l border-gray-700 bg-gray-800">
              <ImageProperties
                image={selectedImage}
                onSave={handleSaveProperties}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 