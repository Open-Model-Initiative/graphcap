// SPDX-License-Identifier: Apache-2.0
import { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react';
import { Image, getImageUrl, getThumbnailUrl } from '@/services/images';
import { useEditorContext } from '../context/EditorContext';

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
  const { viewMode } = useEditorContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleImages, setVisibleImages] = useState<Image[]>([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  
  // Number of thumbnails to show on each side of the current image
  const thumbnailsToShow = 5;
  
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

  // Set carousel index to match selected image
  useEffect(() => {
    if (selectedImage && images.length > 0) {
      const index = images.findIndex(img => img.path === selectedImage.path);
      if (index !== -1) {
        setCarouselIndex(index);
      }
    }
  }, [selectedImage, images]);

  // Scroll selected thumbnail into view
  useEffect(() => {
    if (viewMode === 'carousel' && thumbnailsRef.current) {
      const thumbnailWidth = 80; // Width of each thumbnail + gap
      const scrollPosition = carouselIndex * thumbnailWidth - (thumbnailsRef.current.clientWidth / 2) + (thumbnailWidth / 2);
      thumbnailsRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    }
  }, [carouselIndex, viewMode]);

  // Handle keyboard navigation for carousel
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (viewMode !== 'carousel') return;
      
      switch (e.key) {
        case 'ArrowLeft':
          navigateCarousel(-1);
          e.preventDefault();
          break;
        case 'ArrowRight':
          navigateCarousel(1);
          e.preventDefault();
          break;
        case 'ArrowUp':
          navigateCarousel(-1);
          e.preventDefault();
          break;
        case 'ArrowDown':
          navigateCarousel(1);
          e.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [viewMode, carouselIndex, images.length]);

  // Navigate carousel by delta
  const navigateCarousel = (delta: number) => {
    if (images.length === 0) return;
    
    const newIndex = (carouselIndex + delta + images.length) % images.length;
    setCarouselIndex(newIndex);
    onSelectImage(images[newIndex]);
  };

  // Handle mouse wheel for carousel
  const handleWheel = (e: React.WheelEvent) => {
    if (viewMode !== 'carousel') return;
    
    // Determine direction (positive deltaY means scrolling down)
    const delta = e.deltaY > 0 ? 1 : -1;
    navigateCarousel(delta);
    e.preventDefault();
  };

  // Get visible thumbnails for carousel
  const getVisibleThumbnails = () => {
    if (images.length <= thumbnailsToShow * 2 + 1) {
      return images;
    }
    
    const startIndex = Math.max(0, carouselIndex - thumbnailsToShow);
    const endIndex = Math.min(images.length, carouselIndex + thumbnailsToShow + 1);
    return images.slice(startIndex, endIndex);
  };
  
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
      className="h-full w-full overflow-auto bg-gray-900 relative"
      onScroll={handleScroll}
      onWheel={viewMode === 'carousel' ? handleWheel : undefined}
    >
      {viewMode === 'grid' ? (
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
      ) : (
        <div className="flex h-full w-full flex-col">
          {/* Main carousel image */}
          <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Current image */}
            {images.length > 0 && (
              <div className="max-h-full max-w-full">
                <img
                  src={getImageUrl(images[carouselIndex].path)}
                  alt={images[carouselIndex].name}
                  className="max-h-[calc(100vh-180px)] max-w-full object-contain"
                />
              </div>
            )}
          </div>
          
          {/* Thumbnails row with navigation buttons */}
          <div className="h-24 border-t border-gray-700 bg-gray-800 flex items-center px-4 relative">
            {/* Previous button */}
            <button
              className="absolute left-4 z-10 rounded-full bg-gray-700 p-2 text-white hover:bg-gray-600"
              onClick={() => navigateCarousel(-1)}
              aria-label="Previous image"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Thumbnails container */}
            <div 
              ref={thumbnailsRef}
              className="flex-1 overflow-x-auto mx-14 scrollbar-thin scrollbar-thumb-gray-600 flex items-center"
            >
              <div className="flex space-x-2 px-2">
                {getVisibleThumbnails().map((image, index) => (
                  <div
                    key={image.path}
                    className={`h-16 w-16 flex-shrink-0 cursor-pointer overflow-hidden rounded border-2 transition-all ${
                      image.path === images[carouselIndex].path
                        ? 'border-blue-500 shadow-md'
                        : 'border-transparent hover:border-gray-600'
                    }`}
                    onClick={() => {
                      const newIndex = images.findIndex(img => img.path === image.path);
                      if (newIndex !== -1) {
                        setCarouselIndex(newIndex);
                        onSelectImage(image);
                      }
                    }}
                  >
                    <img
                      src={getThumbnailUrl(image.path, 80, 80)}
                      alt={image.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Next button */}
            <button
              className="absolute right-4 z-10 rounded-full bg-gray-700 p-2 text-white hover:bg-gray-600"
              onClick={() => navigateCarousel(1)}
              aria-label="Next image"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Image counter */}
            <div className="absolute right-16 bottom-1 text-xs text-gray-400">
              {carouselIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
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