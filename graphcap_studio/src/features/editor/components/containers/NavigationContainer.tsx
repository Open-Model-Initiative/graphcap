// SPDX-License-Identifier: Apache-2.0
import { useState } from 'react';
import { Dataset } from '@/services/images';
import { DatasetTree } from '../DatasetTree';
import { CreateDatasetModal } from '../CreateDatasetModal';

interface NavigationContainerProps {
  datasets: Dataset[];
  selectedDataset: string | null;
  selectedSubfolder: string | null;
  onSelectDataset: (datasetName: string) => void;
  onSelectSubfolder: (subfolder: string | null) => void;
  onCreateDataset: (name: string) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

/**
 * A container component for the navigation panel
 * 
 * This component renders the dataset tree and navigation controls.
 */
export function NavigationContainer({
  datasets,
  selectedDataset,
  selectedSubfolder,
  onSelectDataset,
  onSelectSubfolder,
  onCreateDataset,
  isLoading = false,
  className = '',
}: NavigationContainerProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateDataset = async (name: string) => {
    try {
      await onCreateDataset(name);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create dataset:', error);
    }
  };

  // Adapter function to convert from our interface to DatasetTree interface
  const handleSelectNode = (datasetName: string, subfolder?: string) => {
    if (!subfolder) {
      onSelectDataset(datasetName);
    } else {
      onSelectSubfolder(subfolder);
    }
  };

  return (
    <div className={`flex h-full w-full flex-col ${className}`}>
      {/* Header with title and actions */}
      <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800 p-4">
        <h2 className="text-lg font-medium text-white">Datasets</h2>
        <button
          className="rounded bg-green-700 px-3 py-1 text-sm font-medium text-white hover:bg-green-800"
          onClick={() => setIsCreateModalOpen(true)}
        >
          New
        </button>
      </div>

      {/* Dataset tree */}
      <div className="flex-1 overflow-auto p-2">
        <DatasetTree
          datasets={datasets}
          selectedDataset={selectedDataset}
          selectedSubfolder={selectedSubfolder}
          onSelectNode={handleSelectNode}
        />
      </div>

      {/* Create dataset modal */}
      <CreateDatasetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onDatasetCreated={handleCreateDataset}
      />
    </div>
  );
} 