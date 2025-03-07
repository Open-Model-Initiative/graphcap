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
 * @param {string} format - Desired format of the thumbnail (default: 'webp')
 * @returns {Promise<string>} Path to the generated thumbnail
 */
async function generateThumbnail(imagePath, width, height, format = 'webp') {
  try {
    const parsedWidth = parseInt(width, 10);
    const parsedHeight = parseInt(height, 10);
    
    if (
      isNaN(parsedWidth) ||
      isNaN(parsedHeight) ||
      parsedWidth <= 0 ||
      parsedHeight <= 0
    ) {
      throw new Error('Invalid dimensions: width and height must be positive numbers');
    }
    
    // Create a secure hash including the format so that different formats produce different filenames.
    const hash = crypto.createHash('sha256');
    hash.update(imagePath + parsedWidth + 'x' + parsedHeight + format);
    const imagePathHash = hash.digest('hex');
    
    // Use the format for the file extension.
    const thumbnailFilename = `${imagePathHash}_${parsedWidth}x${parsedHeight}.${format}`;
    
    ensureDir(thumbnailsDir);
    
    const thumbnailPathResult = securePath(
      joinPath(thumbnailsDir, thumbnailFilename).replace(WORKSPACE_PATH, ''),
      WORKSPACE_PATH,
      { mustExist: false }
    );
    
    if (!thumbnailPathResult.isValid) {
      throw new Error(`Invalid thumbnail path: ${thumbnailPathResult.error}`);
    }
    
    const thumbnailPath = thumbnailPathResult.path;
    
    if (fs.existsSync(thumbnailPath)) {
      logInfo(`Using existing thumbnail: ${thumbnailPath}`);
      return thumbnailPath;
    }
    
    logInfo(
      `Generating thumbnail for ${imagePath} at ${parsedWidth}x${parsedHeight} in format ${format}`
    );
    
    await sharp(imagePath)
      .resize({
        width: parsedWidth,
        height: parsedHeight,
        fit: 'cover',
        position: 'centre',
      })
      .toFormat(format, { quality: 80 })
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