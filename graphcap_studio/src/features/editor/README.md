# SPDX-License-Identifier: Apache-2.0
# Image Editor Feature

This feature provides an integrated, interactive image viewer and editor for Graphcap Studio. It allows users to view, crop, rotate, and perform basic edits on images stored in the `/workspace` volume.

## Components

- **ImageViewer**: A component for viewing images
- **ImageEditor**: A component for editing images (crop, rotate, etc.)
- **ImageGallery**: A component for browsing and selecting images with both grid and carousel views
- **CreateDatasetModal**: A modal for creating new datasets
- **ImageUploader**: A component for uploading images to datasets with drag and drop support

## Features

### Grid View
- Traditional gallery layout with thumbnails
- Virtualized rendering for performance with large collections
- Lazy loading of images

### Carousel View
- Full-screen image viewing experience with maximized viewing area
- Navigation with arrow keys (Left/Right/Up/Down)
- Mouse wheel navigation (scroll up/down)
- Navigation buttons in the thumbnails bar
- Compact image counter in the bottom right
- Thumbnail strip for quick navigation between images
- Side-by-side view mode toggle buttons in the top action bar
- Fixed component heights to prevent scrollbars

### Dataset Management
- Create new datasets with a simple modal interface
- Browse datasets in a hierarchical tree view
- Navigate between datasets and subfolders

### Image Upload
- Drag and drop interface for uploading images
- Upload directly to selected datasets
- Progress tracking for multiple file uploads
- File type validation and size limits
- Error handling and feedback

## State Management

The editor feature uses React Context for state management:

- **EditorContext**: Manages UI state such as view mode (grid/carousel)
- **useEditorContext**: Hook for accessing the editor context

## Integration with Gallery Feature

This feature extends the existing gallery feature to allow users to click an image and open an editor.

## Usage

```tsx
import { ImageEditor } from '@/features/editor/components/ImageEditor';
import { EditorContextProvider } from '@/features/editor/context/EditorContext';

function MyComponent() {
  return (
    <EditorContextProvider>
      <ImageEditor
        imagePath="/path/to/image.jpg"
        onSave={(result) => {
          console.log('Image saved:', result);
        }}
      />
    </EditorContextProvider>
  );
}
```

## API

The editor feature uses the Graphcap Media Server API to process images. See the `services/images.ts` file for more details on the API.

### Key API Endpoints

- **GET /api/datasets/images**: List all datasets and their images
- **POST /api/datasets/create**: Create a new dataset
- **POST /api/images/upload**: Upload an image (optionally to a specific dataset)
- **POST /api/images/process**: Process an image (crop, rotate, etc.)
- **GET /api/images/view**: View an image (with optional thumbnail generation)

## Dependencies

- **react-easy-crop**: For cropping images
- **react-dropzone**: For uploading images with drag and drop
- **Graphcap Media Server**: Backend service for processing images using Sharp

## Future Extensions

This feature will be extended to support video editing and other media types as the Graphcap Media Server evolves.