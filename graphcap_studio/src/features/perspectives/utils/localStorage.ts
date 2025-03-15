// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives LocalStorage Utilities
 * 
 * Utility functions for managing perspectives data in localStorage
 */

const CAPTION_STORAGE_KEY = 'graphcap_perspectives_captions';

interface StoredCaptionData {
  data: any;
  timestamp: string;
}

type StorageData = Record<string, StoredCaptionData>;

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
    const storageData: StorageData = JSON.parse(localStorage.getItem(CAPTION_STORAGE_KEY) ?? '{}');
    
    storageData[key] = {
      data,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(CAPTION_STORAGE_KEY, JSON.stringify(storageData));
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
    const storageData: StorageData = JSON.parse(localStorage.getItem(CAPTION_STORAGE_KEY) ?? '{}');
    
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
    const storageData: StorageData = JSON.parse(localStorage.getItem(CAPTION_STORAGE_KEY) ?? '{}');
    
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
    const storageData: StorageData = JSON.parse(localStorage.getItem(CAPTION_STORAGE_KEY) ?? '{}');
    
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
  } catch (error) {
    console.error('Error clearing captions from localStorage:', error);
  }
} 