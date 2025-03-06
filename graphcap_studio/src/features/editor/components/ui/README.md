# SPDX-License-Identifier: Apache-2.0
# Editor UI Components

This directory contains reusable UI components for the editor feature.

## Components

### ImageViewerToggle

The `ImageViewerToggle` component provides a toggle for switching between grid and carousel view modes. It uses icon-based buttons for a more intuitive user experience.

#### Props

- `viewMode`: Current view mode ('grid' or 'carousel')
- `onToggle`: Callback for when the view mode is toggled
- `className`: Additional CSS class names

#### Usage

```tsx
import { ImageViewerToggle } from '@/features/editor/components/ui';
import { useEditorContext } from '@/features/editor/context/EditorContext';

function MyComponent() {
  const { viewMode, setViewMode } = useEditorContext();

  return (
    <ImageViewerToggle
      viewMode={viewMode}
      onToggle={setViewMode}
    />
  );
}
```

### LoadingSpinner

The `LoadingSpinner` component displays a loading spinner with customizable size and color.

#### Props

- `size`: Size of the spinner ('sm', 'md', 'lg')
- `color`: Color of the spinner ('primary', 'secondary', 'white')
- `className`: Additional CSS class names

#### Usage

```tsx
import { LoadingSpinner } from '@/features/editor/components/ui';

function MyComponent() {
  return (
    <LoadingSpinner size="md" color="primary" />
  );
}
```

### NavigationButton

The `NavigationButton` component provides a button for navigating between images in the carousel view.

#### Props

- `direction`: Direction of the navigation ('prev' or 'next')
- `onClick`: Callback for when the button is clicked
- `disabled`: Whether the button is disabled
- `className`: Additional CSS class names

#### Usage

```tsx
import { NavigationButton } from '@/features/editor/components/ui';

function MyComponent() {
  const handlePrev = () => {
    // Handle previous navigation
  };

  const handleNext = () => {
    // Handle next navigation
  };

  return (
    <div>
      <NavigationButton direction="prev" onClick={handlePrev} />
      <NavigationButton direction="next" onClick={handleNext} />
    </div>
  );
}
```

## Design Principles

The UI components follow these design principles:

1. **Reusability**: Components are designed to be reused across the editor feature.
2. **Customizability**: Components accept props for customizing their appearance and behavior.
3. **Accessibility**: Components include appropriate ARIA attributes and keyboard support.
4. **Consistency**: Components maintain a consistent look and feel with the rest of the application. 