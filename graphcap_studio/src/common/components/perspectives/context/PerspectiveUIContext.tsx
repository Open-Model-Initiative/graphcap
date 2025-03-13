import React, { createContext, useContext, ReactNode } from 'react';
import { PerspectiveSchema } from '@/services/perspectives/types';

interface PerspectiveUIContextType {
  schemas: Record<string, PerspectiveSchema>;
  activeSchema: PerspectiveSchema | null;
  setActiveSchema: (schema: PerspectiveSchema | null) => void;
  renderField: (field: PerspectiveSchema['schema_fields'][0], value: any) => ReactNode;
}

const PerspectiveUIContext = createContext<PerspectiveUIContextType | null>(null);

interface PerspectiveUIProviderProps {
  children: ReactNode;
  schemas: Record<string, PerspectiveSchema>;
}

/**
 * Provider component for perspective UI state and utilities
 */
export function PerspectiveUIProvider({ children, schemas }: PerspectiveUIProviderProps) {
  const [activeSchema, setActiveSchema] = React.useState<PerspectiveSchema | null>(null);
  const [validatedSchemas, setValidatedSchemas] = React.useState<Record<string, PerspectiveSchema>>(schemas);

  // Validate schemas when they change
  React.useEffect(() => {
    try {
      // Basic schema validation
      Object.entries(schemas).forEach(([key, schema]) => {
        if (!schema.name || !schema.display_name || !schema.schema_fields) {
          console.error(`Invalid schema for perspective ${key}:`, schema);
          throw new Error(`Invalid schema for perspective ${key}`);
        }
      });
      setValidatedSchemas(schemas);
    } catch (error) {
      console.error('Error validating schemas:', error);
      setValidatedSchemas({});
    }
  }, [schemas]);

  const renderField = (field: PerspectiveSchema['schema_fields'][0], value: any) => {
    if (!field) return null;

    if (field.is_list && field.is_complex && field.fields) {
      return (
        <div className="space-y-2">
          {Array.isArray(value) && value.map((item: any, index: number) => (
            <div key={index} className="bg-gray-800 p-2 rounded">
              {field.fields.map((subField) => (
                <div key={subField.name} className="text-sm">
                  <span className="text-gray-400">{subField.name}: </span>
                  <span className="text-gray-200">
                    {subField.type === 'float' && typeof item[subField.name] === 'number'
                      ? item[subField.name].toFixed(2)
                      : item[subField.name]}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    }

    if (field.type === 'str') {
      return <p className="text-gray-200">{value}</p>;
    }

    if (field.type === 'float' && typeof value === 'number') {
      return <p className="text-gray-200">{value.toFixed(2)}</p>;
    }

    return null;
  };

  const value = {
    schemas: validatedSchemas,
    activeSchema,
    setActiveSchema,
    renderField,
  };

  return (
    <PerspectiveUIContext.Provider value={value}>
      {children}
    </PerspectiveUIContext.Provider>
  );
}

/**
 * Hook to access perspective UI context
 * Must be used within a PerspectiveUIProvider
 */
export function usePerspectiveUI() {
  const context = useContext(PerspectiveUIContext);
  if (!context) {
    throw new Error('usePerspectiveUI must be used within a PerspectiveUIProvider');
  }
  return context;
} 