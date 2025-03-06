// SPDX-License-Identifier: Apache-2.0
import { useState, useEffect } from 'react';
import { useEditorContext } from '../../context/EditorContext';

interface CompactActionBarProps {
  totalImages: number;
  currentIndex: number;
  className?: string;
}

/**
 * A compact action bar for image operations using icons
 * 
 * @param totalImages - Total number of images
 * @param currentIndex - Current image index
 * @param className - Additional CSS classes
 */
export function CompactActionBar({
  totalImages,
  currentIndex,
  className = ''
}: CompactActionBarProps) {
  const {
    selectedImage: image,
    datasets,
    currentDataset,
    handleEditImage,
    handleAddToDataset,
    handleDownload,
    handleDelete
  } = useEditorContext();
  
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [showDatasetDropdown, setShowDatasetDropdown] = useState(false);

  // Reset selected dataset when datasets change
  useEffect(() => {
    if (datasets.length > 0 && !selectedDataset) {
      // Default to first dataset that's not the current one
      const defaultDataset = datasets.find(d => d.name !== currentDataset)?.name || datasets[0].name;
      setSelectedDataset(defaultDataset);
    }
  }, [datasets, currentDataset, selectedDataset]);

  // Handle download button click
  const onDownloadClick = () => {
    if (image) {
      handleDownload();
    }
  };

  // Handle delete button click
  const onDeleteClick = () => {
    if (image) {
      handleDelete();
    }
  };

  // Handle edit button click
  const onEditClick = () => {
    if (image) {
      handleEditImage();
    }
  };

  // Handle add to dataset button click
  const onAddToDatasetClick = () => {
    if (image && selectedDataset) {
      handleAddToDataset(image.path, selectedDataset);
      setShowDatasetDropdown(false);
    }
  };

  // Toggle dataset dropdown
  const toggleDatasetDropdown = () => {
    setShowDatasetDropdown(!showDatasetDropdown);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowDatasetDropdown(false);
    };

    if (showDatasetDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [showDatasetDropdown]);

  // If no image is selected, show minimal info
  if (!image) {
    return (
      <div className={`flex h-8 items-center justify-between bg-gray-800/90 px-2 py-0.5 ${className}`}>
        <div className="text-xs text-gray-400">
          {totalImages > 0 ? `${totalImages} images` : 'No images'}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-8 items-center justify-between bg-gray-800/90 px-2 py-0.5 ${className}`}>
      {/* Left side - Image info */}
      <div className="flex items-center space-x-1">
        <div className="text-xs text-gray-300 truncate max-w-[200px]">
          <span className="font-medium">{image.name}</span>
          <span className="mx-1 text-gray-500">•</span>
          <span className="text-gray-400">
            {currentIndex + 1}/{totalImages}
          </span>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center space-x-0.5">
        {/* Edit button */}
        <button
          onClick={onEditClick}
          className="rounded p-0.5 text-gray-400 hover:bg-gray-700 hover:text-white"
          title="Edit image"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>

        {/* Add to dataset button with dropdown */}
        {datasets.length > 0 && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleDatasetDropdown();
              }}
              className="rounded p-0.5 text-gray-400 hover:bg-gray-700 hover:text-white"
              title="Add to dataset"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </button>

            {/* Dataset dropdown */}
            {showDatasetDropdown && (
              <div
                className="absolute right-0 top-full z-10 mt-1 w-40 rounded-md bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-2 py-1 text-xs font-medium text-gray-400">
                  Add to dataset:
                </div>
                {datasets
                  .filter((dataset) => dataset.name !== currentDataset)
                  .map((dataset) => (
                    <div
                      key={dataset.name}
                      className="flex items-center px-2 py-0.5 text-xs text-gray-300 hover:bg-gray-700"
                    >
                      <input
                        type="radio"
                        id={`dataset-${dataset.name}`}
                        name="dataset"
                        value={dataset.name}
                        checked={selectedDataset === dataset.name}
                        onChange={() => setSelectedDataset(dataset.name)}
                        className="mr-1 h-2 w-2"
                      />
                      <label
                        htmlFor={`dataset-${dataset.name}`}
                        className="flex-1 cursor-pointer truncate"
                      >
                        {dataset.name}
                      </label>
                    </div>
                  ))}
                <div className="mt-1 border-t border-gray-700 px-2 py-0.5">
                  <button
                    onClick={onAddToDatasetClick}
                    disabled={!selectedDataset}
                    className="w-full rounded bg-blue-600 px-1 py-0.5 text-xs font-medium text-white hover:bg-blue-700 disabled:bg-gray-600 disabled:text-gray-400"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Download button */}
        <button
          onClick={onDownloadClick}
          className="rounded p-0.5 text-gray-400 hover:bg-gray-700 hover:text-white"
          title="Download image"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </button>

        {/* Delete button */}
        <button
          onClick={onDeleteClick}
          className="rounded p-0.5 text-gray-400 hover:bg-gray-700 hover:text-red-400"
          title="Delete image"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
} 