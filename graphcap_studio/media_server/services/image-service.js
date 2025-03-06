// SPDX-License-Identifier: Apache-2.0
/**
 * Image service for the Graphcap Media Server
 * 
 * This module provides functions to process and manipulate images.
 * 
 * @module services/image-service
 */

const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { glob } = require('glob');
const { logInfo, logError } = require('../utils/logger');
const { validatePath } = require('../utils/path-validator');
const { generateThumbnail } = require('../utils/thumbnail-generator');
const { WORKSPACE_PATH, uploadDir, thumbnailsDir } = require('../config');

/**
 * List all images in a directory
 * 
 * @param {string} directory - Directory to list images from
 * @returns {Promise<Array>} Array of image objects
 */
async function listImages(directory) {
  try {
    // Validate the path
    const pathValidation = validatePath(directory);
    if (!pathValidation.isValid) {
      logError('Invalid directory path', { directory, error: pathValidation.error });
      throw new Error(pathValidation.error);
    }
    
    const fullPath = pathValidation.path;
    logInfo(`Listing images in directory: ${directory}`, { fullPath });
    
    // Find all image files
    const imageFiles = await glob(`${fullPath}/**/*.{jpg,jpeg,png,gif,webp,svg}`, { nodir: true });
    
    logInfo(`Found ${imageFiles.length} images`);
    
    // Format the response
    const images = imageFiles.map(file => {
      const relativePath = file.replace(WORKSPACE_PATH, '');
      return {
        path: relativePath,
        name: path.basename(file),
        directory: path.dirname(relativePath),
        url: `/api/images/view${relativePath}`
      };
    });
    
    return images;
  } catch (error) {
    logError('Error listing images', error);
    throw error;
  }
}

/**
 * Process an image (crop, rotate, etc.)
 * 
 * @param {string} imagePath - Path to the image
 * @param {Object} operations - Operations to perform
 * @param {string} outputName - Output filename
 * @param {boolean} overwrite - Whether to overwrite the original file
 * @returns {Promise<Object>} Processed image information
 */
async function processImage(imagePath, operations, outputName, overwrite) {
  try {
    logInfo(`Processing image: ${imagePath}`, { operations, outputName, overwrite });
    
    if (!imagePath) {
      throw new Error('Image path is required');
    }
    
    // Validate the path
    const pathValidation = validatePath(imagePath);
    if (!pathValidation.isValid) {
      logError('Invalid image path', { imagePath, error: pathValidation.error });
      throw new Error(pathValidation.error);
    }
    
    const fullPath = pathValidation.path;
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      logError('Image not found', { fullPath });
      throw new Error('Image not found');
    }
    
    // Initialize Sharp with the input image
    let image = sharp(fullPath);
    
    // Apply operations
    if (operations) {
      // Apply crop if specified
      if (operations.crop) {
        const { left, top, width, height } = operations.crop;
        image = image.extract({ left, top, width, height });
      }
      
      // Apply rotation if specified
      if (operations.rotate) {
        image = image.rotate(operations.rotate);
      }
      
      // Apply resize if specified
      if (operations.resize) {
        const { width, height } = operations.resize;
        image = image.resize(width, height);
      }
      
      // Apply flip if specified
      if (operations.flip) {
        image = image.flip();
      }
      
      // Apply flop if specified
      if (operations.flop) {
        image = image.flop();
      }
    }
    
    // Determine output path
    let outputPath;
    if (overwrite) {
      outputPath = fullPath;
    } else {
      const originalExt = path.extname(fullPath);
      const originalName = path.basename(fullPath, originalExt);
      
      // Sanitize the output filename
      const sanitizedOutputName = outputName 
        ? outputName.replace(/[^a-zA-Z0-9_\-\.]/g, '_') 
        : `${originalName}_edited${originalExt}`;
      
      outputPath = path.join(uploadDir, sanitizedOutputName);
    }
    
    // Save the processed image
    await image.toFile(outputPath);
    
    // Clear thumbnails for this image
    const imagePathHash = Buffer.from(imagePath).toString('base64').replace(/[/+=]/g, '_');
    const thumbnailPattern = path.join(thumbnailsDir, `${imagePathHash}_*`);
    const thumbnailFiles = await glob(thumbnailPattern);
    
    // Delete existing thumbnails
    for (const thumbnailFile of thumbnailFiles) {
      fs.unlinkSync(thumbnailFile);
      logInfo(`Deleted thumbnail: ${thumbnailFile}`);
    }
    
    logInfo(`Image processed successfully: ${outputPath}`);
    
    // Return the path to the processed image
    const relativePath = outputPath.replace(WORKSPACE_PATH, '');
    return {
      success: true,
      path: relativePath,
      url: `/api/images/view${relativePath}`
    };
  } catch (error) {
    logError('Error processing image', error);
    throw error;
  }
}

/**
 * Serve an image or its thumbnail
 * 
 * @param {string} imagePath - Path to the image
 * @param {number} width - Optional width for thumbnail
 * @param {number} height - Optional height for thumbnail
 * @returns {Promise<Object>} Object with path to the image or thumbnail
 */
async function serveImage(imagePath, width, height) {
  try {
    // Validate the path
    const pathValidation = validatePath(imagePath);
    if (!pathValidation.isValid) {
      logError('Invalid image path', { imagePath, error: pathValidation.error });
      throw new Error(pathValidation.error);
    }
    
    const fullPath = pathValidation.path;
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      logError('Image not found', { fullPath });
      throw new Error('Image not found');
    }
    
    // Check if thumbnail is requested
    if (width && height) {
      // Validate width and height are positive integers
      const parsedWidth = parseInt(width, 10);
      const parsedHeight = parseInt(height, 10);
      
      if (isNaN(parsedWidth) || isNaN(parsedHeight) || parsedWidth <= 0 || parsedHeight <= 0) {
        throw new Error('Width and height must be positive integers');
      }
      
      // Generate thumbnail
      const thumbnailPath = await generateThumbnail(fullPath, parsedWidth, parsedHeight);
      logInfo(`Serving thumbnail: ${thumbnailPath}`);
      return { path: thumbnailPath, isThumbnail: true };
    }
    
    // Serve the original file
    logInfo(`Serving image: ${imagePath}`, { fullPath });
    return { path: fullPath, isThumbnail: false };
  } catch (error) {
    logError('Error serving image', error);
    throw error;
  }
}

module.exports = {
  listImages,
  processImage,
  serveImage
}; 