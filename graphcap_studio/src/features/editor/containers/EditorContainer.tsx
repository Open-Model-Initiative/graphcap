// SPDX-License-Identifier: Apache-2.0
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Image, Dataset } from "@/services/images";
import { ImageEditor } from "../components/ImageEditor";
import {
  EditorContextProvider,
  ViewMode,
  useEditorContext,
} from "../context/EditorContext";
import { EditorLayout } from "../components/layout";
import { ImageViewerToggle } from "../components/ui";
import {
  ViewerContainer,
  NavigationContainer,
  PropertiesContainer,
} from "../components/containers";
import {
  useDatasets,
  useImageSelection,
  useImageEditor,
  useUploader,
} from "../hooks";
import { ImageUploader } from "../components/ImageUploader";

interface EditorContainerProps {
  directory?: string;
  onClose?: () => void;
}

/**
 * A container component that integrates the image editor with the gallery
 */
export function EditorContainer({ directory, onClose }: EditorContainerProps) {
  // Use our custom hooks for data fetching and state management
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
    handleUploadComplete,
  } = useDatasets();

  const {
    selectedImage,
    carouselIndex,
    setSelectedImage,
    handleSelectImage,
    handleSaveProperties,
  } = useImageSelection(filteredImages);

  const {
    isEditing,
    handleEditImage: startEditing,
    handleSave,
    handleCancel,
  } = useImageEditor({ selectedDataset });

  const { showUploader, setShowUploader, handleToggleUploader } = useUploader();

  // Track previous view mode to restore uploader state when switching back to grid
  const [wasUploaderVisible, setWasUploaderVisible] = useState(false);

  // Adapter for handleEditImage to work with our component interface
  const handleEditImage = () => {
    if (selectedImage) {
      startEditing(selectedImage);
    }
  };

  // Handle download action
  const handleDownload = () => {
    if (selectedImage) {
      // Implementation for download
      toast.success("Download started");
    }
  };

  // Handle delete action
  const handleDelete = () => {
    if (selectedImage) {
      // Implementation for delete
      toast.success("Image deleted");
    }
  };

  // Handle upload finished
  const handleUploadFinished = () => {
    handleUploadComplete();
    setShowUploader(false);
  };

  // Extract datasets array from datasetsData if available
  const datasets = datasetsData?.datasets || [];
  // Ensure currentDataset is a string
  const currentDatasetStr =
    typeof currentDataset === "string" ? currentDataset : "";
  // Ensure selectedDataset is a string
  const selectedDatasetStr =
    typeof selectedDataset === "string" ? selectedDataset : "";

  return (
    <EditorContextProvider
      initialDatasets={datasets}
      initialCurrentDataset={currentDatasetStr}
      initialViewMode="grid"
      onAddToDataset={handleAddToDataset}
      onEditImage={handleEditImage}
      onDownload={handleDownload}
      onDelete={handleDelete}
    >
      <EditorContainerInner
        directory={directory}
        onClose={onClose}
        filteredImages={filteredImages}
        isLoading={isLoading}
        isEmpty={filteredImages.length === 0}
        isEditing={isEditing}
        selectedImage={selectedImage}
        showUploader={showUploader}
        handleSave={handleSave}
        handleCancel={handleCancel}
        handleSaveProperties={handleSaveProperties}
        handleToggleUploader={handleToggleUploader}
        handleUploadFinished={handleUploadFinished}
        selectedDataset={selectedDatasetStr}
        selectedSubfolder={selectedSubfolder || ""}
        setSelectedSubfolder={setSelectedSubfolder}
        handleDatasetChange={handleDatasetChange}
        handleCreateDataset={async (name: string) => handleCreateDataset(name)}
        datasets={datasets}
        handleEditImage={handleEditImage}
        wasUploaderVisible={wasUploaderVisible}
        setWasUploaderVisible={setWasUploaderVisible}
        setShowUploader={setShowUploader}
      />
    </EditorContextProvider>
  );
}

