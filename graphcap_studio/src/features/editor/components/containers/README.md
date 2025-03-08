# SPDX-License-Identifier: Apache-2.0
# Editor Container Components

This directory contains container components for the editor feature. These components are responsible for composing UI components and handling state management.

## Components

### ViewerContainer

The `ViewerContainer` component is responsible for rendering the appropriate viewer component based on the current view mode (grid or carousel). It also handles responsive layout adjustments for different screen sizes and zoom levels.

#### Props

- `images`: Array of images to display
- `selectedImage`: Currently selected image
- `onSelectImage`: Callback for when an image is selected
- `onEditImage`: Callback for when the edit action is triggered
- `onAddToDataset`: Callback for when the add to dataset action is triggered
- `isLoading`: Whether the images are loading
- `isEmpty`: Whether there are no images to display
- `className`: Additional CSS class names

### NavigationContainer

The `NavigationContainer` component is responsible for rendering the dataset tree and navigation controls. It also handles creating new datasets.

#### Props

- `datasets`: Array of datasets to display
- `selectedDataset`: Currently selected dataset
- `selectedSubfolder`: Currently selected subfolder
- `onSelectDataset`: Callback for when a dataset is selected
- `onSelectSubfolder`: Callback for when a subfolder is selected
- `onCreateDataset`: Callback for when a new dataset is created
- `isLoading`: Whether the datasets are loading
- `className`: Additional CSS class names

### PropertiesContainer

The `PropertiesContainer` component is responsible for rendering the image properties and actions. It also handles adding images to datasets.

#### Props

- `selectedImage`: Currently selected image
- `datasets`: Array of datasets
- `onAddToDataset`: Callback for when an image is added to a dataset
- `onEditImage`: Callback for when the edit action is triggered
- `className`: Additional CSS class names

## Design Principles

The container components follow these design principles:

1. **Composition**: Container components compose UI components and handle state management.
2. **Separation of Concerns**: Container components handle state and logic, while UI components handle rendering.
3. **Adapter Pattern**: Container components adapt between different component interfaces.
4. **Responsive**: Container components handle responsive layout adjustments.

## Usage

Container components are typically used within the `EditorContainer` component, which is the main container for the editor feature. They are composed using the `EditorLayout` component to create a responsive and resizable layout.

```tsx
import { 
  ViewerContainer, 
  NavigationContainer, 
  PropertiesContainer 
} from '@/features/editor/components/containers';
import { EditorLayout } from '@/features/editor/components/layout';

function EditorContainer() {
  // State and handlers...

  return (
    <EditorLayout
      navigation={
        <NavigationContainer
          datasets={datasets}
          selectedDataset={selectedDataset}
          selectedSubfolder={selectedSubfolder}
          onSelectDataset={handleSelectDataset}
          onSelectSubfolder={handleSelectSubfolder}
          onCreateDataset={handleCreateDataset}
          isLoading={isLoading}
        />
      }
      viewer={
        <ViewerContainer
          images={images}
          selectedImage={selectedImage}
          onSelectImage={handleSelectImage}
          onEditImage={handleEditImage}
          onAddToDataset={handleAddToDataset}
          isLoading={isLoading}
          isEmpty={images.length === 0}
        />
      }
      properties={
        <PropertiesContainer
          selectedImage={selectedImage}
          datasets={datasets}
          onAddToDataset={handleAddToDataset}
          onEditImage={handleEditImage}
        />
      }
      showProperties={showProperties}
    />
  );
}
``` 