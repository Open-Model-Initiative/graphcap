// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives LocalStorage Utilities
 * 
 * Utility functions for managing perspectives data in localStorage
 */

const CAPTION_STORAGE_KEY = 'graphcap_perspectives_captions';
const UI_PREFERENCES_KEY = 'graphcap_ui_preferences';

// Keys for individual UI preferences
const SELECTED_PERSPECTIVE = 'selected_perspective';

interface StoredCaptionData {
  data: any;
  timestamp: string;
}

type StorageData = Record<string, StoredCaptionData>;

// In-memory cache to reduce redundant localStorage reads
const memoryCache: Record<string, any> = {};

// Debounce timeouts for delayed writes
const debounceTimeouts: Record<string, NodeJS.Timeout> = {};

/**
 * Debounce a function call
 * @param key - Unique identifier for the debounced operation
 * @param fn - Function to execute
 * @param delay - Delay in milliseconds
 */
function debounce(key: string, fn: () => void, delay: number = 300): void {
  // Clear existing timeout for this key
  if (debounceTimeouts[key]) {
    clearTimeout(debounceTimeouts[key]);
  }
  
  // Set a new timeout
  debounceTimeouts[key] = setTimeout(() => {
    fn();
    delete debounceTimeouts[key];
  }, delay);
}

/**
 * Get a value from localStorage with caching
 * @param key - The localStorage key
 * @param defaultValue - Default value if key doesn't exist
 * @returns The parsed value or default value
 */
function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    // Return from cache if available
    if (memoryCache[key] !== undefined) {
      return memoryCache[key];
    }
    
    const value = localStorage.getItem(key);
    if (value === null) {
      return defaultValue;
    }
    
    const parsed = JSON.parse(value);
    memoryCache[key] = parsed;
    return parsed;
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error);
    return defaultValue;
  }
}

/**
 * Set a value in localStorage with caching and debouncing
 * @param key - The localStorage key
 * @param value - The value to store
 * @param debounceMs - Optional debounce time in milliseconds
 */
function setInStorage(key: string, value: any, debounceMs?: number): void {
  try {
    // Update memory cache immediately
    memoryCache[key] = value;
    
    const saveToStorage = () => {
      try {
        const serialized = JSON.stringify(value);
        localStorage.setItem(key, serialized);
      } catch (error) {
        console.error(`Error setting ${key} in localStorage:`, error);
      }
    };
    
    if (debounceMs && debounceMs > 0) {
      debounce(key, saveToStorage, debounceMs);
    } else {
      saveToStorage();
    }
  } catch (error) {
    console.error(`Error setting ${key} in localStorage:`, error);
  }
}

/**
 * Get UI preferences object from localStorage
 * @returns The UI preferences object
 */
function getUIPreferences(): Record<string, any> {
  return getFromStorage<Record<string, any>>(UI_PREFERENCES_KEY, {});
}

/**
 * Save UI preferences object to localStorage
 * @param preferences - The preferences object to save
 */
function saveUIPreferences(preferences: Record<string, any>): void {
  setInStorage(UI_PREFERENCES_KEY, preferences, 300); // Debounce for 300ms
}

/**
 * Generate a unique key for storing caption data based on dataset, filename, and perspective
 */
export function getCaptionStorageKey(datasetId: string, imageFilename: string, perspectiveName: string): string {
  return `${datasetId}_${imageFilename}_${perspectiveName}`;
}

/**
 * Save caption data to localStorage
 */
export function saveCaptionToStorage(
  datasetId: string, 
  imageFilename: string, 
  perspectiveName: string, 
  data: any
): void {
  try {
    console.log('Saving caption to localStorage:', datasetId, imageFilename, perspectiveName, data);
    const key = getCaptionStorageKey(datasetId, imageFilename, perspectiveName);
    const storageData = getFromStorage<StorageData>(CAPTION_STORAGE_KEY, {});
    
    storageData[key] = {
      data,
      timestamp: new Date().toISOString()
    };
    
    setInStorage(CAPTION_STORAGE_KEY, storageData);
    console.log('Caption saved to localStorage:', key);
  } catch (error) {
    console.error('Error saving caption to localStorage:', error);
  }
}

/**
 * Get caption data from localStorage
 */
export function getCaptionFromStorage(
  datasetId: string, 
  imageFilename: string, 
  perspectiveName: string
): any | null {
  try {
    const key = getCaptionStorageKey(datasetId, imageFilename, perspectiveName);
    const storageData = getFromStorage<StorageData>(CAPTION_STORAGE_KEY, {});
    
    return storageData[key]?.data || null;
  } catch (error) {
    console.error('Error getting caption from localStorage:', error);
    return null;
  }
}

/**
 * Check if a caption exists in localStorage
 */
export function captionExistsInStorage(
  datasetId: string, 
  imageFilename: string, 
  perspectiveName: string
): boolean {
  try {
    const key = getCaptionStorageKey(datasetId, imageFilename, perspectiveName);
    const storageData = getFromStorage<StorageData>(CAPTION_STORAGE_KEY, {});
    
    return !!storageData[key];
  } catch (error) {
    console.error('Error checking caption in localStorage:', error);
    return false;
  }
}

/**
 * Get all captions for a specific image
 */
export function getAllCaptionsForImage(
  datasetId: string, 
  imageFilename: string
): Record<string, any> {
  try {
    const prefix = `${datasetId}_${imageFilename}_`;
    const storageData = getFromStorage<StorageData>(CAPTION_STORAGE_KEY, {});
    
    return Object.entries(storageData)
      .filter(([key]) => key.startsWith(prefix))
      .reduce((result, [key, value]) => {
        // Extract perspective name from the key
        const perspectiveName = key.substring(prefix.length);
        result[perspectiveName] = value.data;
        return result;
      }, {} as Record<string, any>);
  } catch (error) {
    console.error('Error getting all captions for image from localStorage:', error);
    return {};
  }
}

/**
 * Clear all captions from localStorage
 */
export function clearAllCaptions(): void {
  try {
    localStorage.removeItem(CAPTION_STORAGE_KEY);
    delete memoryCache[CAPTION_STORAGE_KEY];
  } catch (error) {
    console.error('Error clearing captions from localStorage:', error);
  }
}

/**
 * Save selected perspective name to localStorage
 */
export function saveSelectedPerspective(perspectiveName: string): void {
  try {
    const preferences = getUIPreferences();
    preferences[SELECTED_PERSPECTIVE] = perspectiveName;
    saveUIPreferences(preferences);
  } catch (error) {
    console.error('Error saving selected perspective to localStorage:', error);
  }
}

/**
 * Get selected perspective name from localStorage
 */
export function getSelectedPerspective(): string | null {
  try {
    const preferences = getUIPreferences();
    return preferences[SELECTED_PERSPECTIVE] || null;
  } catch (error) {
    console.error('Error getting selected perspective from localStorage:', error);
    return null;
  }
}

/**
 * Clear UI selections from localStorage
 */
export function clearUISelections(): void {
  try {
    const preferences = getUIPreferences();
    delete preferences[SELECTED_PERSPECTIVE];
    saveUIPreferences(preferences);
  } catch (error) {
    console.error('Error clearing UI selections from localStorage:', error);
  }
}

/**
 * Clear all in-memory cache
 * Call this when you want to force a refresh from localStorage
 */
export function clearCache(): void {
  Object.keys(memoryCache).forEach(key => {
    delete memoryCache[key];
  });
} 