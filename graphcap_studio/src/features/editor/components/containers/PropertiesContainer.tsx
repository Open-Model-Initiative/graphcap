// SPDX-License-Identifier: Apache-2.0
import { Image, Dataset } from '@/services/images';
import { ImageProperties } from '../ImageProperties';

interface PropertiesContainerProps {
  selectedImage: Image | null;
  datasets: Dataset[];
  onAddToDataset?: (image: Image, datasetName: string) => Promise<void>;
  onEditImage?: () => void;
  className?: string;
}

/**
 * A container component for the properties panel
 * 
 * This component renders the image properties and actions.
 */
export function PropertiesContainer({
  selectedImage,
  datasets,
  onAddToDataset,
  onEditImage,
  className = '',
}: PropertiesContainerProps) {
  if (!selectedImage) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-gray-800 ${className}`}>
        <p className="text-gray-400">Select an image to view properties</p>
      </div>
    );
  }

  // Adapter function to convert from our interface to ImageProperties interface
  const handleAddToDataset = onAddToDataset 
    ? (imagePath: string, targetDataset: string) => {
        if (selectedImage) {
          onAddToDataset(selectedImage, targetDataset);
        }
      }
    : undefined;

  // Dummy onSave function since we're not implementing property editing in this example
  const handleSave = (properties: Record<string, any>) => {
    console.log('Properties saved:', properties);
  };

  return (
    <div className={`h-full w-full overflow-auto bg-gray-800 ${className}`}>
      <ImageProperties
        image={selectedImage}
        datasets={datasets}
        onAddToDataset={handleAddToDataset}
        onSave={handleSave}
      />
    </div>
  );
} 