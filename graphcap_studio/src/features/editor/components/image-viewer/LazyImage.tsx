// SPDX-License-Identifier: Apache-2.0
import { useState, useRef, useEffect } from 'react';
import { Image, getThumbnailUrl } from '@/services/images';
import { ImageViewer } from './ImageViewer';

interface LazyImageProps {
  image: Image;
  isSelected: boolean;
  onSelect: (image: Image) => void;
  onEdit?: () => void;
  onAddToDataset?: () => void;
}

/**
 * A component for lazy loading images in the grid view
 * 
 * Features:
 * - Intersection Observer for loading images only when in viewport
 * - Loading states with placeholders
 * - Selection state visual feedback
 * - Hover effects for image information
 * 
 * @param image - The image object to display
 * @param isSelected - Whether this image is currently selected
 * @param onSelect - Callback when the image is selected
 * @param onEdit - Optional callback for edit action
 * @param onAddToDataset - Optional callback for adding to dataset
 */
export function LazyImage({ 
  image, 
  isSelected, 
  onSelect,
  onEdit,
  onAddToDataset
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  // Use Intersection Observer to detect when the image is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '100px',
        threshold: 0.1,
      }
    );
    
    if (imageRef.current) {
      observer.observe(imageRef.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={imageRef}
      className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all hover:shadow-lg h-full w-full ${
        isSelected
          ? 'border-blue-500 shadow-md'
          : 'border-transparent hover:border-gray-600'
      }`}
      onClick={() => onSelect(image)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      {/* Image container with aspect ratio */}
      <div className="relative h-full w-full flex-grow">
        {isInView ? (
          <>
            {/* Low-quality placeholder or blur while loading */}
            {!isLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="h-6 w-6 animate-pulse rounded-full bg-gray-700"></div>
              </div>
            )}
            
            {/* Use ImageViewer component */}
            <div className={`absolute inset-0 transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}>
              <ImageViewer
                imagePath={image.path}
                alt={image.name}
                className="h-full w-full object-cover"
                onLoad={() => setIsLoaded(true)}
                onError={(error) => {
                  console.error(`Failed to load image: ${image.path}`, error);
                  setIsLoaded(true);
                }}
              />
            </div>
          </>
        ) : (
          // Placeholder when not in view
          <div className="absolute inset-0 bg-gray-800"></div>
        )}
        
        {/* Overlay with image name */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
          <p className="truncate text-sm font-medium text-white">
            {image.name}
          </p>
        </div>
      </div>
    </div>
  );
} 