# Perspectives Feature

This feature provides functionality for working with different perspectives on images in GraphCap Studio.

## Context Architecture

The perspectives feature uses a hierarchical context architecture to manage state efficiently:

1. **PerspectivesDataProvider**: Manages server data fetching and API communication
2. **PerspectivesCaptionProvider**: Handles caption data via localStorage and generation status
3. **PerspectiveUIProvider**: Manages UI state like active perspective and provider selection

### Caption Storage

Captions for perspectives are stored locally in the browser's localStorage. This provides several benefits:
- Persistence between sessions
- Reduced server load
- Improved performance
- Simplified data flow

The storage uses a key format of `datasetId_imageFilename_perspectiveName` to organize captions.

Access the caption functionality using:

```typescript
const { 
  captions,
  generatedPerspectives, 
  isGenerating,
  generatePerspective,
  isPerspectiveGenerated,
  isPerspectiveGenerating,
  getPerspectiveData
} = usePerspectivesCaption();
```

This replaces the previous complex prop-drilling approach where these properties were passed down through multiple component layers.

## Context Structure

The perspectives feature uses a context-based approach for state management, following React Context API best practices. The context structure has been refactored to separate data concerns from UI concerns:

### Data Context

`PerspectivesDataContext` - Responsible for data fetching and data state management:

- Manages perspectives data from the server
- Provides access to schemas and data operations
- Handles error states and loading states
- Uses React Query for data fetching under the hood

### UI Context

`PerspectiveUIContext` - Responsible for UI state:

- Manages active perspective selection
- Handles provider selection
- Manages UI-specific state like generation status
- Provides rendering utilities for perspective fields

### Inference Context

`PerspectiveInferenceContext` - Responsible for inference provider management:

- Handles provider selection and availability
- Manages inference generation status
- Provides methods for interacting with providers
- Abstracts provider data fetching from the inference feature

### Combined Provider

`PerspectivesProvider` - A convenience wrapper that combines both contexts:

- Wraps both data and UI providers
- Simplifies usage in the application
- Ensures proper provider nesting

## Error Handling

The feature implements comprehensive error handling throughout:

- **Custom Error Types**: Specialized error classes for different error scenarios
  - `PerspectiveError`: For data fetching errors
  - `PerspectivesDataProviderError`: For context usage errors
  - `PerspectiveUIProviderError`: For UI context usage errors

- **Error Boundaries**: The `WrappedPerspectives` component includes an error boundary to catch rendering errors

- **Graceful Degradation**: Components handle error states gracefully with fallback UIs

- **Detailed Error Logging**: Errors are logged with context information for easier debugging

- **Context Safety**: All hooks verify they're being used within the appropriate provider

## Component Structure

- **Perspectives.tsx** - Main component that displays perspectives for an image
- **PerspectiveCard.tsx** - Component for displaying a single perspective with controls
- **PerspectiveContent.tsx** - Component for displaying perspective content
- **WrappedPerspectives.tsx** - Wrapper with error boundary and context providers

## Usage

### Basic Usage

The safest way to use the Perspectives feature is with the `WrappedPerspectives` component:

```tsx
import { WrappedPerspectives } from './features/perspectives';

function YourComponent() {
  const image = ...; // Your image data
  
  return <WrappedPerspectives image={image} />;
}
```

### Advanced Usage

For more control, you can use the providers and hooks directly:

```tsx
import { 
  PerspectivesProvider, 
  usePerspectivesData, 
  usePerspectiveUI 
} from './features/perspectives/context';

// At the app level
function App() {
  return (
    <PerspectivesProvider>
      <YourComponent />
    </PerspectivesProvider>
  );
}

// In a component
function YourComponent() {
  // Access data state
  const { perspectives, schemas, isLoading, error } = usePerspectivesData();
  
  // Access UI state
  const { activeSchemaName, setActiveSchemaName } = usePerspectiveUI();
  
  // Handle errors
  if (error) {
    return <ErrorDisplay error={error} />;
  }
  
  // Your component code
}
```

## Services

The perspectives feature uses services to interact with the GraphCap server:

- **api.ts** - Provides direct API methods for interacting with the perspectives service
- **utils.ts** - Utility functions for the perspectives service

## Hooks

Custom hooks are provided for working with perspectives:

- **usePerspectives** - Fetches available perspectives from the server
- **useGeneratePerspectiveCaption** - Generates captions for images using perspectives
