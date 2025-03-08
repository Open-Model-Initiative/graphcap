# Utility Functions

This directory contains utility functions used throughout the Graphcap Studio application.

## Aspect Ratio Utilities

The `aspectRatio.ts` file provides utilities for handling aspect ratio calculations with logging to help track down issues.

### Functions

- `calculateHeightFromAspectRatio(width, aspectRatio, source)`: Calculates height from width and aspect ratio
- `calculateWidthFromAspectRatio(height, aspectRatio, source)`: Calculates width from height and aspect ratio
- `calculateFitDimensions(containerWidth, containerHeight, aspectRatio, source)`: Calculates dimensions that fit within a container while maintaining aspect ratio
- `formatAspectRatioForCSS(aspectRatio)`: Formats an aspect ratio for CSS

### Logging

These utilities include detailed logging to help track down issues with aspect ratio calculations. The logging is only enabled in development mode and includes:

- Source identifier to track where the calculation is happening
- Input values (width, height, aspect ratio)
- Calculated values
- Warnings for invalid aspect ratios

Example log output:
```
[AspectRatio] generateSrcSet: Width 200 ÷ Aspect 1.5 = Height 133
[AspectRatio] useDynamicThumbnails-init: No aspect ratio provided, using width (64) as height
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

// Calculate width from height and aspect ratio
const width = calculateWidthFromAspectRatio(100, 1.5, 'myComponent');

// Calculate dimensions that fit within a container
const { width, height } = calculateFitDimensions(800, 600, 1.5, 'myComponent');

// Format aspect ratio for CSS
const cssAspectRatio = formatAspectRatioForCSS(1.5); // "1.5"
```

## Image SrcSet Utilities

The `imageSrcSet.ts` file provides utilities for generating srcSet strings for responsive images.

### Functions

- `generateSrcSet(imagePath, getUrlFn, widths, aspectRatio, format)`: Generates a srcSet string for responsive images

### Usage

```typescript
import { generateSrcSet } from '@/common/utils/imageSrcSet';
import { getThumbnailUrl } from '@/services/images';

// Generate a srcSet string for responsive images
const srcSet = generateSrcSet(
  'path/to/image.jpg',
  getThumbnailUrl,
  [200, 400, 800, 1200, 1600],
  1.5, // aspect ratio
  'webp' // format
);
``` 