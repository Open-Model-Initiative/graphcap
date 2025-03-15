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
 * @param {number|null} height - Desired height of the thumbnail, or null to maintain aspect ratio
 * @param {string} format - Desired format of the thumbnail (default: 'webp')
 * @returns {Promise<string>} Path to the generated thumbnail
 */
async function generateThumbnail(imagePath, width, height, format = 'webp') {
  try {
    const parsedWidth = parseInt(width, 10);
    const parsedHeight = height !== null ? parseInt(height, 10) : null;
    
    // Validate width is a positive integer
    if (isNaN(parsedWidth) || parsedWidth <= 0) {
      throw new Error('Invalid dimensions: width must be a positive number');
    }
    
    // If height is provided (not null), validate it's a positive integer
    if (parsedHeight !== null && (isNaN(parsedHeight) || parsedHeight <= 0)) {
      throw new Error('Invalid dimensions: height must be a positive number');
    }
    
    // Create a secure hash including the format so that different formats produce different filenames.
    const hash = crypto.createHash('sha256');
    const dimensionString = parsedHeight !== null 
      ? `${parsedWidth}x${parsedHeight}` 
      : `${parsedWidth}xauto`;
    hash.update(imagePath + dimensionString + format);
    const imagePathHash = hash.digest('hex');
    
    // Use the format for the file extension.
    const thumbnailFilename = `${imagePathHash}_${dimensionString}.${format}`;
    
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
      // Only log when debugging is needed
      // logInfo(`Using existing thumbnail: ${thumbnailPath}`);
      return thumbnailPath;
    }
    
    // Only log when generating new thumbnails
    logInfo(
      `Generating thumbnail for ${imagePath} at ${dimensionString} in format ${format}`
    );
    
    // Optimize Sharp configuration for better performance
    const sharpOptions = {
      failOn: 'none', // Don't fail on warnings
      limitInputPixels: 268402689, // 16384 x 16384 pixels
      sequentialRead: true // Sequential read for better memory usage
    };
    
    // Format-specific options
    const formatOptions = {
      webp: { quality: 80, effort: 4 }, // Lower effort for faster encoding
      jpeg: { quality: 80, progressive: true, optimizeScans: true },
      png: { compressionLevel: 6, adaptiveFiltering: true }, // Balance between speed and size
      avif: { quality: 80, effort: 4 } // Lower effort for faster encoding
    };
    
    // Configure resize options based on whether height is provided
    const resizeOptions = {
      width: parsedWidth,
      fastShrinkOnLoad: true // Faster resizing for large images
    };
    
    // If height is provided, use it with 'cover' fit
    if (parsedHeight !== null) {
      resizeOptions.height = parsedHeight;
      resizeOptions.fit = 'cover';
      resizeOptions.position = 'centre';
    } else {
      // If height is null, maintain aspect ratio
      resizeOptions.fit = 'inside';
      resizeOptions.withoutEnlargement = true;
    }
    
    await sharp(imagePath, sharpOptions)
      .resize(resizeOptions)
      .toFormat(format, formatOptions[format] || { quality: 80 })
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