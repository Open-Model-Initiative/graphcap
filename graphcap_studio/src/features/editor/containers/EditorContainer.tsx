// SPDX-License-Identifier: Apache-2.0
import { useState } from 'react';
import { toast } from 'sonner';
import { Image } from '@/services/images';
import { ImageEditor } from '../components/ImageEditor';
import { EditorContextProvider, useEditorContext } from '../context/EditorContext';
import { EditorLayout } from '../components/layout';
import { ImageViewerToggle } from '../components/ui';
import { 
  ViewerContainer, 
  NavigationContainer, 
  PropertiesContainer 
} from '../components/containers';
import {
  useDatasets,
  useImageSelection,
  useImageEditor,
  useViewMode,
  useUploader
} from '../hooks';

interface EditorContainerProps {
  directory?: string;
  onClose?: () => void;
}

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
  // Use our custom hooks
  const {
    selectedDataset,
    selectedSubfolder,
    datasetsData,
    currentDataset,
    filteredImages,
    isLoading,
    error,
    setSelectedSubfolder,
    handleDatasetChange,
    handleCreateDataset,
    handleAddToDataset,
    handleUploadComplete
  } = useDatasets();

  const {
    selectedImage,
    carouselIndex,
    showProperties,
    setSelectedImage,
    setShowProperties,
    handleSelectImage,
    handleToggleProperties,
    handleSaveProperties
  } = useImageSelection(filteredImages);

  const {
    isEditing,
    handleEditImage: startEditing,
    handleSave,
    handleCancel
  } = useImageEditor({ selectedDataset });

  const { showUploader, handleToggleUploader } = useUploader();

  // Adapter for handleEditImage to work with our component interface
  const handleEditImage = () => {
    startEditing(selectedImage);
  };

  // Use the view mode hook
  const { viewMode, setViewMode } = useViewMode({
    selectedImage,
    setSelectedImage,
    filteredImages,
    setShowProperties
  });

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
        <div className="flex h-8 items-center justify-between border-b border-gray-700 bg-gray-800 px-2">
          <h2 className="text-sm font-medium text-white">
            Editing: {selectedImage.name}
          </h2>
          <div className="flex space-x-1">
            <button
              className="rounded-md bg-gray-700 px-2 py-0.5 text-xs text-white hover:bg-gray-600"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              className="rounded-md bg-blue-600 px-2 py-0.5 text-xs text-white hover:bg-blue-500"
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
      {/* Header with actions - more compact */}
      <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-2 py-1">
        <div className="flex items-center space-x-2">
          <h4 className="text-base font-medium text-white">Image Gallery</h4>
          
          {/* View mode toggle */}
          <ImageViewerToggle
            viewMode={viewMode}
            onToggle={setViewMode}
            className="scale-90"
          />
        </div>
        
        <div className="flex items-center space-x-1">
          {/* Upload button - more compact */}
          <button
            className="rounded bg-green-600 px-2 py-0.5 text-xs font-medium text-white hover:bg-green-700"
            onClick={handleToggleUploader}
            title="Upload Images"
          >
            Upload
          </button>
          
          {/* Properties toggle - more compact */}
          <button
            className={`rounded px-2 py-0.5 text-xs font-medium ${
              showProperties
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={handleToggleProperties}
            title={showProperties ? "Hide Properties Panel" : "Show Properties Panel"}
          >
            {showProperties ? 'Hide Props' : 'Show Props'}
          </button>
          
          {/* Close button - more compact */}
          {onClose && (
            <button
              className="rounded bg-gray-700 px-2 py-0.5 text-xs font-medium text-white hover:bg-gray-600"
              onClick={onClose}
              title="Close Editor"
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