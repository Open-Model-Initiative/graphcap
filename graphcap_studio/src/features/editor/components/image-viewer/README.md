# Image Viewer Components

This directory contains components for viewing, browsing, and interacting with images in the Graphcap Studio editor.

## Component Overview

### Main Components

- **ImageViewer**: Core component for displaying a single image with loading and error states.
- **GridViewer**: Displays images in a responsive, virtualized grid layout.
- **ImageGallery**: Container component that switches between grid and carousel views.
- **LazyImage**: Optimized image component with intersection observer for efficient loading.
- **ImageActionBar**: Provides action buttons for operations on the selected image.
- **CarouselNavigation**: Navigation controls for moving between images in carousel view.

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
- **Action Bar**: Quick access to common image operations

## Component Relationships

```
ImageGallery
├── GridViewer
│   └── LazyImage
│       └── ImageViewer
├── CarouselViewer
│   ├── ImageViewer
│   ├── ThumbnailStrip
│   └── Pagination
└── ImageActionBar
```

## State Management

These components rely on the `EditorContext` for shared state such as:

- Current view mode (grid or carousel)
- Selected image
- Image collection metadata

## Styling

All components use Tailwind CSS for styling with a consistent dark theme that matches the Graphcap Studio interface. 