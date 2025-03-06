# SPDX-License-Identifier: Apache-2.0
# Image Editor Feature

This feature provides an integrated, interactive image viewer and editor for Graphcap Studio. It allows users to view, crop, rotate, and perform basic edits on images stored in the `/workspace` volume.

## Components

- **ImageViewer**: A component for viewing images
- **ImageEditor**: A component for editing images (crop, rotate, etc.)
- **ImageGallery**: A component for browsing and selecting images

## Integration with Gallery Feature

This feature extends the existing gallery feature to allow users to click an image and open an editor.

## Usage

```tsx
import { ImageEditor } from '@/features/editor/components/ImageEditor';

function MyComponent() {
  return (
    <ImageEditor
      imagePath="/path/to/image.jpg"
      onSave={(result) => {
        console.log('Image saved:', result);
      }}
    />
  );
}
```

## API

The editor feature uses the Graphcap Media Server API to process images. See the `services/images.ts` file for more details on the API.

## Dependencies

- **react-easy-crop**: For cropping images
- **react-dropzone**: For uploading images
- **Graphcap Media Server**: Backend service for processing images using Sharp

## Future Extensions

This feature will be extended to support video editing and other media types as the Graphcap Media Server evolves.