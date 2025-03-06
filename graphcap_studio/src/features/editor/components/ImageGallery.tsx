// SPDX-License-Identifier: Apache-2.0
import { useState } from 'react';
import { Image, getImageUrl } from '@/services/images';

interface ImageGalleryProps {
  images: Image[];
  onSelectImage: (image: Image) => void;
  selectedImage: Image | null;
  isLoading?: boolean;
  isEmpty?: boolean;
}

/**
 * A component for browsing and selecting images
 */
export function ImageGallery({ 
  images, 
  onSelectImage, 
  selectedImage,
  isLoading,
  isEmpty
}: ImageGalleryProps) {
  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No images</h3>
          <p className="mt-1 text-sm text-gray-500">
            No images found in this location.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto">
      <div className="p-6">
        <div className="grid auto-rows-[200px] grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
          {images.map((image) => (
            <div
              key={image.path}
              className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all hover:shadow-lg ${
                selectedImage?.path === image.path
                  ? 'border-blue-500 shadow-md'
                  : 'border-transparent hover:border-gray-300'
              }`}
              onClick={() => onSelectImage(image)}
            >
              {/* Image container with aspect ratio */}
              <div className="relative h-full w-full">
                <img
                  src={getImageUrl(image.path)}
                  alt={image.name}
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={(e) => {
                    console.error(`Failed to load image: ${image.path}`);
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0yNCAxMmMwIDYuNjI3LTUuMzczIDEyLTEyIDEycy0xMi01LjM3My0xMi0xMiA1LjM3My0xMiAxMi0xMiAxMiA1LjM3MyAxMiAxMnptLTEyIDJjLjU1MiAwIDEtLjQ0OCAxLTFzLS40NDgtMS0xLTEtMSAuNDQ4LTEgMSAuNDQ4IDEgMSAxem0xLTkuNXYxLjVjMCAuMjc2LS4yMjQuNS0uNS41aGMtLjI3NiAwLS41LS4yMjQtLjUtLjV2LTEuNWMwLS4yNzYuMjI0LS41LjUtLjVoYy4yNzYgMCAuNS4yMjQuNS41em0wIDEyLjV2MS41YzAgLjI3Ni0uMjI0LjUtLjUuNWhjLS4yNzYgMC0uNS0uMjI0LS41LS41di0xLjVjMC0uMjc2LjIyNC0uNS41LS41aGMuMjc2IDAgLjUuMjI0LjUuNXptLTEyLTEydjEuNWMwIC4yNzYuMjI0LjUuNS41aGMuMjc2IDAgLjUtLjIyNC41LS41di0xLjVjMC0uMjc2LS4yMjQtLjUtLjUtLjVoYy0uMjc2IDAtLjUuMjI0LS41LjV6bTAgMTIuNXYxLjVjMCAuMjc2LjIyNC41LjUuNWhjLjI3NiAwIC41LS4yMjQuNS0uNXYtMS41YzAtLjI3Ni0uMjI0LS41LS41LS41aGMtLjI3NiAwLS41LjIyNC0uNS41eiIvPjwvc3ZnPg==';
                  }}
                />
                {/* Overlay with image name */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="truncate text-sm font-medium text-white">
                    {image.name}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 