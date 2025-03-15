// SPDX-License-Identifier: Apache-2.0
import { Dataset } from "@/services/images";
import { ImageEditor } from "../components/ImageEditor";
import { useEditorContext } from "@/features/editor/context/EditorContext";
import { EditorLayout } from "@/pages/gallery/GalleryLayout";
import { ViewerContainer } from "@/features/gallery-viewer";
import { PropertiesContainer } from "@/features/image-properties";
import {
  useImageEditor,
  useImageActions,
} from "../hooks";

interface EditorContainerProps {
  readonly directory?: string;
  readonly onClose?: () => void;
  readonly dataset: Dataset | null;
}

/**
 * A container component that integrates the image editor with the gallery
 */
export function EditorContainer({ 
  directory, 
  onClose, 
  dataset
}: EditorContainerProps) {
  // Get context from EditorContext
  const { selectedImage, setSelectedImage } = useEditorContext();
  
  // Get images from the dataset
  const images = dataset?.images || [];
  
  // Filter images by directory if provided
  const filteredImages = directory 
    ? images.filter(img => img.directory === directory)
    : images;
  
  // Use custom hooks for image editing and actions
  const { isEditing, handleSave, handleCancel, handleEditImage: startEditing } = useImageEditor({
    selectedDataset: dataset?.name ?? null
  });
  
  const { handleEditImage, handleDownload, handleDelete } = useImageActions({
    selectedImage,
    startEditing
  });
  
  // Determine if the gallery is empty or loading
  const isLoading = false; // Replace with actual loading state if needed
  const isEmpty = filteredImages.length === 0;

  return (
    <div className="h-full w-full flex flex-col bg-gray-900 text-white">
      <EditorLayout
        viewer={
          <div className="h-full w-full flex flex-col">
            <div className="flex-grow relative">
              {/* Main content area */}
              {isEditing && selectedImage ? (
                <ImageEditor
                  imagePath={selectedImage.path}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              ) : (
                <>
                  {/* Image gallery */}
                  <ViewerContainer
                    images={filteredImages}
                    isLoading={isLoading}
                    isEmpty={isEmpty}
                    selectedImage={selectedImage}
                    onImageSelected={setSelectedImage}
                    onEditImage={handleEditImage}
                    onAddToDataset={(imagePath, datasetName) => {
                      // Implement add to dataset functionality
                      console.log(`Add ${imagePath} to ${datasetName}`);
                    }}
                    onDownload={handleDownload}
                    onDelete={handleDelete}
                    title="Image Editor"
                    onClose={onClose}
                  />
                </>
              )}
            </div>
          </div>
        }
        properties={
          <PropertiesContainer
            selectedImage={selectedImage}
            className="h-full"
          />
        }
      />
    </div>
  );
}


