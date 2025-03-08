// SPDX-License-Identifier: Apache-2.0
/**
 * Background WebP Generator
 * 
 * This module provides functionality to scan the workspace for images and
 * generate WebP versions in the background using worker threads to improve performance.
 * 
 * @module utils/background-webp-generator
 */

const path = require('path');
const fs = require('fs');
const { glob } = require('glob');
const Piscina = require('piscina');
const { logInfo, logError } = require('./logger');
const { WORKSPACE_PATH, webpCacheDir } = require('../config');

// Create a Piscina pool to handle WebP conversion tasks
// Adjust maxThreads based on the number of available CPU cores
const piscina = new Piscina({
  filename: path.resolve(__dirname, 'webp-worker.js'),
  maxThreads: Math.max(2, Math.min(4, Math.floor(require('os').cpus().length / 2))), // Use at most half of available CPUs, between 2-4 threads
  idleTimeout: 30000 // Close idle workers after 30 seconds
});

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
 * Converts an image to WebP if it isn't already using a worker thread.
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
        // Skip if WebP is up to date
        return;
      }
    }
    
    // Only log when generating new WebP artifacts
    logInfo(`Queuing WebP conversion for ${imagePath}`);
    
    // Offload conversion to a worker thread using Piscina
    await piscina.run({ imagePath, targetPath });
    
    logInfo(`Generated WebP artifact at ${targetPath}`);
  } catch (error) {
    logError(`Error generating WebP artifact for ${imagePath}`, error);
  }
}

/**
 * Scans the workspace for images (jpg/jpeg/png) and generates missing WebP artifacts
 * using a pool of worker threads.
 * 
 * @returns {Promise<void>}
 */
async function generateWebpArtifacts() {
  try {
    const pattern = path.join(WORKSPACE_PATH, '**/*.{jpg,jpeg,png}');
    logInfo(`Scanning for images with pattern: ${pattern}`);
    const images = await glob(pattern, { nodir: true });
    logInfo(`Found ${images.length} images to check for WebP artifacts`);

    // Process images in batches to limit concurrency and memory usage
    const concurrencyLimit = 10; // Queue up to 10 images at a time
    
    // Process images in batches
    for (let i = 0; i < images.length; i += concurrencyLimit) {
      const batch = images.slice(i, i + concurrencyLimit);
      await Promise.allSettled(batch.map(imagePath => generateWebpArtifactForImage(imagePath)));
      
      // Log progress less frequently to reduce overhead
      if (i % (concurrencyLimit * 5) === 0) {
        logInfo(`Processed batch ${Math.floor(i/concurrencyLimit) + 1} of ${Math.ceil(images.length/concurrencyLimit)}`);
      }
      
      // Add a small delay between batches to allow garbage collection
      await new Promise(resolve => setTimeout(resolve, 100));
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