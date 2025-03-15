// SPDX-License-Identifier: Apache-2.0
import { useDatasetContext } from '@/features/datasets/context/DatasetContext';
import { Image } from '@/services/images';
import { EditButton, DownloadButton, DeleteButton } from '@/components/ui/buttons';
import { AddToDatasetMenu } from './AddToDatasetMenu';
import { 
  Flex, 
  Text,
} from '@chakra-ui/react';

interface CompactActionBarProps {
  readonly totalImages: number;
  readonly currentIndex: number;
  readonly selectedImage?: Image | null;
  readonly className?: string;
  readonly onEditImage?: (image: Image) => void;
  readonly onAddToDataset?: (imagePath: string, datasetName: string) => void;
  readonly onDelete?: (image: Image) => void;
}

/**
 * A compact action bar for image operations using icons
 * 
 * @param totalImages - Total number of images
 * @param currentIndex - Current image index
 * @param selectedImage - Currently selected image
 * @param className - Additional CSS classes
 * @param onEditImage - Callback when edit button is clicked
 * @param onAddToDataset - Callback when add to dataset button is clicked
 * @param onDelete - Callback when delete button is clicked
 */
export function CompactActionBar({
  totalImages,
  currentIndex,
  selectedImage: image,
  className = '',
  onEditImage,
  onAddToDataset,
  onDelete
}: CompactActionBarProps) {
  // Get dataset context
  const {
    datasets,
    currentDataset,
    addToDataset: addImageToDataset
  } = useDatasetContext();

  // Handle delete button click
  const onDeleteClick = () => {
    if (image && onDelete) {
      onDelete(image);
    }
  };

  // Handle edit button click
  const onEditClick = () => {
    if (image && onEditImage) {
      onEditImage(image);
    }
  };

  // Handle add to dataset
  const handleAddToDataset = (imagePath: string, datasetName: string) => {
    // Try to use the prop callback first (for backward compatibility)
    if (onAddToDataset) {
      onAddToDataset(imagePath, datasetName);
    } else {
      // Otherwise use the context function
      addImageToDataset(imagePath, datasetName);
    }
  };

  // If no image is selected, show minimal info
  if (!image) {
    return (
      <Flex 
        h="8" 
        px="2" 
        py="0.5" 
        justify="space-between" 
        alignItems="center" 
        bg="blackAlpha.700" 
        className={className}
      >
        <Text fontSize="xs" color="gray.400">
          {totalImages > 0 ? `${totalImages} images` : 'No images'}
        </Text>
      </Flex>
    );
  }

  return (
    <Flex 
      h="8" 
      px="2" 
      py="0.5" 
      justify="space-between" 
      alignItems="center" 
      bg="blackAlpha.700" 
      className={className}
    >
      {/* Left side - Image info */}
      <Flex alignItems="center" gap="1">
        <Text fontSize="xs" color="gray.300" truncate maxW="200px">
          <Text as="span" fontWeight="medium">{image.name}</Text>
          <Text as="span" mx="1" color="gray.500">•</Text>
          <Text as="span" color="gray.400">
            {currentIndex + 1}/{totalImages}
          </Text>
        </Text>
      </Flex>

      {/* Right side - Actions */}
      <Flex alignItems="center" gap="0.5">
        {/* Edit button */}
        {onEditImage && (
          <EditButton
            onClick={onEditClick}
            size="xs"
            title="Edit image"
          />
        )}

        {/* Add to dataset button with dropdown */}
        {datasets && datasets.length > 0 && (
          <AddToDatasetMenu
            image={image}
            datasets={datasets}
            currentDataset={currentDataset}
            onAddToDataset={handleAddToDataset}
          />
        )}

        {/* Download button with built-in functionality */}
        <DownloadButton
          image={image}
          size="xs"
          title="Download image"
        />

        {/* Delete button */}
        {onDelete && (
          <DeleteButton
            onClick={onDeleteClick}
            size="xs"
            title="Delete image"
          />
        )}
      </Flex>
    </Flex>
  );
} 