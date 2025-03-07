// SPDX-License-Identifier: Apache-2.0
/**
 * Image Utilities
 * 
 * This module provides utility functions for image processing and serving.
 * 
 * @module utils/image-utils
 */

const fs = require('fs');
const path = require('path');
const { logError, logInfo } = require('./logger');
const { getWebpCachePath } = require('./background-webp-generator');
const { WORKSPACE_PATH } = require('../config');

/**
 * Generates a URL for a WebP image in the cache
 * 
 * @param {string} imagePath - Path to the original image
 * @returns {string} URL for the WebP image
 */
function getWebpUrl(imagePath) {
  // Get the path relative to the workspace
  const relativePath = path.relative(WORKSPACE_PATH, imagePath);
  
  // Replace the extension with .webp
  const relativeWebpPath = relativePath.replace(path.extname(relativePath), '.webp');
  
  // Return the URL for the WebP image
  return `/api/images/webp/${relativeWebpPath}`;
}

/**
 * Checks if a WebP version of an image exists and returns the appropriate path.
 * If the browser supports WebP and a WebP version exists, returns the WebP path.
 * Otherwise, returns the original image path.
 * 
 * @param {string} imagePath - Path to the original image
 * @param {Object} req - Express request object
 * @returns {string} Path to the image to serve (WebP or original)
 */
function getOptimalImagePath(imagePath, req) {
  try {
    // Check if the browser accepts WebP
    const acceptHeader = req.headers.accept || '';
    const acceptsWebP = acceptHeader.includes('image/webp');
    
    if (acceptsWebP) {
      const ext = path.extname(imagePath).toLowerCase();
      // If the image is already WebP, return it
      if (ext === '.webp') return imagePath;
      
      // Check if a WebP version exists in the cache
      const webpPath = getWebpCachePath(imagePath);
      if (fs.existsSync(webpPath)) {
        logInfo(`Using WebP version for ${imagePath}`);
        return webpPath;
      }
    }
    
    // Return the original image path if WebP is not supported or doesn't exist
    return imagePath;
  } catch (error) {
    logError('Error determining optimal image path', error);
    // Fall back to the original image path
    return imagePath;
  }
}

module.exports = {
  getOptimalImagePath,
  getWebpUrl
}; 