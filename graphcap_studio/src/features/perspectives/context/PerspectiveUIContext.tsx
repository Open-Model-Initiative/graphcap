// SPDX-License-Identifier: Apache-2.0
/**
 * Perspective UI Context
 * 
 * This context manages UI state and rendering utilities for perspectives.
 * It follows the Context API best practices and focuses exclusively on UI concerns.
 */

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { PerspectiveSchema } from '../types';
import { saveSelectedPerspective, getSelectedPerspective } from '../utils/localStorage';

// Define the context type with explicit typing
interface PerspectiveUIContextType {
  // UI state
  activeSchemaName: string | null;
  expandedPanels: Record<string, boolean>;
  
  // UI actions
  setActiveSchemaName: (schemaName: string | null) => void;
  togglePanelExpansion: (panelId: string) => void;
  setAllPanelsExpanded: (expanded: boolean) => void;
  
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
}

/**
 * Provider component for perspective UI state and utilities
 * Focused exclusively on UI concerns
 */
export function PerspectiveUIProvider({ 
  children
}: PerspectiveUIProviderProps) {
  // UI state - initialize with value from localStorage if available
  const [activeSchemaName, setActiveSchemaNameState] = React.useState<string | null>(() => {
    return getSelectedPerspective();
  });
  const [expandedPanels, setExpandedPanels] = React.useState<Record<string, boolean>>({});

  // Persist activeSchemaName to localStorage when it changes
  useEffect(() => {
    if (activeSchemaName) {
      saveSelectedPerspective(activeSchemaName);
    }
  }, [activeSchemaName]);

  // Wrapper for setActiveSchemaName to also save to localStorage
  const setActiveSchemaName = React.useCallback((schemaName: string | null) => {
    setActiveSchemaNameState(schemaName);
    if (schemaName) {
      saveSelectedPerspective(schemaName);
    }
  }, []);

  // Panel expansion handlers
  const togglePanelExpansion = React.useCallback((panelId: string) => {
    setExpandedPanels(prev => ({
      ...prev,
      [panelId]: !prev[panelId]
    }));
  }, []);

  const setAllPanelsExpanded = React.useCallback((expanded: boolean) => {
    setExpandedPanels(prev => {
      const newState = { ...prev };
      Object.keys(newState).forEach(key => {
        newState[key] = expanded;
      });
      return newState;
    });
  }, []);

  // Field rendering utility function
  const renderField = React.useCallback((field: PerspectiveSchema['schema_fields'][0], value: any) => {
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
  }, []);

  // Create context value object
  const value: PerspectiveUIContextType = {
    // UI state
    activeSchemaName,
    expandedPanels,
    
    // UI actions
    setActiveSchemaName,
    togglePanelExpansion,
    setAllPanelsExpanded,
    
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