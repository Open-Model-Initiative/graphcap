// SPDX-License-Identifier: Apache-2.0
import { Image, Dataset } from "@/services/images";
import { ImageEditor } from "../components/ImageEditor";
import {
  EditorContextProvider,
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
  useViewModeManager,
  useImageActions,
} from "../hooks";
import { ImageUploader } from "../components/ImageUploader";

interface EditorContainerProps {
  readonly directory?: string;
  readonly onClose?: () => void;
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
    setSelectedSubfolder,
    handleDatasetChange,
    handleCreateDataset,
    handleAddToDataset,
    handleUploadComplete,
  } = useDatasets();

  const {
    selectedImage,
    handleSaveProperties,
  } = useImageSelection(filteredImages);

  const {
    isEditing,
    handleEditImage: startEditing,
    handleSave,
    handleCancel,
  } = useImageEditor({ selectedDataset });

  const { showUploader, setShowUploader, handleToggleUploader } = useUploader();

  // Use our new custom hooks
  const { 
    handleEditImage, 
    handleDownload, 
    handleDelete, 
    handleUploadFinished 
  } = useImageActions({
    selectedImage,
    startEditing,
    onUploadComplete: () => {
      handleUploadComplete();
      setShowUploader(false);
    }
  });

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
        setShowUploader={setShowUploader}
      />
    </EditorContextProvider>
  );
}

interface EditorContainerInnerProps extends EditorContainerProps {
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
  readonly selectedDataset: string;
  readonly selectedSubfolder: string;
  readonly setSelectedSubfolder: (subfolder: string | null) => void;
  readonly handleDatasetChange: (dataset: string) => void;
  readonly handleCreateDataset: (name: string) => Promise<void>;
  readonly datasets: Dataset[];
  readonly handleEditImage: () => void;
  readonly setShowUploader: (visible: boolean) => void;
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
  setShowUploader,
}: EditorContainerInnerProps) {
  // Get viewMode and setViewMode from context
  const {
    viewMode,
    setViewMode,
    setSelectedImage: contextSetSelectedImage,
  } = useEditorContext();

  // Use our new custom hook for view mode management
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
                    datasetName={selectedDataset}
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
