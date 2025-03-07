// SPDX-License-Identifier: Apache-2.0
/**
 * Background WebP Generator
 * 
 * This module provides functionality to scan the workspace for images and
 * generate WebP versions in the background to improve performance.
 * 
 * @module utils/background-webp-generator
 */

const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { glob } = require('glob');
const { logInfo, logError } = require('./logger');
const { WORKSPACE_PATH, webpCacheDir } = require('../config');

/**
 * Gets the cache path for a WebP version of an image
 * 
 * @param {string} imagePath - Path to the source image
 * @returns {string} Path where the WebP version should be stored
 */
function getWebpCachePath(imagePath) {
  // Get the path relative to the workspace
  const relativePath = path.relative(WORKSPACE_PATH, imagePath);
  
  // Replace the extension with .webp
  const relativeWebpPath = relativePath.replace(path.extname(relativePath), '.webp');
  
  // Join with the WebP cache directory
  return path.join(webpCacheDir, relativeWebpPath);
}

/**
 * Converts an image to WebP if it isn't already.
 * The generated file is placed in the WebP cache directory with the same relative path.
 * 
 * @param {string} imagePath - Path to the source image
 * @returns {Promise<void>}
 */
async function generateWebpArtifactForImage(imagePath) {
  try {
    const ext = path.extname(imagePath).toLowerCase();
    // Skip if the image is already WebP
    if (ext === '.webp') return;
    
    // Get the cache path for this image
    const targetPath = getWebpCachePath(imagePath);
    
    // Check if the WebP version already exists
    if (fs.existsSync(targetPath)) {
      // Check if the original is newer than the WebP version
      const originalStat = fs.statSync(imagePath);
      const webpStat = fs.statSync(targetPath);
      
      if (originalStat.mtime <= webpStat.mtime) {
        logInfo(`WebP artifact already exists and is up-to-date for ${imagePath}`);
        return;
      }
      
      logInfo(`Original image is newer than WebP artifact, regenerating for ${imagePath}`);
    } else {
      // Ensure the target directory exists
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
    }
    
    logInfo(`Generating WebP artifact for ${imagePath}`);
    await sharp(imagePath)
      .toFormat('webp', { quality: 80 })
      .toFile(targetPath);
    logInfo(`Generated WebP artifact at ${targetPath}`);
  } catch (error) {
    logError(`Error generating WebP artifact for ${imagePath}`, error);
  }
}

/**
 * Scans the workspace for images (jpg/jpeg/png) and generates missing WebP artifacts.
 * 
 * @returns {Promise<void>}
 */
async function generateWebpArtifacts() {
  try {
    const pattern = path.join(WORKSPACE_PATH, '**/*.{jpg,jpeg,png}');
    logInfo(`Scanning for images with pattern: ${pattern}`);
    const images = await glob(pattern, { nodir: true });
    logInfo(`Found ${images.length} images to check for WebP artifacts`);

    // Generate WebP versions concurrently with a limit to avoid overwhelming the system
    const concurrencyLimit = 5; // Process 5 images at a time
    
    // Process images in batches to control concurrency
    for (let i = 0; i < images.length; i += concurrencyLimit) {
      const batch = images.slice(i, i + concurrencyLimit);
      await Promise.allSettled(batch.map(imagePath => generateWebpArtifactForImage(imagePath)));
      logInfo(`Processed batch ${Math.floor(i/concurrencyLimit) + 1} of ${Math.ceil(images.length/concurrencyLimit)}`);
    }
    
    logInfo('Background WebP generation completed.');
  } catch (error) {
    logError('Error during background WebP generation', error);
  }
}

module.exports = { 
  generateWebpArtifacts,
  getWebpCachePath
}; 