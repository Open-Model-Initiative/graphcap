# Carousel Components

This directory contains components for the carousel view mode of the image viewer.

## Components

### CarouselViewer

The main component for viewing images in a carousel layout. It displays a large image in the center with navigation controls and a thumbnail strip at the bottom.

```tsx
import { CarouselViewer } from '@/features/editor/components/image-viewer/carousel';

function MyComponent() {
  return (
    <CarouselViewer 
      images={images}
      isLoading={false}
      isEmpty={false}
      thumbnailOptions={{
        minWidth: 64,
        maxWidth: 120,
        gap: 8,
        aspectRatio: 1
      }}
    />
  );
}
```

### ThumbnailStrip

A horizontal strip of thumbnails for navigating between images. It is positioned at the bottom of the carousel viewer.

```tsx
import { ThumbnailStrip } from '@/features/editor/components/image-viewer/carousel/ThumbnailStrip';

function MyComponent() {
  return (
    <ThumbnailStrip 
      images={images}
      selectedIndex={selectedIndex}
      onSelect={handleSelect}
      minThumbnailWidth={64}
      maxThumbnailWidth={120}
      gap={8}
      aspectRatio={1}
    />
  );
}
```

## Hooks

### useCarouselLayout

A custom hook to calculate and manage carousel layout dimensions. It handles calculating the available height for the image container, accounting for the thumbnail strip at the bottom.

```tsx
import { useCarouselLayout } from '@/features/editor/components/image-viewer/carousel/hooks';

function MyComponent() {
  const {
    containerRef,
    imageContainerRef,
    thumbnailContainerRef,
    imageContainerHeight,
    isCalculating
  } = useCarouselLayout({
    thumbnailHeight: 96 // 6rem
  });

  return (
    <div ref={containerRef} className="h-full w-full">
      <div 
        ref={imageContainerRef}
        style={{ height: isCalculating ? 'auto' : `${imageContainerHeight}px` }}
      >
        {/* Image content */}
      </div>
      <div ref={thumbnailContainerRef}>
        {/* Thumbnail strip */}
      </div>
    </div>
  );
}
```

### useCarouselNavigation

A custom hook for handling navigation between images in the carousel.

### useCarouselControls

A custom hook for handling keyboard navigation in the carousel.

### useThumbnailScroll

A custom hook for handling thumbnail scrolling in the carousel.

### useDynamicThumbnails

A custom hook for calculating thumbnail dimensions based on container width.

### useWheelNavigation

A custom hook for handling mouse wheel navigation in the carousel.

## Layout Structure

The carousel layout consists of two main sections:

1. **Image Container**: Takes up most of the available space and displays the selected image
2. **Thumbnail Strip**: Fixed height container at the bottom of the screen that displays thumbnails of all images

The layout is responsive and adjusts to the available space. The thumbnail strip is always positioned at the bottom of the screen, and the image container adjusts its height accordingly.

## CSS Modules

The carousel components use CSS modules to ensure styles are scoped and maintainable:

- `CarouselViewer.module.css`: Styles for the main carousel viewer component
- `ThumbnailStrip.module.css`: Styles for the thumbnail strip component 