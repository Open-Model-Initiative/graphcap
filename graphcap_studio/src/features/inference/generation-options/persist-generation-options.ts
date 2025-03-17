// SPDX-License-Identifier: Apache-2.0
/**
 * Generation Options Persistence
 * 
 * This module provides utilities for persisting generation options to localStorage.
 */

import { GenerationOptions, GenerationOptionsSchema} from './schema';

/**
 * Storage key for saving generation options in localStorage
 */
const STORAGE_KEY = 'graphcap:generation-options';

/**
 * Save generation options to localStorage
 */
export function saveGenerationOptions(options: GenerationOptions): void {
  try {
    const serialized = JSON.stringify(options);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Failed to save generation options to localStorage:', error);
  }
}

/**
 * Load generation options from localStorage
 * 
 * Returns the saved options if available and valid, otherwise returns null
 */
export function loadGenerationOptions(): GenerationOptions | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;
    
    const parsed = JSON.parse(serialized);
    // Validate the loaded data against the schema
    return GenerationOptionsSchema.parse(parsed);
  } catch (error) {
    console.error('Failed to load generation options from localStorage:', error);
    // Remove potentially corrupted data
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

/**
 * Clear stored generation options from localStorage
 */
export function clearGenerationOptions(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear generation options from localStorage:', error);
  }
}

/**
 * Hook to sync generation options with localStorage
 * 
 * This hook can be used inside the GenerationOptionsProvider to:
 * 1. Initialize options from localStorage if available
 * 2. Save options to localStorage when they change
 */
export function usePersistGenerationOptions() {
  const loadPersistedOptions = (): Partial<GenerationOptions> => {
    const savedOptions = loadGenerationOptions();
    return savedOptions || {};
  };
  
  return {
    loadPersistedOptions,
    saveOptions: saveGenerationOptions,
    clearOptions: clearGenerationOptions
  };
} 