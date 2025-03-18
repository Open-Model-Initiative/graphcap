// SPDX-License-Identifier: Apache-2.0
/**
 * WebP Conversion Worker
 * 
 * This worker module handles the conversion of images to WebP format.
 * It runs in a separate thread to avoid blocking the main event loop.
 * 
 * @module utils/webp-worker
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * Converts an image to WebP format
 * 
 * @param {Object} options - Conversion options
 * @param {string} options.imagePath - Path to the source image
 * @param {string} options.targetPath - Path where the WebP version should be stored
 * @returns {Promise<string>} Path to the generated WebP file
 */
module.exports = async function ({ imagePath, targetPath }) {
  try {
    // Ensure that the target directory exists
    const targetDir = path.dirname(targetPath);
    fs.mkdirSync(targetDir, { recursive: true });
    
    // Optimize Sharp configuration for better performance
    const sharpOptions = {
      failOn: 'none', // Don't fail on warnings
      limitInputPixels: 268402689, // 16384 x 16384 pixels
      sequentialRead: true // Sequential read for better memory usage
    };
    
    // Convert the image to WebP with desired options
    await sharp(imagePath, sharpOptions)
      .toFormat('webp', { 
        quality: 80,
        effort: 4, // Lower effort for faster encoding
        alphaQuality: 80,
        lossless: false
      })
      .toFile(targetPath);
      
    return targetPath;
  } catch (error) {
    console.error('Error converting image to WebP:', error); // Log the error
    throw error; // Rethrow the error to be handled by the main thread
  }
}; 