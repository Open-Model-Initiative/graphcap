# common/ Directory

The `common/` folder is for code that is reused across multiple features in graphcap Studio. This includes generic UI components, shared hooks, utilities, and styling assets.

## Conventions

- **components/**:  
  - Contains generic, reusable UI components (e.g., Button, Modal, FormInput) that are not tied to any specific feature.
  - These components should be designed with flexibility and consistency in mind.

- **hooks/**:  
  - Includes shared custom hooks (e.g., `useFetch`, `useDebounce`) that provide utility across various parts of the application.
  - Ensure these hooks are well-documented and generalized.

- **utils/**:  
  - Houses helper functions, constants, and utility modules used by multiple features.
  - Avoid duplicating logic that already exists here.

- **styles/**:  
  - Contains global styling assets such as design tokens, Tailwind CSS configuration overrides, and shared CSS files.
  - Use these files to maintain consistent styling across the entire application.

## Best Practices

- **Modularity:**  
  Components and utilities in this folder should be generic enough to be used in different contexts without modification.

- **Documentation & Testing:**  
  Each module should have inline documentation and corresponding tests (if applicable) to ensure reusability and stability.

- **Avoid Duplication:**  
  Before adding a new utility or component, verify that a similar solution does not already exist in this directory.

# Common Utilities

This directory contains common utilities that are shared across features.

## Context Composition Pattern

The context composition pattern allows different feature contexts to communicate effectively while maintaining separation of concerns. This pattern consists of several key components:

### 1. AppContextProvider

The `AppContextProvider` is a composition of feature-specific initializers that wraps the application. It composes multiple initializers to provide a unified context for the application. The order of initializers matters - initializers that depend on other initializers should be nested inside them.

```tsx
// src/common/providers/AppContextProvider.tsx
export function AppContextProvider({ children }: AppContextProviderProps) {
  return (
    <DatasetInitializer>
      <EditorInitializer>
        {children}
      </EditorInitializer>
    </DatasetInitializer>
  );
}
```

### 2. Feature-Specific Initializers

Each feature provides its own initializer component that handles fetching and initializing its own context. This keeps the `AppContextProvider` decoupled from feature-specific implementation details.

```tsx
// src/features/datasets/components/DatasetInitializer.tsx
export function DatasetInitializer({ children }: DatasetInitializerProps) {
  // Fetch datasets data
  const {
    datasetsData,
    selectedDataset,
    selectedSubfolder,
    handleAddToDataset,
    isLoading
  } = useDatasets();
  
  // Extract datasets array from datasetsData if available
  const datasets = datasetsData?.datasets || [];
  
  // Show loading indicator while data is being fetched
  if (isLoading) {
    return <div className="flex h-full w-full items-center justify-center">Loading datasets...</div>;
  }
  
  return (
    <DatasetContextProvider
      initialDatasets={datasets}
      initialCurrentDataset={currentDataset}
      initialSelectedSubfolder={selectedSubfolder}
      onAddToDataset={handleAddToDataset}
    >
      {children}
    </DatasetContextProvider>
  );
}
```

### 3. useSharedContext Hook

The `useSharedContext` hook combines multiple context hooks to provide a unified interface for accessing state and actions from different features.

```tsx
// src/common/hooks/useSharedContext.ts
export function useSharedContext() {
  // Get editor context
  const editorContext = useEditorContext();
  
  // Get dataset context
  const datasetContext = useDatasetContext();
  
  // Combine contexts
  return {
    // Editor context
    ...editorContext,
    
    // Dataset context
    datasets: datasetContext.datasets,
    currentDataset: datasetContext.currentDataset,
    // ... more dataset context properties
  };
}
```

### 4. Feature-Specific Contexts

Each feature has its own context that manages feature-specific state and actions. These contexts are composed together by the initializers and accessed through the `useSharedContext` hook.

```tsx
// src/features/editor/context/EditorContext.tsx
export function useEditorContext() {
  const context = useContext(EditorContext);
  
  if (context === undefined) {
    throw new Error('useEditorContext must be used within an EditorContextProvider');
  }
  
  return context;
}
```

## Usage

To use the context composition pattern:

1. Wrap your application with the `AppContextProvider`:

```tsx
// src/app/main.tsx
root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App>
        <AppContextProvider>
          <RouterProvider router={router} />
        </AppContextProvider>
      </App>
    </QueryClientProvider>
  </StrictMode>,
);
```

2. Use the `useSharedContext` hook in your components:

```tsx
// src/features/editor/components/image-viewer/CompactActionBar.tsx
export function CompactActionBar({ totalImages, currentIndex, className = '' }: CompactActionBarProps) {
  // Get shared context that combines editor and dataset contexts
  const {
    selectedImage: image,
    datasets,
    currentDataset,
    handleEditImage,
    handleAddToDataset,
    handleDownload,
    handleDelete
  } = useSharedContext();
  
  // ... component implementation
}
```

## Benefits

- **Separation of Concerns**: Each feature manages its own state, actions, and initialization.
- **Composition**: Features can be composed together to create a unified context.
- **Type Safety**: The shared context is fully typed, providing type safety across features.
- **Testability**: Each feature context can be tested in isolation.
- **Maintainability**: Changes to one feature context don't affect other features.
- **No Leaky Abstractions**: The AppContextProvider doesn't need to know about the implementation details of each feature.
