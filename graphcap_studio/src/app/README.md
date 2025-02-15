# app/ Directory

The `app/` folder contains the core initialization code and global configuration for graphcap Studio.

## Conventions

- **Entry Point & Bootstrapping:**  
  This folder includes the main entry file (e.g. `main.jsx` or `index.jsx`) responsible for bootstrapping the application. Here you will set up global providers such as theme, state management, and routing.

- **Routing:**  
  All high-level routing logic and navigational components are defined in this directory. Use a centralized routing strategy so that route updates are easy to manage.

- **Global Providers:**  
  Initialize contexts (e.g. AuthContext, ThemeProvider) in this folder. Ensure that global configuration is kept separate from feature-specific logic.

## Best Practices

- **Keep it Lean:**  
  Avoid placing business logic or complex UI components in this folder. Instead, delegate those responsibilities to the `features/` directory.

- **Single Responsibility:**  
  The code here should only be concerned with app-level configuration and setup.
