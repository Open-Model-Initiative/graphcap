# services/ Directory

The `services/` folder contains application-wide services and API clients. These modules encapsulate business logic and data integration that are shared across multiple features.

## Conventions

- **API Clients:**  
  - Centralize code for making API calls, handling network errors, and managing authentication.
  - Ensure that API clients are modular and can be reused across features.

- **Business Logic:**  
  - Include shared services that perform data transformations or domain-specific calculations.
  - Keep these services stateless whenever possible.

- **Data Providers:**  
  - Include modules that interact with external data sources, cache data, or provide integration points.
  - These services should expose clear and consistent interfaces.

## Best Practices

- **Separation of Concerns:**  
  Ensure that services do not mix UI logic. They should solely focus on data and business logic.

- **Testing:**  
  Write unit tests for service modules to verify their behavior, and document the expected inputs and outputs.

- **Feature vs. Global Services:**  
  If a service is used only by a specific feature, consider placing it in that feature's `services/` folder instead of here.
