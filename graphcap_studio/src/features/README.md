# features/ Directory

The `features/` folder contains code specific to individual domains or features within graphcap Studio. Each feature is organized into its own subdirectory (e.g., `gallery`, `editor`, etc.).

## Conventions for Each Feature

Within each feature subfolder (for example, `features/gallery`), adhere to the following structure:

- **components/**:  

  - Contains presentational components that are primarily concerned with UI rendering.
  - These should be “dumb” components that receive data and callbacks via props.

- **containers/**:  
  - Contains “smart” components that encapsulate business logic, state management, and side effects.
  - These components connect with global state or services and pass down data to presentational components.

- **hooks/**:  
  - Contains feature-specific custom hooks (e.g., `useGalleryState`).
  - Use these hooks to encapsulate repeated logic that is unique to the feature.

- **services/** (Optional):  
  - Place feature-specific services here (e.g., gallery-related API calls or utility modules).
  - If the service is broadly used, consider moving it to the global `services/` folder.

## Best Practices

- **Encapsulation:**  
  Keep all code related to a single feature together. This makes maintenance and future changes easier.

- **Reuse Common Code:**  
  When a component or hook can be used across multiple features, move it to the `common/` folder instead.

- **Documentation:**  
  Each feature should have a README (if needed) detailing its specific architecture, dependencies, and any feature-specific guidelines.
