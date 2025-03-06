// SPDX-License-Identifier: Apache-2.0
import { useState } from 'react';
import { Image } from '@/services/images';
import { ImageViewer } from './ImageViewer';

interface ImageGalleryProps {
  images: Image[];
  onSelectImage: (image: Image) => void;
  isLoading?: boolean;
  isEmpty?: boolean;
}

/**
 * A component for browsing and selecting images
 */
export function ImageGallery({ 
  images, 
  onSelectImage, 
  isLoading = false, 
  isEmpty = false 
}: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);

  const handleSelectImage = (image: Image) => {
    setSelectedImage(image);
    onSelectImage(image);
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  if (isEmpty || images.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-gray-500">No images found</p>
      </div>
    );
  }

  return (
    <div className="grid h-full w-full grid-cols-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {images.map((image) => (
        <div
          key={image.path}
          className={`group relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 ${
            selectedImage?.path === image.path ? 'border-blue-600' : 'border-transparent'
          } hover:border-blue-400`}
          onClick={() => handleSelectImage(image)}
        >
          <ImageViewer imagePath={image.path} className="h-full w-full object-cover" />
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
            <p className="truncate text-sm">{image.name}</p>
          </div>
        </div>
      ))}
    </div>
  );
} 