// SPDX-License-Identifier: Apache-2.0
/**
 * Thumbnail generation utilities for the Graphcap Media Server
 * 
 * This module provides functions to generate thumbnails for images.
 * 
 * @module utils/thumbnail-generator
 */

const fs = require('fs');
const sharp = require('sharp');
const crypto = require('crypto');
const { logInfo, logError } = require('./logger');
const { securePath, joinPath, ensureDir } = require('./path-utils');
const { thumbnailsDir, WORKSPACE_PATH } = require('../config');

/**
 * Generates a thumbnail for an image
 * 
 * @param {string} imagePath - Path to the original image
 * @param {number} width - Desired width of the thumbnail
 * @param {number} height - Desired height of the thumbnail
 * @returns {Promise<string>} Path to the generated thumbnail
 */
async function generateThumbnail(imagePath, width, height) {
  try {
    // Ensure imagePath is a string and already validated
    if (typeof imagePath !== 'string') {
      throw new Error('Invalid image path: must be a string');
    }
    
    // Validate width and height are numbers
    const parsedWidth = parseInt(width, 10);
    const parsedHeight = parseInt(height, 10);
    
    if (isNaN(parsedWidth) || isNaN(parsedHeight) || parsedWidth <= 0 || parsedHeight <= 0) {
      throw new Error('Invalid dimensions: width and height must be positive numbers');
    }
    
    // Create a secure hash of the path and dimensions for the thumbnail filename
    // Use crypto for a more secure hash
    const hash = crypto.createHash('sha256');
    hash.update(imagePath + parsedWidth + 'x' + parsedHeight);
    const imagePathHash = hash.digest('hex');
    
    // Create a safe filename with the hash and dimensions
    const thumbnailFilename = `${imagePathHash}_${parsedWidth}x${parsedHeight}.webp`;
    
    // Ensure the thumbnails directory exists
    ensureDir(thumbnailsDir);
    
    // Securely create the thumbnail path
    const thumbnailPathResult = securePath(joinPath(thumbnailsDir, thumbnailFilename).replace(WORKSPACE_PATH, ''), WORKSPACE_PATH, { mustExist: false });
    
    if (!thumbnailPathResult.isValid) {
      throw new Error(`Invalid thumbnail path: ${thumbnailPathResult.error}`);
    }
    
    const thumbnailPath = thumbnailPathResult.path;
    
    // Check if thumbnail already exists
    if (fs.existsSync(thumbnailPath)) {
      logInfo(`Using existing thumbnail: ${thumbnailPath}`);
      return thumbnailPath;
    }
    
    // Generate the thumbnail
    logInfo(`Generating thumbnail for ${imagePath} at ${parsedWidth}x${parsedHeight}`);
    await sharp(imagePath)
      .resize({
        width: parsedWidth,
        height: parsedHeight,
        fit: 'cover',
        position: 'centre'
      })
      .webp({ quality: 80 })
      .toFile(thumbnailPath);
    
    return thumbnailPath;
  } catch (error) {
    logError('Error generating thumbnail', error);
    throw error;
  }
}

module.exports = {
  generateThumbnail
}; 