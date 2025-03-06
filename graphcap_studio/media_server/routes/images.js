// SPDX-License-Identifier: Apache-2.0
/**
 * Image routes for the Graphcap Media Server
 * 
 * This module provides routes for image operations.
 * 
 * @module routes/images
 */

const express = require('express');
const router = express.Router();
const { logInfo, logError } = require('../utils/logger');
const { upload, handleMulterErrors } = require('../middleware/upload');
const { listImages, processImage, serveImage } = require('../services/image-service');
const { loadImageCaptions } = require('../services/caption-service');

/**
 * List all images in the workspace
 * 
 * @param {string} directory - Optional directory path
 * @returns {Object} List of images
 */
router.get('/', async (req, res) => {
  try {
    const directory = req.query.directory || '';
    const images = await listImages(directory);
    res.json({ images });
  } catch (error) {
    logError('Error listing images', error);
    res.status(500).json({ error: 'Failed to list images' });
  }
});

/**
 * Serve an image
 * 
 * @param {string} imagePath - Path to the image
 * @returns {File} The image file
 */
router.get('/view/*', async (req, res) => {
  try {
    const imagePath = req.params[0];
    const width = req.query.width;
    const height = req.query.height;
    
    const result = await serveImage(imagePath, width, height);
    res.sendFile(result.path);
  } catch (error) {
    logError('Error serving image', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Process an image (crop, rotate, etc.)
 * 
 * @param {Object} req.body - Request body
 * @param {string} req.body.imagePath - Path to the image
 * @param {Object} req.body.operations - Operations to perform
 * @param {string} req.body.outputName - Output filename
 * @param {boolean} req.body.overwrite - Whether to overwrite the original file
 * @returns {Object} Processed image information
 */
router.post('/process', async (req, res) => {
  try {
    const { imagePath, operations, outputName, overwrite } = req.body;
    
    if (!imagePath) {
      logError('Image path is required', { body: req.body });
      return res.status(400).json({ error: 'Image path is required' });
    }
    
    const result = await processImage(imagePath, operations, outputName, overwrite);
    res.json(result);
  } catch (error) {
    logError('Error processing image', error);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

/**
 * Upload an image
 * 
 * @param {File} req.file - The image file to upload
 * @param {string} req.body.dataset - Optional dataset name to upload to
 * @returns {Object} Uploaded image information
 */
router.post('/upload', handleMulterErrors, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      logError('No image file provided', { body: req.body });
      return res.status(400).json({ error: 'No image file provided' });
    }
    
    // Check if a dataset was specified
    const { dataset } = req.body;
    let targetPath = req.file.path;
    let relativePath = req.file.path.replace(process.env.WORKSPACE_PATH || '/workspace', '');
    
    // If dataset is specified, move the file to the dataset directory
    if (dataset) {
      // Validate dataset name
      if (!/^[a-zA-Z0-9_-]+$/.test(dataset)) {
        return res.status(400).json({ 
          error: 'Invalid dataset name. Use only letters, numbers, underscores, and hyphens.' 
        });
      }
      
      // Create dataset directory if it doesn't exist (in .local subdirectory)
      const path = require('path');
      const fs = require('fs');
      const { WORKSPACE_PATH } = require('../config');
      
      const datasetPath = path.join(WORKSPACE_PATH, 'datasets', '.local', dataset);
      if (!fs.existsSync(datasetPath)) {
        fs.mkdirSync(datasetPath, { recursive: true });
      }
      
      // Move the file to the dataset directory
      const fileName = path.basename(req.file.path);
      const newPath = path.join(datasetPath, fileName);
      
      // Ensure the target directory exists
      fs.mkdirSync(path.dirname(newPath), { recursive: true });
      
      // Move the file
      fs.renameSync(req.file.path, newPath);
      
      // Update paths
      targetPath = newPath;
      relativePath = `/datasets/.local/${dataset}/${fileName}`;
      
      logInfo(`Image moved to dataset: ${dataset}`, { 
        originalPath: req.file.path,
        newPath: targetPath
      });
    }
    
    logInfo(`Image uploaded: ${targetPath}`);
    
    res.json({
      success: true,
      path: relativePath,
      url: `/api/images/view${relativePath}`
    });
  } catch (error) {
    logError('Error uploading image', error);
    res.status(500).json({ error: 'Failed to process uploaded image' });
  }
});

/**
 * Get captions for an image
 * 
 * @param {string} imagePath - Path to the image
 * @returns {Object} Captions for the image
 */
router.get('/captions', async (req, res) => {
  try {
    const imagePath = req.query.path;
    
    logInfo(`Caption request received for path: ${imagePath}`);
    
    if (!imagePath) {
      logError('No image path provided');
      return res.status(400).json({ error: 'Image path is required' });
    }
    
    // Load captions for the image
    const captions = await loadImageCaptions(imagePath);
    
    logInfo(`Captions loaded for ${imagePath}`, { 
      perspectiveCount: Object.keys(captions.perspectives).length,
      perspectives: Object.keys(captions.perspectives)
    });
    
    res.json(captions);
  } catch (error) {
    logError('Error getting image captions', error);
    res.status(500).json({ error: 'Failed to get image captions' });
  }
});

module.exports = router; 