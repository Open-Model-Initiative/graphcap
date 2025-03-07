# UI Components

This directory contains reusable UI components that can be used throughout the application.

## responsive-image

A submodule containing components for optimized image loading and display.

### Components

#### ResponsiveImage

A performant, responsive image component that optimizes loading and display without changing its container.

```tsx
import { ResponsiveImage } from '@/common/components/ui';

// Basic usage
<ResponsiveImage 
  imagePath="/path/to/image.jpg" 
  alt="Description of the image" 
/>

// With aspect ratio (16:9)
<ResponsiveImage 
  imagePath="/path/to/image.jpg" 
  alt="Description of the image"
  aspectRatio={16/9}
/>

// High priority image (above the fold)
<ResponsiveImage 
  imagePath="/path/to/image.jpg" 
  alt="Description of the image"
  priority={true}
/>

// Custom object-fit
<ResponsiveImage 
  imagePath="/path/to/image.jpg" 
  alt="Description of the image"
  objectFit="contain"
/>

// Custom sizes attribute
<ResponsiveImage 
  imagePath="/path/to/image.jpg" 
  alt="Description of the image"
  sizes="(max-width: 500px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>

// With event handlers
<ResponsiveImage 
  imagePath="/path/to/image.jpg" 
  alt="Description of the image"
  onLoad={() => console.log('Image loaded')}
  onError={(error) => console.error('Image failed to load', error)}
/>
```

#### ThumbnailImage

A specialized thumbnail component based on ResponsiveImage with selection state.

```tsx
import { ThumbnailImage } from '@/common/components/ui';

// Basic usage
<ThumbnailImage 
  imagePath="/path/to/image.jpg" 
  alt="Description of the image"
  isSelected={true}
  onClick={() => handleSelect(image)}
/>
```

### Features

- **Automatic responsive sizing** with srcset for optimal image loading
- **Lazy loading** for images below the fold
- **Proper aspect ratio preservation**
- **Loading states** with placeholders
- **Error handling** with visual feedback
- **Priority loading** for critical above-the-fold images

### Props

#### ResponsiveImage Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `imagePath` | `string` | (required) | Path to the image file |
| `alt` | `string` | (required) | Alternative text for the image |
| `className` | `string` | `''` | Optional CSS class name |
| `aspectRatio` | `number` | `undefined` | Optional aspect ratio to maintain (width/height) |
| `priority` | `boolean` | `false` | Whether this image is high priority (e.g. above the fold) |
| `objectFit` | `'contain' \| 'cover' \| 'fill' \| 'none' \| 'scale-down'` | `'cover'` | Optional object-fit style |
| `sizes` | `string` | `'(max-width: 768px) 100vw, 50vw'` | Optional sizes attribute for the image |
| `onLoad` | `() => void` | `undefined` | Optional callback when image loads successfully |
| `onError` | `(error: Error) => void` | `undefined` | Optional callback when image fails to load |

#### ThumbnailImage Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `imagePath` | `string` | (required) | Path to the image file |
| `alt` | `string` | (required) | Alternative text for the image |
| `isSelected` | `boolean` | `false` | Whether this thumbnail is currently selected |
| `className` | `string` | `''` | Optional CSS class name |
| `aspectRatio` | `number` | `1` | Optional aspect ratio to maintain (width/height) |
| `onClick` | `() => void` | `undefined` | Optional click handler |

### Implementation Details

The components use modern browser features for optimal image loading:

- Uses `srcset` with width descriptors for responsive images
- Implements native lazy loading with `loading="lazy"`
- Uses `fetchPriority="high"` for critical images
- Sets `decoding="async"` for non-critical images
- Provides proper `sizes` attribute to help browsers select the right image size

Based on best practices from: [Builder.io Fast Images](https://www.builder.io/blog/fast-images) 