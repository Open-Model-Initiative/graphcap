// SPDX-License-Identifier: Apache-2.0
/**
 * Copy Fields Components - Shared Types
 * 
 * Common types and interfaces used across the copy fields components.
 */

// Format types for different output formats
export type FormatType = 'newline' | 'double-newline' | 'csv' | 'xml-tags';

// User preferences interface for copy field options
export interface CopyFieldsPreferences {
  fieldFilters: Record<string, boolean>;
  includeLabels: boolean;
  formatType: FormatType;
}

// Storage key for copy field preferences
export const COPY_FIELDS_PREFERENCES_KEY = "graphcap_copy_fields_preferences";

// Get field preferences from localStorage
export const getFieldPreferences = (schemaId: string): CopyFieldsPreferences => {
  if (typeof window === 'undefined') return { 
    fieldFilters: {}, 
    includeLabels: true, 
    formatType: 'newline' 
  }; // Guard against SSR
  
  try {
    const key = `${COPY_FIELDS_PREFERENCES_KEY}_${schemaId}`;
    const storedState = localStorage.getItem(key);
    if (!storedState) return { 
      fieldFilters: {}, 
      includeLabels: true, 
      formatType: 'newline' 
    };
    
    const parsed = JSON.parse(storedState);
    // Handle old format which only had fieldFilters
    if (!parsed.formatType) {
      return {
        fieldFilters: parsed,
        includeLabels: true,
        formatType: 'newline'
      };
    }
    return parsed;
  } catch (error) {
    console.error("Error reading field preferences from localStorage:", error);
    return { 
      fieldFilters: {}, 
      includeLabels: true, 
      formatType: 'newline' 
    };
  }
};

// Save field preferences to localStorage
export const saveFieldPreferences = (
  schemaId: string, 
  preferences: CopyFieldsPreferences
): void => {
  if (typeof window === 'undefined') return; // Guard against SSR
  try {
    const key = `${COPY_FIELDS_PREFERENCES_KEY}_${schemaId}`;
    localStorage.setItem(key, JSON.stringify(preferences));
  } catch (error) {
    console.error("Error saving field preferences to localStorage:", error);
  }
}; 