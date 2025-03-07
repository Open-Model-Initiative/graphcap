# Image Viewer Components

This directory contains components for viewing and interacting with images in the Graphcap Studio application.

## Components

### ImageViewer

A component for viewing individual images with loading and error states.

```tsx
import { ImageViewer } from '@/features/editor/components/image-viewer';

function MyComponent() {
  return (
    <ImageViewer 
      imagePath="/path/to/image.jpg"
      alt="Description of image"
      aspectRatio={16/9} // Optional
      padding={16} // Optional
      onLoad={() => console.log('Image loaded')}
      onError={(error) => console.error('Image error', error)}
    />
  );
}
```

#### Props

- `imagePath` (required): Path to the image file
- `alt` (optional): Alternative text for the image
- `className` (optional): Additional CSS classes
- `aspectRatio` (optional): Aspect ratio to maintain (width/height)
- `padding` (optional): Padding to subtract from container dimensions
- `onLoad` (optional): Callback when image loads successfully
- `onError` (optional): Callback when image fails to load

## Hooks

### useImageViewerSize

A custom hook to calculate optimal image viewer dimensions based on container size.

```tsx
import { useRef } from 'react';
import { useImageViewerSize } from '@/features/editor/components/image-viewer/hooks';

function MyComponent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height, isCalculating } = useImageViewerSize({
    containerRef,
    aspectRatio: 16/9,
    padding: 16
  });

  return (
    <div ref={containerRef} style={{ height: '100%', width: '100%' }}>
      <img 
        src="/path/to/image.jpg"
        alt="Description"
        style={{
          width: isCalculating ? 'auto' : `${width}px`,
          height: isCalculating ? 'auto' : `${height}px`
        }}
      />
    </div>
  );
}
```

#### Parameters

- `containerRef` (required): Reference to the container element
- `aspectRatio` (optional): Aspect ratio to maintain (width/height)
- `padding` (optional): Padding to subtract from container dimensions

#### Returns

- `width`: Calculated optimal width
- `height`: Calculated optimal height
- `isCalculating`: Boolean indicating if dimensions are still being calculated

## Layout Integration

The image viewer components are designed to work seamlessly with the application's layout system. They automatically adjust to the available space between the header and footer.

For optimal integration:

1. Always place image viewers within the `MainLayout` component
2. Avoid setting fixed heights on parent containers
3. Use the `useImageViewerSize` hook for custom image rendering scenarios

```tsx
import { MainLayout } from '@/common/components/layout';
import { ImageViewer } from '@/features/editor/components/image-viewer';

function ImageViewerPage() {
  return (
    <MainLayout>
      <div className="h-full w-full">
        <ImageViewer imagePath="/path/to/image.jpg" />
      </div>
    </MainLayout>
  );
}
```

## CSS Modules

The image viewer components use CSS modules to ensure styles are scoped and maintainable:

- `ImageViewer.module.css`: Styles for the main image viewer component
- Additional component-specific modules as needed

## Component Overview

### Main Components

- **ImageViewer**: Core component for displaying a single image with loading and error states.
- **GridViewer**: Displays images in a responsive, virtualized grid layout.
- **ImageGallery**: Container component that switches between grid and carousel views and provides an info bar with image actions.
- **LazyImage**: Optimized image component with intersection observer for efficient loading.
- **CarouselNavigation**: Navigation controls for moving between images in carousel view.
- **CompactActionBar**: Provides a compact action bar with icons for image operations.

### Carousel Components

The `carousel/` subdirectory contains specialized components for the carousel view mode:

- **CarouselViewer**: Main component for viewing images in a carousel layout.
- **ThumbnailStrip**: Displays a horizontal strip of image thumbnails.
- **Pagination**: Controls for navigating through pages of images.

## Usage

The components are designed to be used together in a hierarchical structure:

```tsx
<ImageGallery
  images={images}
  selectedImage={selectedImage}
  onSelectImage={handleSelectImage}
  onEditImage={handleEditImage}
  onDownload={handleDownload}
  onDelete={handleDelete}
  onAddToDataset={handleAddToDataset}
  isLoading={isLoading}
  isEmpty={isEmpty}
/>
```

The `ImageGallery` component will automatically switch between `GridViewer` and `CarouselViewer` based on the current view mode in the `EditorContext`.

## Features

- **Virtualized Rendering**: Efficient display of large image collections
- **Responsive Layout**: Adapts to container dimensions
- **Lazy Loading**: Images load only when scrolled into view
- **View Modes**: Switch between grid and carousel views
- **Image Selection**: Select images for editing or other operations
- **Compact Info Bar**: Displays image information and provides quick access to common image operations with space-efficient icons

## Component Relationships

```
ImageGallery
├── CompactActionBar
├── GridViewer
│   └── LazyImage
│       └── ImageViewer
└── CarouselViewer
    ├── ImageViewer
    ├── ThumbnailStrip
    └── Pagination
```

## State Management

These components rely on the `EditorContext` for shared state such as:

- Current view mode (grid or carousel)
- Selected image
- Image collection metadata

## Styling

All components use Tailwind CSS for styling with a consistent dark theme that matches the Graphcap Studio interface. 