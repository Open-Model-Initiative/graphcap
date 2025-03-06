# Editor Hooks

This directory contains custom React hooks for the Editor feature. These hooks encapsulate related state and logic to make the components more maintainable and easier to test.

## Available Hooks

### useDatasets

Manages dataset-related state and operations:
- Fetching and caching datasets
- Creating new datasets
- Adding images to datasets
- Selecting datasets and subfolders

```typescript
const {
  selectedDataset,
  selectedSubfolder,
  datasetsData,
  filteredImages,
  isLoading,
  error,
  handleDatasetChange,
  handleCreateDataset,
  handleAddToDataset,
  handleUploadComplete
} = useDatasets();
```

### useImageSelection

Manages image selection state and operations:
- Selecting images
- Managing carousel index
- Preloading images for better performance
- Toggling properties panel

```typescript
const {
  selectedImage,
  carouselIndex,
  showProperties,
  setSelectedImage,
  handleSelectImage,
  handleToggleProperties,
  handleSaveProperties
} = useImageSelection(filteredImages);
```

### useImageEditor

Manages image editing state and operations:
- Starting and canceling edit mode
- Saving edited images
- Refreshing cache after edits

```typescript
const {
  isEditing,
  handleEditImage,
  handleSave,
  handleCancel
} = useImageEditor({ selectedDataset });
```

### useViewMode

Manages view mode state and operations:
- Switching between grid and carousel views
- Ensuring proper image selection when changing views

```typescript
const {
  viewMode,
  setViewMode
} = useViewMode({
  selectedImage,
  setSelectedImage,
  filteredImages,
  setShowProperties
});
```

### useUploader

Manages uploader visibility:
- Showing and hiding the uploader component

```typescript
const {
  showUploader,
  handleToggleUploader
} = useUploader();
```

## Refactoring Benefits

This hook-based architecture provides several benefits:

1. **Separation of Concerns**: Each hook focuses on a specific aspect of functionality
2. **Reusability**: Hooks can be reused across different components
3. **Testability**: Smaller, focused hooks are easier to test
4. **Maintainability**: Easier to understand and modify specific functionality
5. **Reduced Component Size**: The EditorContainer component is now much smaller and more focused

## Usage

Import the hooks in your component:

```typescript
import {
  useDatasets,
  useImageSelection,
  useImageEditor,
  useViewMode,
  useUploader
} from '../hooks';
```

Then use them in your component to access the state and functions they provide. 