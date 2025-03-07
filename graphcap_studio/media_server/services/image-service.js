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
const { 
  securePath, 
  validateFilename, 
  getBasename, 
  getDirname, 
  getExtension,
  joinPath,
  ensureDir
} = require('../utils/path-utils');
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
    const pathResult = securePath(directory, WORKSPACE_PATH, { mustExist: false });
    if (!pathResult.isValid) {
      logError('Invalid directory path', { directory, error: pathResult.error });
      throw new Error(pathResult.error);
    }
    
    const fullPath = pathResult.path;
    logInfo(`Listing images in directory: ${directory}`, { fullPath });
    
    // Find all image files
    const imageFiles = await glob(`${fullPath}/**/*.{jpg,jpeg,png,gif,webp,svg}`, { nodir: true });
    
    logInfo(`Found ${imageFiles.length} images`);
    
    // Format the response
    const images = imageFiles.map(file => {
      const relativePath = file.replace(WORKSPACE_PATH, '');
      return {
        path: relativePath,
        name: getBasename(file),
        directory: getDirname(relativePath),
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
 * Applies image operations using Sharp
 * 
 * @param {Object} image - Sharp image instance
 * @param {Object} operations - Operations to perform
 * @returns {Object} Modified Sharp image instance
 */
function applyImageOperations(image, operations) {
  if (!operations) {
    return image;
  }
  
  let processedImage = image;
  
  // Apply crop if specified
  if (operations.crop) {
    const { left, top, width, height } = operations.crop;
    processedImage = processedImage.extract({ left, top, width, height });
  }
  
  // Apply rotation if specified
  if (operations.rotate) {
    processedImage = processedImage.rotate(operations.rotate);
  }
  
  // Apply resize if specified
  if (operations.resize) {
    const { width, height } = operations.resize;
    processedImage = processedImage.resize(width, height);
  }
  
  // Apply flip if specified
  if (operations.flip) {
    processedImage = processedImage.flip();
  }
  
  // Apply flop if specified
  if (operations.flop) {
    processedImage = processedImage.flop();
  }
  
  return processedImage;
}

/**
 * Determines the output path for a processed image
 * 
 * @param {string} fullPath - Full path to the original image
 * @param {string} outputName - Optional output filename
 * @param {boolean} overwrite - Whether to overwrite the original file
 * @returns {Promise<string>} Path to save the processed image
 */
async function determineOutputPath(fullPath, outputName, overwrite) {
  if (overwrite) {
    return fullPath;
  }
  
  const originalExt = getExtension(fullPath);
  const originalName = getBasename(fullPath, originalExt);
  
  // Validate the output filename
  let finalOutputName;
  if (outputName) {
    const outputNameResult = validateFilename(outputName);
    finalOutputName = outputNameResult.isValid 
      ? outputNameResult.sanitized 
      : `${originalName}_edited${originalExt}`;
  } else {
    finalOutputName = `${originalName}_edited${originalExt}`;
  }
  
  // Ensure the upload directory exists
  ensureDir(uploadDir);
  
  // Create the output path
  const outputPathResult = securePath(
    joinPath(uploadDir, finalOutputName).replace(WORKSPACE_PATH, ''), 
    WORKSPACE_PATH, 
    { mustExist: false }
  );
  
  if (!outputPathResult.isValid) {
    throw new Error(`Invalid output path: ${outputPathResult.error}`);
  }
  
  return outputPathResult.path;
}

/**
 * Clears thumbnails for an image
 * 
 * @param {string} imagePath - Path to the image
 * @returns {Promise<void>}
 */
async function clearThumbnails(imagePath) {
  const imagePathHash = Buffer.from(imagePath).toString('base64').replace(/[/+=]/g, '_');
  const thumbnailPattern = joinPath(thumbnailsDir, `${imagePathHash}_*`);
  const thumbnailFiles = await glob(thumbnailPattern);
  
  // Delete existing thumbnails
  for (const thumbnailFile of thumbnailFiles) {
    fs.unlinkSync(thumbnailFile);
    logInfo(`Deleted thumbnail: ${thumbnailFile}`);
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
    const pathResult = securePath(imagePath, WORKSPACE_PATH, { mustExist: true });
    if (!pathResult.isValid) {
      logError('Invalid image path', { imagePath, error: pathResult.error });
      throw new Error(pathResult.error);
    }
    
    const fullPath = pathResult.path;
    
    // Initialize Sharp with the input image and apply operations
    let image = sharp(fullPath);
    image = applyImageOperations(image, operations);
    
    // Determine output path
    const outputPath = await determineOutputPath(fullPath, outputName, overwrite);
    
    // Save the processed image
    await image.toFile(outputPath);
    
    // Clear thumbnails for this image
    await clearThumbnails(imagePath);
    
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
    // Ensure imagePath is a string and normalize it
    const normalizedPath = String(imagePath || '').replace(/^\/+/, '');
    
    logInfo(`Processing image path for serving: ${normalizedPath}`);
    
    // Validate the path
    const pathResult = securePath(normalizedPath, WORKSPACE_PATH, { mustExist: true });
    if (!pathResult.isValid) {
      logError('Invalid image path', { 
        imagePath: normalizedPath, 
        error: pathResult.error,
        fullPath: pathResult.path
      });
      throw new Error(`Invalid image path: ${pathResult.error}`);
    }
    
    const fullPath = pathResult.path;
    logInfo(`Resolved image path: ${fullPath}`);
    
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
    logInfo(`Serving image: ${normalizedPath}`, { fullPath });
    return { path: fullPath, isThumbnail: false };
  } catch (error) {
    logError('Error serving image', { 
      imagePath, 
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

module.exports = {
  listImages,
  processImage,
  serveImage
}; 