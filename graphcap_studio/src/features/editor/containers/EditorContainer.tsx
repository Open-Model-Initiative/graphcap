// SPDX-License-Identifier: Apache-2.0
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { Image, Dataset, listDatasetImages } from '@/services/images';
import { ImageEditor } from '../components/ImageEditor';
import { ImageGallery } from '../components/ImageGallery';

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
    setIsEditing(true);
  };

  const handleSave = () => {
    toast.success('Image saved successfully');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleDatasetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDataset(e.target.value);
  };

  // Find the currently selected dataset
  const currentDataset = datasetsData?.datasets?.find(d => d.name === selectedDataset);
  
  // Get images from the current dataset or use an empty array if not available
  const currentImages = currentDataset?.images || [];

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <h3 className="mb-2 text-lg font-medium text-red-800">Error Loading Datasets</h3>
          <p className="text-red-600">{error instanceof Error ? error.message : 'Unknown error'}</p>
          <p className="mt-4 text-sm text-red-500">Please check your connection and try again</p>
        </div>
      </div>
    );
  }

  // Handle the case when no datasets are found
  if (!datasetsData?.datasets || datasetsData.datasets.length === 0) {
    return (
      <div className="flex h-full w-full flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h1 className="text-2xl font-bold">Image Editor</h1>
          {onClose && (
            <button
              className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
              onClick={onClose}
            >
              Close
            </button>
          )}
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="rounded-lg bg-yellow-50 p-6 text-center">
            <h3 className="mb-2 text-lg font-medium text-yellow-800">No Datasets Found</h3>
            <p className="text-yellow-600">
              No image datasets were found in the workspace. Please add images to the datasets directory.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">Image Editor</h1>
          {!isEditing && (
            <div className="flex items-center space-x-2">
              <label htmlFor="dataset-select" className="text-sm font-medium text-gray-700">
                Dataset:
              </label>
              <select
                id="dataset-select"
                value={selectedDataset || ''}
                onChange={handleDatasetChange}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm"
              >
                {datasetsData.datasets.map((dataset) => (
                  <option key={dataset.name} value={dataset.name}>
                    {dataset.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        {onClose && (
          <button
            className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
            onClick={onClose}
          >
            Close
          </button>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {isEditing && selectedImage ? (
          <ImageEditor
            imagePath={selectedImage.path}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <ImageGallery 
            images={currentImages} 
            onSelectImage={handleSelectImage} 
            isLoading={isLoading}
            isEmpty={currentImages.length === 0}
          />
        )}
      </div>
    </div>
  );
} 