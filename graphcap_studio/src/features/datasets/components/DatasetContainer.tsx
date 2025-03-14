// SPDX-License-Identifier: Apache-2.0
import { useState } from 'react';
import { DatasetTree } from './DatasetTree';
import { CreateDatasetModal } from './CreateDatasetModal';
import { useDatasetContext } from '@/features/datasets/context/DatasetContext';

interface DatasetContainerProps {
  readonly className?: string;
}

/**
 * A container component for dataset navigation and management
 */
export function DatasetContainer({ className = '' }: DatasetContainerProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const {
    datasets,
    currentDataset,
    selectedSubfolder,
    setCurrentDataset,
    setSelectedSubfolder,
    handleCreateDataset
  } = useDatasetContext();

  // Handle dataset selection
  const handleDatasetSelection = (datasetName: string, subfolder?: string) => {
    setCurrentDataset(datasetName);
    setSelectedSubfolder(subfolder ?? null);
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold">Datasets</h3>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
        >
          New Dataset
        </button>
      </div>
      
      <div className="flex-grow overflow-auto p-2">
        <DatasetTree
          datasets={datasets}
          selectedDataset={currentDataset || null}
          selectedSubfolder={selectedSubfolder}
          onSelectNode={handleDatasetSelection}
        />
      </div>
      
      <CreateDatasetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onDatasetCreated={async (name) => {
          await handleCreateDataset(name);
          setIsCreateModalOpen(false);
        }}
      />
    </div>
  );
} 