// SPDX-License-Identifier: Apache-2.0
import { useEffect } from 'react';
import { EditorContainer } from '@/features/editor/containers/EditorContainer';
import { GalleryContextProvider, useGalleryContext } from './GalleryContext';
import { DatasetContextProvider } from '@/features/datasets/context/DatasetContext';
import { EditorContextProvider } from '@/features/editor/context/EditorContext';

/**
 * Inner component that uses the GalleryContext to coordinate between
 * the DatasetContext and EditorContext
 */
function GalleryContainerInner() {
  const {
    selectedDataset,
    selectedSubfolder,
    datasets,
    currentDataset,
    filteredImages,
    isLoading,
    handleAddToDataset,
    handleCreateDataset,
    handleSelectDataset,
    handleUploadComplete,
  } = useGalleryContext();

  return (
    <DatasetContextProvider
      initialDatasets={datasets}
      initialCurrentDataset={selectedDataset || ''}
      initialSelectedSubfolder={selectedSubfolder}
      onAddToDataset={handleAddToDataset}
      onCreateDataset={handleCreateDataset}
      onDatasetSelected={handleSelectDataset}
    >
      <EditorContextProvider dataset={currentDataset}>
        <div className="h-full w-full overflow-hidden">
          <EditorContainer 
            dataset={currentDataset} 
            directory={selectedSubfolder || undefined}
            onUploadComplete={handleUploadComplete}
          />
        </div>
      </EditorContextProvider>
    </DatasetContextProvider>
  );
}

/**
 * Container component for the gallery page
 * 
 * This component provides the GalleryContext and coordinates between
 * the DatasetContext and EditorContext.
 * 
 * @param initialDataset - Optional dataset ID to select initially
 */
export function GalleryContainer({ initialDataset }: { initialDataset?: string }) {
  return (
    <GalleryContextProvider initialDataset={initialDataset}>
      <GalleryContainerInner />
    </GalleryContextProvider>
  );
} 