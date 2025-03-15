// SPDX-License-Identifier: Apache-2.0
/**
 * Perspective UI Context
 * 
 * This context manages UI state and rendering utilities for perspectives.
 * It follows the Context API best practices and separates UI concerns from data fetching.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { PerspectiveSchema } from '../types';

// Define the context type with explicit typing
interface PerspectiveUIContextType {
  // UI state
  activeSchemaName: string | null;
  selectedProviderId: number | undefined;
  isGeneratingAll: boolean;
  
  // UI actions
  setActiveSchemaName: (schemaName: string | null) => void;
  setSelectedProviderId: (providerId: number | undefined) => void;
  setIsGeneratingAll: (isGenerating: boolean) => void;
  handleProviderChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  
  // Rendering utilities
  renderField: (field: PerspectiveSchema['schema_fields'][0], value: any) => ReactNode;
}

// Create context with undefined default value
const PerspectiveUIContext = createContext<PerspectiveUIContextType | undefined>(undefined);

/**
 * Error type for when the PerspectiveUIContext is used outside of a provider
 */
export class PerspectiveUIProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PerspectiveUIProviderError';
  }
}

interface PerspectiveUIProviderProps {
  children: ReactNode;
  initialProviderId?: number;
}

/**
 * Provider component for perspective UI state and utilities
 */
export function PerspectiveUIProvider({ 
  children, 
  initialProviderId 
}: PerspectiveUIProviderProps) {
  // UI state
  const [activeSchemaName, setActiveSchemaName] = React.useState<string | null>(null);
  const [selectedProviderId, setSelectedProviderId] = React.useState<number | undefined>(initialProviderId);
  const [isGeneratingAll, setIsGeneratingAll] = React.useState<boolean>(false);

  // Provider change handler
  const handleProviderChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      const value = e.target.value;
      setSelectedProviderId(value ? Number(value) : undefined);
    } catch (error) {
      console.error('Error handling provider change:', error);
      // Continue with undefined provider ID on error
      setSelectedProviderId(undefined);
    }
  }, []);

  // Field rendering utility function
  const renderField = (field: PerspectiveSchema['schema_fields'][0], value: any) => {
    try {
      if (!field) return null;

      if (field.is_list && field.is_complex && field.fields) {
        return (
          <div className="space-y-2">
            {Array.isArray(value) && value.map((item: any, index: number) => (
              <div key={index} className="bg-gray-800 p-2 rounded">
                {field.fields?.map((subField: any) => (
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
    } catch (error) {
      console.error('Error rendering field:', error);
      return (
        <p className="text-red-500 text-sm">Error rendering field: {error instanceof Error ? error.message : 'Unknown error'}</p>
      );
    }
  };

  // Create context value object
  const value: PerspectiveUIContextType = {
    // UI state
    activeSchemaName,
    selectedProviderId,
    isGeneratingAll,
    
    // UI actions
    setActiveSchemaName,
    setSelectedProviderId,
    setIsGeneratingAll,
    handleProviderChange,
    
    // Rendering utilities
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
  
  if (context === undefined) {
    console.error('usePerspectiveUI was called outside of a PerspectiveUIProvider');
    throw new PerspectiveUIProviderError(
      'usePerspectiveUI must be used within a PerspectiveUIProvider'
    );
  }
  
  return context;
} 