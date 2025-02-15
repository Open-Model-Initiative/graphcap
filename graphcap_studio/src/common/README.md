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
