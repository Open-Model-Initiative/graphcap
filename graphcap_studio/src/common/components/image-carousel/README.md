# Carousel Components

This directory contains components for the carousel view mode of the image viewer.

## Components

### CarouselViewer

The main component for viewing images in a carousel layout. It displays a large image in the center with navigation controls and a thumbnail strip at the bottom.

```tsx
import { CarouselViewer } from '@/common/components/image-carousel';

function MyComponent() {
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);

  return (
    <CarouselViewer 
      images={images}
      selectedImage={selectedImage}
      onSelectImage={setSelectedImage}
      isLoading={false}
      isEmpty={false}
      thumbnailOptions={{
        minWidth: 64,
        maxWidth: 120,
        gap: 8,
        aspectRatio: 1
      }}
      preloadOptions={{
        enabled: true,
        preloadCount: 2,
        maxConcurrentPreloads: 3
      }}
    />
  );
}
```

### ThumbnailStrip

A horizontal strip of thumbnails for navigating between images. It is positioned at the bottom of the carousel viewer.

```tsx
import { ThumbnailStrip } from '@/common/components/image-carousel';

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

### VirtualizedThumbnailStrip

An optimized version of the ThumbnailStrip that uses virtualization for improved performance with large collections of images.

```tsx
import { VirtualizedThumbnailStrip } from '@/common/components/image-carousel';

function MyComponent() {
  return (
    <VirtualizedThumbnailStrip 
      images={images}
      selectedIndex={selectedIndex}
      onSelect={handleSelect}
      minThumbnailWidth={64}
      maxThumbnailWidth={120}
      gap={8}
      aspectRatio={1}
      virtualizeThreshold={50} // Only virtualize if more than 50 images
    />
  );
}
```

### ErrorBoundary

A component that catches JavaScript errors in its child component tree and displays a fallback UI.

```tsx
import { ErrorBoundary } from '@/common/components/image-carousel';

function MyComponent() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <MyCarouselComponent />
    </ErrorBoundary>
  );
}
```

## Hooks

### useCarouselLayout

A custom hook to calculate and manage carousel layout dimensions. It handles calculating the available height for the image container, accounting for the thumbnail strip at the bottom.

```tsx
import { useCarouselLayout } from '@/common/components/image-carousel/hooks';

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

### useImagePreloader

A custom hook for preloading images to improve the user experience when navigating through the carousel.

```tsx
import { useImagePreloader } from '@/common/components/image-carousel/hooks';

function MyComponent() {
  useImagePreloader({
    images,
    currentIndex,
    preloadCount: 2,
    enabled: true,
    maxConcurrentPreloads: 3
  });

  return (
    // Component content
  );
}
```

## Layout Structure

The carousel layout consists of two main sections:

1. **Image Container**: Takes up most of the available space and displays the selected image
2. **Thumbnail Strip**: Fixed height container at the bottom of the screen that displays thumbnails of all images

The layout is responsive and adjusts to the available space. The thumbnail strip is always positioned at the bottom of the screen, and the image container adjusts its height accordingly.

## CSS Modules

The carousel components use CSS modules to ensure styles are scoped and maintainable:

- `CarouselViewer.module.css`: Styles for the main carousel viewer component
- `ThumbnailStrip.module.css`: Styles for the thumbnail strip component

## Accessibility Features

The carousel components include several accessibility enhancements:

- Proper ARIA attributes for screen readers
- Keyboard navigation support
- Skip navigation link for keyboard users
- Focus management
- Accessible error states

## Error Handling

The carousel components include comprehensive error handling:

- Error boundary to catch and handle errors in the component tree
- Image loading error handling with retry functionality
- Graceful degradation when components fail

## Performance Optimizations

The carousel components include several performance optimizations:

- Virtualized thumbnail strip for large collections
- Optimized image preloading with concurrent limits
- Memoized components to prevent unnecessary re-renders
- Efficient layout calculations


## API Reference

### CarouselViewer

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `images` | `Image[]` | Required | Array of image objects to display |
| `isLoading` | `boolean` | `false` | Whether the carousel is in loading state |
| `isEmpty` | `boolean` | `false` | Whether there are no images to display |
| `className` | `string` | `''` | Additional CSS classes |
| `selectedImage` | `Image \| null` | `null` | Currently selected image |
| `onSelectImage` | `(image: Image) => void` | Required | Callback when an image is selected |
| `thumbnailOptions` | `object` | `{}` | Configuration for thumbnail display |
| `preloadOptions` | `object` | `{}` | Configuration for image preloading |

#### thumbnailOptions

| Option | Type | Default | Description |
|-------|------|---------|-------------|
| `minWidth` | `number` | `64` | Minimum width of thumbnails in pixels |
| `maxWidth` | `number` | `120` | Maximum width of thumbnails in pixels |
| `gap` | `number` | `8` | Gap between thumbnails in pixels |
| `aspectRatio` | `number` | `1` | Aspect ratio of thumbnails (width/height) |
| `maxHeight` | `number` | `70` | Maximum height of thumbnails in pixels |

#### preloadOptions

| Option | Type | Default | Description |
|-------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Whether image preloading is enabled |
| `preloadCount` | `number` | `2` | Number of images to preload before and after the current image |
| `maxConcurrentPreloads` | `number` | `3` | Maximum number of concurrent image preloads | 