# Carousel Components

This directory contains components for the image carousel feature in Graphcap Studio.

## Components

### CarouselViewer

The main carousel component that displays images with sliding window pagination, navigation controls, and thumbnails.

**Features:**
- Displays images in a carousel view with sliding window pagination
- Lazy loads images as the user navigates through the carousel
- Provides keyboard navigation (arrow keys)
- Supports mouse wheel navigation
- Shows thumbnails for quick navigation between images
- Supports dynamic thumbnail sizing based on available space

### ThumbnailStrip

A horizontal strip of thumbnails for navigating between images in the carousel.

**Features:**
- Displays thumbnails for the current visible window of images
- Highlights the currently selected image
- Automatically scrolls to keep the selected thumbnail in view
- Dynamically adjusts thumbnail size based on available container width
- Supports customizable minimum and maximum thumbnail sizes

## Custom Hooks

The carousel components use a set of custom hooks to separate logic from the view layer:

### useCarouselNavigation

Manages the state and logic for navigating through images in a carousel, using a sliding window approach.

**Features:**
- Tracks the current image index
- Manages the visible window of images
- Provides navigation functions (by index or delta)
- Automatically adjusts the visible window as the user navigates

### useCarouselControls

Handles keyboard and wheel navigation for the carousel.

**Features:**
- Sets up keyboard event listeners for arrow key navigation
- Provides a handler for wheel events
- Can be enabled/disabled based on component state

### useThumbnailScroll

Manages scrolling the thumbnail strip to keep the selected thumbnail in view.

**Features:**
- Provides a ref to attach to the thumbnail container
- Automatically scrolls to center the selected thumbnail
- Handles smooth scrolling behavior

### useDynamicThumbnails

Calculates optimal thumbnail dimensions based on available container space.

**Features:**
- Dynamically adjusts thumbnail size based on container width
- Determines the optimal number of visible thumbnails
- Supports minimum and maximum thumbnail size constraints
- Automatically recalculates on container resize

## Usage

```tsx
import { CarouselViewer } from './carousel';

function MyComponent() {
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  
  return (
    <CarouselViewer
      images={images}
      selectedImage={selectedImage}
      onSelectImage={setSelectedImage}
      onEditImage={handleEditImage}
      onAddToDataset={handleAddToDataset}
      isLoading={isLoading}
      isEmpty={isEmpty}
      thumbnailOptions={{
        minWidth: 64,
        maxWidth: 120,
        gap: 8
      }}
    />
  );
}
```

## Implementation Details

- The carousel uses a sliding window approach to load only a subset of images at a time
- As the user navigates, the window slides to include images before and after the current image
- This approach improves performance for large image collections
- The hook-based architecture separates logic from the view layer, making the code more maintainable
- Each hook has a single responsibility, following the single responsibility principle
- Thumbnails are dynamically sized based on available space, making the component responsive to different screen sizes and resizing 