// SPDX-License-Identifier: Apache-2.0
import { useState, useRef, useEffect, useCallback } from 'react';
import { Image, getImageUrl, getThumbnailUrl } from '@/services/images';

interface ImageGalleryProps {
  images: Image[];
  onSelectImage: (image: Image) => void;
  selectedImage: Image | null;
  isLoading?: boolean;
  isEmpty?: boolean;
}

/**
 * A component for browsing and selecting images with virtualization
 */
export function ImageGallery({ 
  images, 
  onSelectImage, 
  selectedImage,
  isLoading,
  isEmpty
}: ImageGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleImages, setVisibleImages] = useState<Image[]>([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  
  // Image dimensions
  const imageHeight = 200;
  const imageWidth = 200;
  const gap = 16; // 4 in Tailwind units = 16px
  
  // Calculate how many images to render based on container size
  const calculateVisibleImages = useCallback(() => {
    if (!containerRef.current || images.length === 0) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    setContainerHeight(rect.height);
    setContainerWidth(rect.width);
    
    // Calculate columns based on container width
    const columns = Math.max(1, Math.floor((rect.width - gap) / (imageWidth + gap)));
    
    // Calculate visible rows (add buffer rows for smooth scrolling)
    const visibleRows = Math.ceil(rect.height / (imageHeight + gap)) + 2;
    
    // Calculate start and end indices
    const startRow = Math.max(0, Math.floor(scrollPosition / (imageHeight + gap)) - 1);
    const endRow = Math.min(Math.ceil(images.length / columns), startRow + visibleRows);
    
    // Get visible images
    const startIndex = startRow * columns;
    const endIndex = Math.min(images.length, endRow * columns);
    
    setVisibleImages(images.slice(startIndex, endIndex));
  }, [images, scrollPosition]);
  
  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollPosition(containerRef.current.scrollTop);
    }
  }, []);
  
  // Initialize and handle resize
  useEffect(() => {
    calculateVisibleImages();
    
    const resizeObserver = new ResizeObserver(() => {
      calculateVisibleImages();
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [calculateVisibleImages]);
  
  // Update visible images when scroll position changes
  useEffect(() => {
    calculateVisibleImages();
  }, [calculateVisibleImages, scrollPosition]);
  
  // Update visible images when images array changes
  useEffect(() => {
    calculateVisibleImages();
  }, [calculateVisibleImages, images]);
  
  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-900">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-blue-500"></div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8 bg-gray-900">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-500"
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
          <h3 className="mt-2 text-sm font-medium text-gray-300">No images</h3>
          <p className="mt-1 text-sm text-gray-400">
            No images found in this location.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="h-full w-full overflow-auto bg-gray-900"
      onScroll={handleScroll}
    >
      <div className="p-6">
        <div 
          className="grid auto-rows-[200px] grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4"
          style={{ 
            height: Math.ceil(images.length / Math.floor(containerWidth / (imageWidth + gap))) * (imageHeight + gap),
            position: 'relative'
          }}
        >
          {visibleImages.map((image, index) => (
            <LazyImage
              key={image.path}
              image={image}
              isSelected={selectedImage?.path === image.path}
              onSelect={onSelectImage}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface LazyImageProps {
  image: Image;
  isSelected: boolean;
  onSelect: (image: Image) => void;
}

/**
 * A component for lazy loading images with thumbnails
 */
function LazyImage({ image, isSelected, onSelect }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  
  // Use IntersectionObserver to detect when image is in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
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
      className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all hover:shadow-lg ${
        isSelected
          ? 'border-blue-500 shadow-md'
          : 'border-transparent hover:border-gray-600'
      }`}
      onClick={() => onSelect(image)}
    >
      {/* Image container with aspect ratio */}
      <div className="relative h-full w-full">
        {isInView ? (
          <>
            {/* Low-quality placeholder or blur while loading */}
            {!isLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="h-6 w-6 animate-pulse rounded-full bg-gray-700"></div>
              </div>
            )}
            
            {/* Actual image */}
            <img
              src={getThumbnailUrl(image.path, 200, 200)}
              alt={image.name}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setIsLoaded(true)}
              onError={(e) => {
                console.error(`Failed to load image: ${image.path}`);
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0yNCAxMmMwIDYuNjI3LTUuMzczIDEyLTEyIDEycy0xMi01LjM3My0xMi0xMiA1LjM3My0xMiAxMi0xMiAxMiA1LjM3MyAxMiAxMnptLTEyIDJjLjU1MiAwIDEtLjQ0OCAxLTFzLS40NDgtMS0xLTEtMSAuNDQ4LTEgMSAuNDQ4IDEgMSAxem0xLTkuNXYxLjVjMCAuMjc2LS4yMjQuNS0uNS41aGMtLjI3NiAwLS41LS4yMjQtLjUtLjV2LTEuNWMwLS4yNzYuMjI0LS41LjUtLjVoYy4yNzYgMCAuNS4yMjQuNS41em0wIDEyLjV2MS41YzAgLjI3Ni0uMjI0LjUtLjUuNWhjLS4yNzYgMC0uNS0uMjI0LS41LS41di0xLjVjMC0uMjc2LjIyNC0uNS41LS41aGMuMjc2IDAgLjUuMjI0LjUuNXptLTEyLTEydjEuNWMwIC4yNzYuMjI0LjUuNS41aGMuMjc2IDAgLjUtLjIyNC41LS41di0xLjVjMC0uMjc2LS4yMjQtLjUtLjUtLjVoYy0uMjc2IDAtLjUuMjI0LS41LjV6bTAgMTIuNXYxLjVjMCAuMjc2LjIyNC41LjUuNWhjLjI3NiAwIC41LS4yMjQuNS0uNXYtMS41YzAtLjI3Ni0uMjI0LS41LS41LS41aGMtLjI3NiAwLS41LjIyNC0uNS41eiIvPjwvc3ZnPg==';
                setIsLoaded(true);
              }}
            />
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