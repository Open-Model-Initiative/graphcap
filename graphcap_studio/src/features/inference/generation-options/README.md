# Generation Options Module

This module provides components and context for managing model generation options such as temperature, max tokens, top_p, and repetition penalty.

## Features

- React Context API for state management
- Zod schema for validation
- Chakra UI Popover for form display
- Individual field components for easy reuse

## Usage

### Basic Setup

Wrap your component tree with the provider:

```tsx
import { GenerationOptionsProvider } from '@/features/inference/generation-options';

function App() {
  return (
    <GenerationOptionsProvider>
      <YourComponent />
    </GenerationOptionsProvider>
  );
}
```

### Using the Button

The simplest way to add generation options to your UI:

```tsx
import { GenerationOptionsButton } from '@/features/inference/generation-options';

function YourComponent() {
  return (
    <div>
      {/* Other UI elements */}
      <GenerationOptionsButton label="Generation Settings" />
    </div>
  );
}
```

### Custom Trigger

You can use your own trigger element instead of the default button:

```tsx
import { GenerationOptionsPopover, useGenerationOptions } from '@/features/inference/generation-options';
import { IconButton } from '@/components/ui';

function YourComponent() {
  const { togglePopover } = useGenerationOptions();
  
  return (
    <div>
      {/* Other UI elements */}
      <GenerationOptionsPopover>
        <IconButton
          icon="settings"
          onClick={togglePopover}
          aria-label="Generation Options"
        />
      </GenerationOptionsPopover>
    </div>
  );
}
```

### Accessing Options State

You can access the current options state anywhere in your component tree:

```tsx
import { useGenerationOptions } from '@/features/inference/generation-options';

function YourComponent() {
  const { options, updateOption, resetOptions } = useGenerationOptions();
  
  // Example: Get the current temperature value
  console.log('Current temperature:', options.temperature);
  
  // Example: Update an option
  const handleTemperatureChange = (newValue) => {
    updateOption('temperature', newValue);
  };
  
  return (
    <div>
      {/* Your UI using options */}
    </div>
  );
}
```

### Getting Notified of Changes

You can pass an `onOptionsChange` callback to the provider:

```tsx
import { GenerationOptionsProvider } from '@/features/inference/generation-options';
import type { GenerationOptions } from '@/features/inference/generation-options';

function App() {
  const handleOptionsChange = (options: GenerationOptions) => {
    console.log('Options changed:', options);
    // Do something with the updated options
  };
  
  return (
    <GenerationOptionsProvider onOptionsChange={handleOptionsChange}>
      <YourComponent />
    </GenerationOptionsProvider>
  );
}
```

## Components

- `GenerationOptionsProvider`: Context provider
- `GenerationOptionsButton`: Button that opens the options popover
- `GenerationOptionsPopover`: Popover container for custom triggers
- Field Components:
  - `TemperatureField`: Controls the temperature option
  - `MaxTokensField`: Controls the max_tokens option
  - `TopPField`: Controls the top_p option
  - `RepetitionPenaltyField`: Controls the repetition_penalty option

## API

### GenerationOptionsProvider Props

| Prop | Type | Description |
|------|------|-------------|
| `children` | `React.ReactNode` | Child components |
| `initialOptions` | `Partial<GenerationOptions>` | Initial values for options |
| `onOptionsChange` | `(options: GenerationOptions) => void` | Callback when options change |

### GenerationOptionsButton Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `'Options'` | Button text |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'sm'` | Button size |
| `variant` | `'solid' \| 'outline' \| 'ghost'` | `'outline'` | Button variant |

### useGenerationOptions Hook

The hook returns an object with the following properties:

- `options`: Current options state
- `isPopoverOpen`: Whether the popover is open
- `isGenerating`: Whether generation is in progress
- `updateOption`: Function to update a single option
- `resetOptions`: Function to reset options to defaults
- `setOptions`: Function to update multiple options
- `openPopover`: Function to open the popover
- `closePopover`: Function to close the popover
- `togglePopover`: Function to toggle the popover
- `setIsGenerating`: Function to update the isGenerating state 