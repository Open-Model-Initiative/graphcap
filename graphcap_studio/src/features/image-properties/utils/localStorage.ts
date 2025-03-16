// SPDX-License-Identifier: Apache-2.0
/**
 * Image Properties LocalStorage Utilities
 * 
 * Utility functions for managing image properties data in localStorage
 */
import { ImagePropertiesData } from '../context/ImagePropertiesContext';

const IMAGE_PROPERTIES_KEY = 'graphcap_image_properties';
const UI_PREFERENCES_KEY = 'graphcap_image_properties_ui';

// Keys for individual UI preferences
const SELECTED_TAB = 'selected_tab';

interface StoredPropertiesData {
  properties: ImagePropertiesData;
  timestamp: string;
}

type PropertiesStorage = Record<string, StoredPropertiesData>;

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
 * Generate a key for storing image properties
 * @param datasetId - Dataset identifier
 * @param imageFilename - Image filename
 * @returns Storage key for the image properties
 */
export function getPropertiesStorageKey(datasetId: string, imageFilename: string): string {
  return `${datasetId}_${imageFilename}`;
}

/**
 * Save image properties to localStorage
 * @param datasetId - Dataset identifier
 * @param imageFilename - Image filename
 * @param properties - Image properties data
 */
export function savePropertiesToStorage(
  datasetId: string,
  imageFilename: string,
  properties: ImagePropertiesData
): void {
  try {
    if (!datasetId || !imageFilename) {
      console.error('Invalid dataset or image filename');
      return;
    }

    const key = getPropertiesStorageKey(datasetId, imageFilename);
    const storage = getFromStorage<PropertiesStorage>(IMAGE_PROPERTIES_KEY, {});
    
    storage[key] = {
      properties,
      timestamp: new Date().toISOString()
    };
    
    setInStorage(IMAGE_PROPERTIES_KEY, storage);
    console.log('Image properties saved to localStorage:', key);
  } catch (error) {
    console.error('Error saving image properties to localStorage:', error);
  }
}

/**
 * Get image properties from localStorage
 * @param datasetId - Dataset identifier 
 * @param imageFilename - Image filename
 * @returns Image properties or null if not found
 */
export function getPropertiesFromStorage(
  datasetId: string,
  imageFilename: string
): ImagePropertiesData | null {
  try {
    if (!datasetId || !imageFilename) {
      return null;
    }
    
    const key = getPropertiesStorageKey(datasetId, imageFilename);
    const storage = getFromStorage<PropertiesStorage>(IMAGE_PROPERTIES_KEY, {});
    
    return storage[key]?.properties || null;
  } catch (error) {
    console.error('Error getting image properties from localStorage:', error);
    return null;
  }
}

/**
 * Check if properties exist in localStorage for a specific image
 * @param datasetId - Dataset identifier
 * @param imageFilename - Image filename 
 * @returns Whether properties exist for the image
 */
export function propertiesExistInStorage(
  datasetId: string,
  imageFilename: string
): boolean {
  try {
    if (!datasetId || !imageFilename) {
      return false;
    }
    
    const key = getPropertiesStorageKey(datasetId, imageFilename);
    const storage = getFromStorage<PropertiesStorage>(IMAGE_PROPERTIES_KEY, {});
    
    return !!storage[key];
  } catch (error) {
    console.error('Error checking image properties in localStorage:', error);
    return false;
  }
}

/**
 * Delete image properties from localStorage
 * @param datasetId - Dataset identifier
 * @param imageFilename - Image filename
 */
export function deletePropertiesFromStorage(
  datasetId: string,
  imageFilename: string
): void {
  try {
    if (!datasetId || !imageFilename) {
      return;
    }
    
    const key = getPropertiesStorageKey(datasetId, imageFilename);
    const storage = getFromStorage<PropertiesStorage>(IMAGE_PROPERTIES_KEY, {});
    
    if (storage[key]) {
      delete storage[key];
      setInStorage(IMAGE_PROPERTIES_KEY, storage);
    }
  } catch (error) {
    console.error('Error deleting image properties from localStorage:', error);
  }
}

/**
 * Save selected tab to localStorage
 * @param tabValue - The tab value to save
 */
export function saveSelectedTab(tabValue: string): void {
  try {
    const preferences = getUIPreferences();
    preferences[SELECTED_TAB] = tabValue;
    saveUIPreferences(preferences);
  } catch (error) {
    console.error('Error saving selected tab to localStorage:', error);
  }
}

/**
 * Get selected tab from localStorage
 * @returns The selected tab value or null if not found
 */
export function getSelectedTab(): string | null {
  try {
    const preferences = getUIPreferences();
    return preferences[SELECTED_TAB] || null;
  } catch (error) {
    console.error('Error getting selected tab from localStorage:', error);
    return null;
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