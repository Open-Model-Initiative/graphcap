// SPDX-License-Identifier: Apache-2.0
import { Image, Dataset } from "@/services/images";
import { ImageEditor } from "../components/ImageEditor";
import { useEditorContext, ViewMode } from "../context/EditorContext";
import { EditorLayout } from "../components/layout";
import { ViewerContainer, PropertiesContainer } from "../components/containers";
import {
  useImageSelection,
  useImageEditor,
  useUploader,
  useViewModeManager,
  useImageActions,
} from "../hooks";
import { ImageUploader } from "../components/ImageUploader";
import { DatasetContainer } from "@/features/datasets";
import { useEffect } from "react";

interface EditorContainerProps {
  readonly directory?: string;
  readonly onClose?: () => void;
  readonly dataset: Dataset | null;
  readonly onUploadComplete?: () => void;
}

/**
 * A container component that integrates the image editor with the gallery
 */
export function EditorContainer({ 
  directory, 
  onClose, 
  dataset, 
  onUploadComplete 
}: EditorContainerProps) {
  // Get context from EditorContext
  const { selectedImage, setSelectedImage } = useEditorContext();
  
  // Get images from the dataset
  const images = dataset?.images || [];
  
  // Filter images by directory if provided
  const filteredImages = directory 
    ? images.filter(image => image.directory.includes(directory))
    : images;

  const {
    selectedImage: selectedImageFromHook,
    handleSaveProperties,
  } = useImageSelection(filteredImages, selectedImage, setSelectedImage);

  const {
    isEditing,
    handleEditImage: startEditing,
    handleSave,
    handleCancel,
  } = useImageEditor({ selectedDataset: dataset?.name || '' });

  const { showUploader, setShowUploader, handleToggleUploader } = useUploader();

  // Use our custom hooks
  const { 
    handleEditImage, 
    handleDownload, 
    handleDelete, 
    handleUploadFinished 
  } = useImageActions({
    selectedImage: selectedImageFromHook,
    startEditing,
    onUploadComplete: () => {
      if (onUploadComplete) {
        onUploadComplete();
      }
      setShowUploader(false);
    }
  });

  return (
    <EditorContainerInner
      directory={directory}
      onClose={onClose}
      filteredImages={filteredImages}
      isLoading={false}
      isEmpty={filteredImages.length === 0}
      isEditing={isEditing}
      selectedImage={selectedImageFromHook}
      showUploader={showUploader}
      handleSave={handleSave}
      handleCancel={handleCancel}
      handleSaveProperties={handleSaveProperties}
      handleToggleUploader={handleToggleUploader}
      handleUploadFinished={handleUploadFinished}
      handleEditImage={handleEditImage}
      setShowUploader={setShowUploader}
      selectedDatasetName={dataset?.name || ''}
    />
  );
}

interface EditorContainerInnerProps extends Omit<EditorContainerProps, 'dataset' | 'onUploadComplete'> {
  readonly filteredImages: Image[];
  readonly isLoading: boolean;
  readonly isEmpty: boolean;
  readonly isEditing: boolean;
  readonly selectedImage: Image | null;
  readonly showUploader: boolean;
  readonly handleSave: (editedImage: any) => void;
  readonly handleCancel: () => void;
  readonly handleSaveProperties: (metadata: Record<string, string>) => void;
  readonly handleToggleUploader: () => void;
  readonly handleUploadFinished: () => void;
  readonly handleEditImage: () => void;
  readonly setShowUploader: (visible: boolean) => void;
  readonly selectedDatasetName: string;
}

/**
 * Inner component that uses the EditorContext
 */
function EditorContainerInner({
  directory,
  onClose,
  filteredImages,
  isLoading,
  isEmpty,
  isEditing,
  selectedImage,
  showUploader,
  handleSave,
  handleCancel,
  handleSaveProperties,
  handleToggleUploader,
  handleUploadFinished,
  handleEditImage,
  setShowUploader,
  selectedDatasetName,
}: EditorContainerInnerProps) {
  // Get viewMode and setViewMode from context
  const {
    viewMode,
    setViewMode,
    setSelectedImage: contextSetSelectedImage,
  } = useEditorContext();

  // Use our custom hook for view mode management
  const { 
    handleViewModeToggle 
  } = useViewModeManager({
    viewMode,
    setViewMode,
    showUploader,
    setShowUploader,
    filteredImages,
    selectedImage,
    setSelectedImage: contextSetSelectedImage
  });

  // Toggle between grid and carousel view
  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'carousel' : 'grid');
  };

  return (
    <div className="h-full w-full flex flex-col bg-gray-900 text-white">
      <EditorLayout
        navigation={
          <DatasetContainer className="h-full" />
        }
        viewer={
          <div className="h-full w-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
              <div className="flex items-center space-x-4">
                <h4 className="text-xl font-semibold">Image Editor</h4>
                <button
                  onClick={toggleViewMode}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                >
                  {viewMode === 'grid' ? 'Carousel View' : 'Grid View'}
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleToggleUploader}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                >
                  Upload Images
                </button>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>

            <div className="flex-grow relative">
              {/* Main content area */}
              {isEditing && selectedImage ? (
                <ImageEditor
                  imagePath={selectedImage.path}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              ) : (
                <ViewerContainer
                  images={filteredImages}
                  isLoading={isLoading}
                  isEmpty={isEmpty}
                />
              )}

              {/* Image uploader overlay */}
              {showUploader && (
                <div className="absolute inset-0 bg-gray-900/80 z-10 flex items-center justify-center p-8">
                  <ImageUploader
                    datasetName={selectedDatasetName}
                    onUploadComplete={handleUploadFinished}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>
        }
        properties={
          <PropertiesContainer className="h-full" />
        }
      />
    </div>
  );
}
