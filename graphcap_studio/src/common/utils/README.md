# Utility Functions

This directory contains utility functions used throughout the Graphcap Studio application.

## Aspect Ratio Utilities

The `aspectRatio.ts` file provides utilities for handling aspect ratio calculations with logging to help track down issues.

### Functions

- `calculateHeightFromAspectRatio(width, aspectRatio, source)`: Calculates height from width and aspect ratio. Returns `undefined` when no aspect ratio is provided to preserve the original image's aspect ratio.
- `calculateWidthFromAspectRatio(height, aspectRatio, source)`: Calculates width from height and aspect ratio. Returns `undefined` when no aspect ratio is provided to preserve the original image's aspect ratio.
- `calculateFitDimensions(containerWidth, containerHeight, aspectRatio, source)`: Calculates dimensions that fit within a container while maintaining aspect ratio. Uses container dimensions when no aspect ratio is provided.
- `formatAspectRatioForCSS(aspectRatio)`: Formats an aspect ratio for CSS

### Preserving Original Aspect Ratio

When no aspect ratio is provided, these utilities are designed to preserve the original image's aspect ratio rather than forcing a default aspect ratio or creating square images. This ensures that images are displayed correctly without unwanted cropping or distortion.

### Logging

These utilities include detailed logging to help track down issues with aspect ratio calculations. The logging is only enabled in development mode and includes:

- Source identifier to track where the calculation is happening
- Input values (width, height, aspect ratio)
- Calculated values
- Warnings for invalid aspect ratios

Example log output:
```
[AspectRatio] generateSrcSet: No aspect ratio provided, preserving original image aspect ratio
[AspectRatio] useDynamicThumbnails-init: Width 48 ÷ Aspect 1 = Height 48
[AspectRatio] useImageViewerSize: Container 800x600 (ratio: 1.33), Target aspect: 1.50
```

### Usage

```typescript
import { 
  calculateHeightFromAspectRatio, 
  calculateWidthFromAspectRatio,
  calculateFitDimensions,
  formatAspectRatioForCSS
} from '@/common/utils/aspectRatio';

// Calculate height from width and aspect ratio
const height = calculateHeightFromAspectRatio(200, 1.5, 'myComponent');
// Returns 133 when aspect ratio is provided

// When no aspect ratio is provided, it returns undefined to preserve original aspect ratio
const preservedHeight = calculateHeightFromAspectRatio(200, undefined, 'myComponent');
// Returns undefined

// Calculate width from height and aspect ratio
const width = calculateWidthFromAspectRatio(100, 1.5, 'myComponent');
// Returns 150 when aspect ratio is provided

// Calculate dimensions that fit within a container
const { width, height } = calculateFitDimensions(800, 600, 1.5, 'myComponent');
// Returns dimensions that fit within the container while maintaining aspect ratio

// Format aspect ratio for CSS
const cssAspectRatio = formatAspectRatioForCSS(1.5); // "1.5"
```

## Image SrcSet Utilities

The `imageSrcSet.ts` file provides utilities for generating srcSet strings for responsive images.

### Functions

- `generateSrcSet(imagePath, getUrlFn, widths, aspectRatio, format)`: Generates a srcSet string for responsive images

### Preserving Original Aspect Ratio

When no aspect ratio is provided to `generateSrcSet`, it will pass a height value of 0 to the URL function, which signals to the image service to maintain the original aspect ratio of the image.

### Usage

```typescript
import { generateSrcSet } from '@/common/utils/imageSrcSet';
import { getThumbnailUrl } from '@/services/images';

// Generate a srcSet string for responsive images with a specific aspect ratio
const srcSet = generateSrcSet(
  'path/to/image.jpg',
  getThumbnailUrl,
  [200, 400, 800, 1200, 1600],
  1.5, // aspect ratio
  'webp' // format
);

// Generate a srcSet string that preserves the original image's aspect ratio
const preservedSrcSet = generateSrcSet(
  'path/to/image.jpg',
  getThumbnailUrl,
  [200, 400, 800, 1200, 1600],
  undefined, // no aspect ratio - preserve original
  'webp'
);
``` 