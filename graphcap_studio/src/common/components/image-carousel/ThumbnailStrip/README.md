# ThumbnailStrip Component

A horizontal strip of thumbnails for navigating between images in the carousel viewer.

## Features

- **Dynamic Sizing**: Automatically adjusts thumbnail sizes based on container width
- **Smooth Scrolling**: Automatically scrolls to keep the selected thumbnail in view
- **Loading States**: Visual feedback during thumbnail loading
- **Keyboard Accessibility**: Fully navigable using keyboard controls
- **Performance Optimized**: Memoized to prevent unnecessary re-renders

## Usage

```tsx
import { ThumbnailStrip } from '@/features/editor/components/image-viewer/carousel/ThumbnailStrip';

function MyComponent() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const images = [...]; // Array of Image objects

  return (
    <ThumbnailStrip
      images={images}
      selectedIndex={selectedIndex}
      onSelect={setSelectedIndex}
      minThumbnailWidth={64}
      maxThumbnailWidth={120}
      gap={8}
      aspectRatio={1.5}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `images` | `Image[]` | Required | Array of image objects to display as thumbnails |
| `selectedIndex` | `number` | Required | Index of the currently selected image |
| `onSelect` | `(index: number) => void` | Required | Callback function when a thumbnail is selected |
| `className` | `string` | `''` | Additional CSS classes to apply to the container |
| `minThumbnailWidth` | `number` | `32` | Minimum width of thumbnails in pixels |
| `maxThumbnailWidth` | `number` | `64` | Maximum width of thumbnails in pixels |
| `gap` | `number` | `4` | Gap between thumbnails in pixels |
| `aspectRatio` | `number` | `1` | Aspect ratio of thumbnails (width/height) |

## Implementation Details

The ThumbnailStrip uses CSS modules for styling and includes several optimizations:

1. **Memoization**: The component is wrapped in `React.memo()` to prevent unnecessary re-renders
2. **Loading States**: Tracks loading state for each thumbnail to provide visual feedback
3. **Dynamic Sizing**: Uses the `useDynamicThumbnails` hook to calculate optimal thumbnail sizes
4. **Smooth Scrolling**: Uses the `useThumbnailScroll` hook to automatically scroll to the selected thumbnail

## Styling

The component uses CSS modules for styling. The main classes are:

- `.container`: The main container for the thumbnail strip
- `.thumbnailButton`: The button wrapper for each thumbnail
- `.thumbnailImage`: The image element
- `.selected`: Applied to the currently selected thumbnail
- `.selectedIndicator`: The indicator bar for the selected thumbnail

Custom styling can be applied by passing a `className` prop or by modifying the CSS module. 