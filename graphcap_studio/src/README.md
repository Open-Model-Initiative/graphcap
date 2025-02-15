# Source Directory

Welcome to graphcap Studio's source code repository. This document explains our Hybrid (Option C) architecture and helps you navigate our codebase.

## Directory Structure

- **app/**  
  Contains the global application initialization, routing, and top-level configuration (global providers, contexts, etc.).

- **features/**  
  Houses feature-specific code. Each feature (e.g. `canvas`) is self-contained and further divided into:
  - **components/**: Presentational (dumb) components specific to the feature.
  - **containers/**: Logic-heavy (smart) components that connect state and actions.
  - **hooks/**: Custom hooks unique to the feature.
  - **services/**: (Optional) Feature-specific business logic or API integrations.

- **common/**  
  Contains reusable code that is shared across multiple features:
  - **components/**: Generic UI components (buttons, modals, etc.).
  - **hooks/**: Shared custom hooks.
  - **utils/**: Utility functions and constants.
  - **styles/**: Global styling assets, design tokens, and Tailwind CSS overrides.

- **services/**  
  Contains application-wide services and API clients used by various features.

## How to Traverse

1. **Start in `app/`:**  
   Familiarize yourself with the global entry point, routing, and configuration.

2. **Explore `features/`:**  
   Find domain-specific code. For example, if you’re working on gallery functionality, open the `features/gallery` folder to review components, containers, hooks, and any local services.

3. **Visit `common/`:**  
   Look here for reusable UI components, shared hooks, and global utilities.

4. **Check `services/`:**  
   Locate app-wide business logic, API integrations, and data providers.

Each folder contains its own README outlining conventions and best practices. Read those to understand the guidelines for that section.