interface EditorContainerInnerProps extends EditorContainerProps {
  filteredImages: Image[];
  isLoading: boolean;
  isEmpty: boolean;
  isEditing: boolean;
  selectedImage: Image | null;
  showUploader: boolean;
  handleSave: (editedImage: any) => void;
  handleCancel: () => void;
  handleSaveProperties: (metadata: Record<string, string>) => void;
  handleToggleUploader: () => void;
  handleUploadFinished: () => void;
  selectedDataset: string;
  selectedSubfolder: string;
  setSelectedSubfolder: (subfolder: string | null) => void;
  handleDatasetChange: (dataset: string) => void;
  handleCreateDataset: (name: string) => Promise<void>;
  datasets: Dataset[];
  handleEditImage: () => void;
  wasUploaderVisible: boolean;
  setWasUploaderVisible: (visible: boolean) => void;
  setShowUploader: (visible: boolean) => void;
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
  selectedDataset,
  selectedSubfolder,
  setSelectedSubfolder,
  handleDatasetChange,
  handleCreateDataset,
  datasets,
  handleEditImage,
  wasUploaderVisible,
  setWasUploaderVisible,
  setShowUploader,
}: EditorContainerInnerProps) {
  // Get viewMode and setViewMode from context
  const {
    viewMode,
    setViewMode,
    setSelectedImage: contextSetSelectedImage,
  } = useEditorContext();

  // Handle view mode changes to manage uploader visibility
  useEffect(() => {
    if (viewMode === "carousel" && showUploader) {
      // Save the current uploader state and hide it
      setWasUploaderVisible(true);
      setShowUploader(false);
    } else if (viewMode === "grid" && wasUploaderVisible) {
      // Restore uploader state when switching back to grid
      setShowUploader(true);
      setWasUploaderVisible(false);
    }
  }, [
    viewMode,
    showUploader,
    wasUploaderVisible,
    setWasUploaderVisible,
    setShowUploader,
  ]);

  // Ensure selected image is set when switching to carousel view
  useEffect(() => {
    if (
      viewMode === "carousel" &&
      filteredImages.length > 0 &&
      !selectedImage
    ) {
      // If no image is selected in carousel view, select the first one
      contextSetSelectedImage(filteredImages[0]);
    }
  }, [viewMode, filteredImages, selectedImage, contextSetSelectedImage]);

  // Handle view mode toggle with additional logic
  const handleViewModeToggle = (mode: ViewMode) => {
    // Always update the context's viewMode
    setViewMode(mode);

    // If switching to carousel and we have a selected image, make sure it's visible
    if (mode === "carousel") {
      if (!selectedImage && filteredImages.length > 0) {
        // If no image is selected, select the first one
        contextSetSelectedImage(filteredImages[0]);
      }
    } else if (mode === "grid" && selectedImage) {
      // When switching to grid, maintain the selected image

      // Force a refresh of the selected image to ensure it's displayed correctly
      const currentImage = selectedImage;
      contextSetSelectedImage(null);
      setTimeout(() => {
        contextSetSelectedImage(currentImage);
      }, 50);
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-gray-900 text-white">
      <EditorLayout
        navigation={
          <NavigationContainer
            datasets={datasets}
            selectedDataset={selectedDataset}
            selectedSubfolder={selectedSubfolder}
            onSelectDataset={handleDatasetChange}
            onSelectSubfolder={setSelectedSubfolder}
            onCreateDataset={handleCreateDataset}
          />
        }
        viewer={
          <div className="h-full w-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
              <div className="flex items-center space-x-4">
                <h4 className="text-xl font-semibold">Image Editor</h4>
                <ImageViewerToggle onToggle={handleViewModeToggle} />
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

            <div className="flex-grow overflow-hidden">
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
            </div>
          </div>
        }
        properties={<PropertiesContainer />}
      />

      {/* Image uploader modal */}
      {showUploader && (
        <ImageUploader
          datasetName={selectedDataset}
          onUploadComplete={handleUploadFinished}
          className="w-full"
        />
      )}
    </div>
  );
}
