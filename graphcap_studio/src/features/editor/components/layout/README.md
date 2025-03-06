# SPDX-License-Identifier: Apache-2.0
# Editor Layout System

This directory contains components for the editor layout system, which provides a responsive and resizable layout for the editor feature.

## Components

### EditorLayout

The `EditorLayout` component provides a three-panel layout with resizable navigation, viewer, and properties panels. The panels can be resized by dragging the dividers between them.

#### Props

- `navigation`: React node to render in the navigation panel
- `viewer`: React node to render in the viewer panel
- `properties`: React node to render in the properties panel
- `defaultNavigationWidth`: Default width of the navigation panel (default: 280px)
- `defaultPropertiesWidth`: Default width of the properties panel (default: 320px)
- `minNavigationWidth`: Minimum width of the navigation panel (default: 200px)
- `minViewerWidth`: Minimum width of the viewer panel (default: 400px)
- `minPropertiesWidth`: Minimum width of the properties panel (default: 250px)
- `showProperties`: Whether to show the properties panel (default: true)
- `className`: Additional CSS class names

#### Usage

```tsx
import { EditorLayout } from '@/features/editor/components/layout';

function MyComponent() {
  return (
    <EditorLayout
      navigation={<NavigationComponent />}
      viewer={<ViewerComponent />}
      properties={<PropertiesComponent />}
      showProperties={true}
    />
  );
}
```

## Design Principles

The layout system follows these design principles:

1. **Responsive**: The layout adapts to different screen sizes and resolutions.
2. **Resizable**: Users can resize the panels to customize their workspace.
3. **Flexible**: The layout can be configured with different default and minimum sizes.
4. **Consistent**: The layout maintains a consistent look and feel across different views.

## Implementation Details

The layout system uses CSS Flexbox for the overall layout and JavaScript for handling the resizing functionality. It uses the ResizeObserver API to detect changes in the container size and adjust the layout accordingly.

The resizing functionality is implemented using mouse events:

1. `mousedown` on the divider starts the resizing operation
2. `mousemove` on the document updates the panel sizes
3. `mouseup` on the document ends the resizing operation

The layout system ensures that the panels never shrink below their minimum sizes and that the viewer panel always has enough space to display its content. 