// SPDX-License-Identifier: Apache-2.0
/**
 * Perspective Caption Persistence
 * 
 * This module provides utilities for efficiently persisting perspective captions 
 * to localStorage using a dictionary with keys based on image directory, path, 
 * and perspective name.
 */

import { PerspectiveData } from '../types';

/**
 * Storage key prefix for saving perspective captions in localStorage
 */
const STORAGE_KEY_PREFIX = 'graphcap:perspective-captions';

/**
 * Generate a unique key for a perspective caption
 * 
 * @param imagePath - The full path to the image
 * @param perspectiveName - The name of the perspective
 * @returns A unique key for storing the caption
 */
export function generateCaptionKey(imagePath: string, perspectiveName: string): string {
  try {
    // Extract directory from path
    const directory = imagePath.split('/').slice(0, -1).join('/');
    
    // Create a standardized key using directory, path, and perspective
    // Replace special characters that might cause issues in localStorage keys
    const sanitizedPath = imagePath.replace(/[/\\:*?"<>|]/g, '_');
    const sanitizedDir = directory.replace(/[/\\:*?"<>|]/g, '_');
    
    return `${STORAGE_KEY_PREFIX}-${sanitizedDir}-${sanitizedPath}-${perspectiveName}`;
  } catch (error) {
    console.error('Error generating caption key:', error);
    // Fallback to a simpler key format if there's an error
    return `${STORAGE_KEY_PREFIX}-${imagePath.replace(/[/\\:*?"<>|]/g, '_')}-${perspectiveName}`;
  }
}

/**
 * Save a perspective caption to localStorage
 * 
 * @param imagePath - The full path to the image
 * @param perspectiveName - The name of the perspective
 * @param data - The perspective data to save
 */
export function savePerspectiveCaption(
  imagePath: string, 
  perspectiveName: string, 
  data: PerspectiveData
): void {
  try {
    const key = generateCaptionKey(imagePath, perspectiveName);
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.error('Failed to save perspective caption to localStorage:', error);
  }
}

/**
 * Load a perspective caption from localStorage
 * 
 * @param imagePath - The full path to the image
 * @param perspectiveName - The name of the perspective
 * @returns The perspective data if available, otherwise null
 */
export function loadPerspectiveCaption(
  imagePath: string,
  perspectiveName: string
): PerspectiveData | null {
  try {
    const key = generateCaptionKey(imagePath, perspectiveName);
    const serialized = localStorage.getItem(key);
    
    if (!serialized) return null;
    
    return JSON.parse(serialized) as PerspectiveData;
  } catch (error) {
    console.error('Failed to load perspective caption from localStorage:', error);
    return null;
  }
}

/**
 * Delete a perspective caption from localStorage
 * 
 * @param imagePath - The full path to the image
 * @param perspectiveName - The name of the perspective
 */
export function deletePerspectiveCaption(
  imagePath: string,
  perspectiveName: string
): void {
  try {
    const key = generateCaptionKey(imagePath, perspectiveName);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to delete perspective caption from localStorage:', error);
  }
}

/**
 * Get all perspective captions for an image
 * 
 * @param imagePath - The full path to the image
 * @returns A record of perspective names to perspective data
 */
export function getAllPerspectiveCaptions(
  imagePath: string
): Record<string, PerspectiveData> {
  try {
    const result: Record<string, PerspectiveData> = {};
    
    // Extract directory from path for filtering
    const directory = imagePath.split('/').slice(0, -1).join('/');
    const sanitizedPath = imagePath.replace(/[/\\:*?"<>|]/g, '_');
    const sanitizedDir = directory.replace(/[/\\:*?"<>|]/g, '_');
    
    // Filter pattern for keys that match this image
    const keyPattern = `${STORAGE_KEY_PREFIX}-${sanitizedDir}-${sanitizedPath}-`;
    
    // Loop through all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key?.startsWith(keyPattern)) {
        try {
          // Extract perspective name from key
          const perspectiveName = key.substring(keyPattern.length);
          const serialized = localStorage.getItem(key);
          
          if (serialized) {
            const data = JSON.parse(serialized) as PerspectiveData;
            result[perspectiveName] = data;
          }
        } catch (parseError) {
          console.error('Error parsing caption data:', parseError);
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error('Failed to get all perspective captions:', error);
    return {};
  }
}

/**
 * Clear all perspective captions from localStorage
 */
export function clearAllPerspectiveCaptions(): void {
  try {
    const keysToRemove: string[] = [];
    
    // Find all keys that match our prefix
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all matching keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Failed to clear all perspective captions:', error);
  }
} 