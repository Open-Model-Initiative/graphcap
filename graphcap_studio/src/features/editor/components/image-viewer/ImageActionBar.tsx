// SPDX-License-Identifier: Apache-2.0
import { Image } from '@/services/images';

interface ImageActionBarProps {
  image: Image | null;
  onEdit: () => void;
  onAddToDataset?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  className?: string;
}

/**
 * A compact action bar for image-specific actions
 * 
 * Provides a set of action buttons for common operations on the selected image:
 * - Edit image
 * - Add to dataset (optional)
 * - Download image
 * - Delete image (optional)
 * 
 * @param image - The currently selected image or null
 * @param onEdit - Callback when edit button is clicked
 * @param onAddToDataset - Optional callback for adding to dataset
 * @param onDownload - Optional callback for custom download behavior
 * @param onDelete - Optional callback for delete action
 * @param className - Additional CSS classes
 */
export function ImageActionBar({
  image,
  onEdit,
  onAddToDataset,
  onDownload,
  onDelete,
  className = ''
}: ImageActionBarProps) {
  if (!image) return null;

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Default download behavior
      const link = document.createElement('a');
      link.href = image.url;
      link.download = image.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className={`flex items-center space-x-1 bg-gray-800/80 backdrop-blur-sm px-1.5 py-0.5 rounded-md ${className}`}>
      <button
        onClick={onEdit}
        className="text-xs text-white bg-blue-600 hover:bg-blue-700 px-1.5 py-0.5 rounded"
        title="Edit image"
      >
        Edit
      </button>
      
      {onAddToDataset && (
        <button
          onClick={onAddToDataset}
          className="text-xs text-white bg-green-600 hover:bg-green-700 px-1.5 py-0.5 rounded"
          title="Add to dataset"
        >
          Add
        </button>
      )}
      
      <button
        onClick={handleDownload}
        className="text-xs text-white bg-gray-600 hover:bg-gray-700 px-1.5 py-0.5 rounded"
        title="Download image"
      >
        DL
      </button>
      
      {onDelete && (
        <button
          onClick={onDelete}
          className="text-xs text-white bg-red-600 hover:bg-red-700 px-1.5 py-0.5 rounded"
          title="Delete image"
        >
          Del
        </button>
      )}
    </div>
  );
} 