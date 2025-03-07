// SPDX-License-Identifier: Apache-2.0
import { useState } from 'react';
import { toast } from 'sonner';
import { createDataset } from '@/services/images';

interface CreateDatasetModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onDatasetCreated: (datasetName: string) => void;
}

/**
 * A modal component for creating a new dataset
 */
export function CreateDatasetModal({ 
  isOpen, 
  onClose, 
  onDatasetCreated 
}: CreateDatasetModalProps) {
  const [datasetName, setDatasetName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate dataset name
    if (!datasetName.trim()) {
      setError('Dataset name is required');
      return;
    }

    // Dataset name should only contain alphanumeric characters, underscores, and hyphens
    if (!/^[a-zA-Z0-9_-]+$/.test(datasetName)) {
      setError('Dataset name can only contain letters, numbers, underscores, and hyphens');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      await createDataset(datasetName);
      toast.success(`Dataset "${datasetName}" created successfully`);
      onDatasetCreated(datasetName);
      onClose();
    } catch (error) {
      console.error('Error creating dataset:', error);
      
      // Check if this is a 409 conflict error (dataset already exists)
      if (error instanceof Error && error.message.includes('409')) {
        // If the dataset already exists, we can still consider this a success
        // and notify the user that we're switching to the existing dataset
        toast.info(`Dataset "${datasetName}" already exists. Switching to it.`);
        onDatasetCreated(datasetName);
        onClose();
      } else {
        // For other errors, show the error message
        setError(error instanceof Error ? error.message : 'Failed to create dataset');
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-gray-800 p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-semibold text-white">Create New Dataset</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="datasetName" className="mb-2 block text-sm font-medium text-gray-300">
              Dataset Name
            </label>
            <input
              type="text"
              id="datasetName"
              className="w-full rounded-md border border-gray-600 bg-gray-700 p-2 text-white focus:border-blue-500 focus:outline-none"
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
              placeholder="Enter dataset name"
              disabled={isCreating}
            />
            {error && (
              <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
            <p className="mt-1 text-xs text-gray-400">
              Use only letters, numbers, underscores, and hyphens
            </p>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="rounded-md bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-600"
              onClick={onClose}
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500 disabled:opacity-50"
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Dataset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 