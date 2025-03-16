// SPDX-License-Identifier: Apache-2.0
/**
 * Generation Options Context
 * 
 * This module provides a context for managing generation options state.
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { 
  GenerationOptionsSchema, 
  GenerationOptions, 
  DEFAULT_OPTIONS 
} from '../schema';

// Define the context interface
interface GenerationOptionsContextValue {
  // State
  options: GenerationOptions;
  isPopoverOpen: boolean;
  isGenerating: boolean;
  
  // Actions
  updateOption: <K extends keyof GenerationOptions>(key: K, value: GenerationOptions[K]) => void;
  resetOptions: () => void;
  setOptions: (options: Partial<GenerationOptions>) => void;
  openPopover: () => void;
  closePopover: () => void;
  togglePopover: () => void;
  setIsGenerating: (isGenerating: boolean) => void;
}

// Create the context with a default value
const GenerationOptionsContext = createContext<GenerationOptionsContextValue | undefined>(undefined);

// Provider props interface
interface GenerationOptionsProviderProps {
  readonly children: React.ReactNode;
  readonly initialOptions?: Partial<GenerationOptions>;
  readonly onOptionsChange?: (options: GenerationOptions) => void;
  readonly initialGenerating?: boolean;
}

/**
 * Provider component for generation options
 */
export function GenerationOptionsProvider({
  children,
  initialOptions = {},
  onOptionsChange,
  initialGenerating = false,
}: Readonly<GenerationOptionsProviderProps>) {
  // Parse initial options through the schema to ensure valid defaults
  const defaultOptions = useMemo(() => {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...initialOptions };
    return GenerationOptionsSchema.parse(mergedOptions);
  }, [initialOptions]);
  
  // State
  const [options, setOptions] = useState<GenerationOptions>(defaultOptions);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(initialGenerating);
  
  // Update generating state when initialGenerating changes
  useEffect(() => {
    setIsGenerating(initialGenerating);
  }, [initialGenerating]);
  
  // Update a single option
  const updateOption = useCallback(<K extends keyof GenerationOptions>(
    key: K, 
    value: GenerationOptions[K]
  ) => {
    setOptions(prev => {
      const newOptions = { ...prev, [key]: value };
      // Notify parent if callback is provided
      if (onOptionsChange) {
        onOptionsChange(newOptions);
      }
      return newOptions;
    });
  }, [onOptionsChange]);
  
  // Reset options to defaults
  const resetOptions = useCallback(() => {
    setOptions(defaultOptions);
    if (onOptionsChange) {
      onOptionsChange(defaultOptions);
    }
  }, [defaultOptions, onOptionsChange]);
  
  // Set multiple options at once
  const mergeOptions = useCallback((newOptions: Partial<GenerationOptions>) => {
    setOptions(prev => {
      const updatedOptions = { ...prev, ...newOptions };
      if (onOptionsChange) {
        onOptionsChange(updatedOptions);
      }
      return updatedOptions;
    });
  }, [onOptionsChange]);
  
  // Popover controls
  const openPopover = useCallback(() => setIsPopoverOpen(true), []);
  const closePopover = useCallback(() => setIsPopoverOpen(false), []);
  const togglePopover = useCallback(() => setIsPopoverOpen(prev => !prev), []);
  
  // Context value
  const value = useMemo(() => ({
    // State
    options,
    isPopoverOpen,
    isGenerating,
    
    // Actions
    updateOption,
    resetOptions,
    setOptions: mergeOptions,
    openPopover,
    closePopover,
    togglePopover,
    setIsGenerating,
  }), [
    options, 
    isPopoverOpen, 
    isGenerating, 
    updateOption, 
    resetOptions, 
    mergeOptions, 
    openPopover, 
    closePopover, 
    togglePopover
  ]);
  
  return (
    <GenerationOptionsContext.Provider value={value}>
      {children}
    </GenerationOptionsContext.Provider>
  );
}

/**
 * Hook to access the generation options context
 */
export function useGenerationOptions() {
  const context = useContext(GenerationOptionsContext);
  
  if (context === undefined) {
    throw new Error('useGenerationOptions must be used within a GenerationOptionsProvider');
  }
  
  return context;
}

// Export a named export for the context
export { GenerationOptionsContext }; 