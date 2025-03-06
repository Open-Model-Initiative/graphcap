// SPDX-License-Identifier: Apache-2.0
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { Image, Dataset, listDatasetImages } from '@/services/images';
import { ImageEditor } from '../components/ImageEditor';
import { ImageGallery } from '../components/ImageGallery';
import { DatasetTree } from '../components/DatasetTree';
import { ImageProperties } from '../components/ImageProperties';

interface EditorContainerProps {
  directory?: string;
  onClose?: () => void;
}

/**
 * A container component that integrates the image editor with the gallery
 */
export function EditorContainer({ directory, onClose }: EditorContainerProps) {
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [selectedSubfolder, setSelectedSubfolder] = useState<string | null>(null);
  const [showProperties, setShowProperties] = useState(false);

  // Fetch datasets
  const { data: datasetsData, isLoading, error } = useQuery({
    queryKey: ['datasets'],
    queryFn: listDatasetImages,
  });

  // Set the first dataset as selected by default
  useEffect(() => {
    if (datasetsData?.datasets && datasetsData.datasets.length > 0 && !selectedDataset) {
      setSelectedDataset(datasetsData.datasets[0].name);
    }
  }, [datasetsData, selectedDataset]);

  const handleSelectImage = (image: Image) => {
    setSelectedImage(image);
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

  // Find the currently selected dataset
  const currentDataset = datasetsData?.datasets?.find(d => d.name === selectedDataset);
  
  // Filter images by subfolder if selected
  const filteredImages = currentDataset?.images.filter(image => {
    if (!selectedSubfolder) return true;
    return image.directory.includes(selectedSubfolder);
  }) || [];

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
        <div className="rounded-lg bg-red-900/20 p-6 text-center">
          <h3 className="mb-2 text-lg font-medium text-red-400">Error Loading Datasets</h3>
          <p className="text-red-300">{error instanceof Error ? error.message : 'Unknown error'}</p>
          <p className="mt-4 text-sm text-red-400">Please check your connection and try again</p>
        </div>
      </div>
    );
  }

  // Handle the case when no datasets are found
  if (!datasetsData?.datasets || datasetsData.datasets.length === 0) {
    return (
      <div className="flex h-full w-full flex-col bg-gray-900 text-white">
        <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800 p-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-medium">Image Editor</span>
          </div>
          {onClose && (
            <button
              className="rounded bg-gray-700 px-3 py-1 text-gray-200 hover:bg-gray-600"
              onClick={onClose}
            >
              Close
            </button>
          )}
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="rounded-lg bg-yellow-900/20 p-6 text-center">
            <h3 className="mb-2 text-lg font-medium text-yellow-400">No Datasets Found</h3>
            <p className="text-yellow-300">
              No image datasets were found in the workspace. Please add images to the datasets directory.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-gray-900 text-white">
      {/* Compact Header */}
      <div className="flex-shrink-0 flex items-center justify-between border-b border-gray-700 bg-gray-800 p-2">
        <div className="flex items-center space-x-4">
          <span className="text-lg font-medium">Image Editor</span>
          {selectedImage && (
            <span className="text-sm text-gray-400 truncate max-w-md">
              {selectedImage.name}
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          {selectedImage && !isEditing && (
            <button
              className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
              onClick={handleEditImage}
            >
              Edit
            </button>
          )}
          {selectedImage && (
            <button
              className="rounded bg-gray-700 px-3 py-1 text-gray-200 hover:bg-gray-600"
              onClick={handleToggleProperties}
            >
              {showProperties ? 'Hide Info' : 'Show Info'}
            </button>
          )}
          {onClose && (
            <button
              className="rounded bg-gray-700 px-3 py-1 text-gray-200 hover:bg-gray-600"
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
        <div className="w-[20%] min-w-[200px] max-w-[300px] flex-shrink-0 overflow-hidden flex flex-col border-r border-gray-700 bg-gray-800">
          <div className="sticky top-0 z-10 border-b border-gray-700 bg-gray-800 p-3 flex-shrink-0">
            <h2 className="text-base font-medium">Datasets</h2>
          </div>
          <div className="p-3 overflow-auto flex-1">
            <DatasetTree 
              datasets={datasetsData.datasets} 
              selectedDataset={selectedDataset}
              selectedSubfolder={selectedSubfolder}
              onSelectNode={handleDatasetChange}
            />
          </div>
        </div>

        {/* Center - Image gallery or editor */}
        <div className="relative flex-1 overflow-hidden bg-gray-900">
          <div className="absolute inset-0 overflow-hidden">
            {isEditing && selectedImage ? (
              <ImageEditor
                imagePath={selectedImage.path}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            ) : (
              <ImageGallery 
                images={filteredImages} 
                onSelectImage={handleSelectImage}
                selectedImage={selectedImage}
                isLoading={isLoading}
                isEmpty={filteredImages.length === 0}
              />
            )}
          </div>
        </div>

        {/* Right sidebar - Properties panel */}
        {showProperties && selectedImage && (
          <div className="w-[25%] min-w-[250px] max-w-[400px] flex-shrink-0 overflow-hidden flex flex-col border-l border-gray-700 bg-gray-800">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-700 bg-gray-800 p-3 flex-shrink-0">
              <h2 className="text-base font-medium">Properties</h2>
              <button
                onClick={handleToggleProperties}
                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
              >
                <span className="sr-only">Close panel</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="p-3 overflow-auto flex-1">
              <ImageProperties 
                image={selectedImage} 
                onSave={handleSaveProperties}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 