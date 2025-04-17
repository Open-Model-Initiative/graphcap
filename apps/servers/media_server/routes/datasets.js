// SPDX-License-Identifier: Apache-2.0
/**
 * Dataset routes for the Graphcap Media Server
 * 
 * This module provides routes for dataset operations.
 * 
 * @module routes/datasets
 */

const express = require('express');
const router = express.Router();
const fs = require('node:fs');
const path = require('node:path');
const { logInfo, logError } = require('../utils/logger');
const { listDatasetImages, createDataset, addImageToDataset, deleteDataset, deleteDatasetImage } = require('../services/dataset-service');
const { upload, handleMulterErrors } = require('../middleware/upload');
const { 
  securePath, 
  validateFilename, 
  getBasename,
  ensureDir 
} = require('../utils/path-utils');
const { WORKSPACE_PATH } = require('../config');

/**
 * List all images in the datasets directory recursively
 * 
 * @returns {Object} List of images grouped by dataset
 */
router.get('/images', async (req, res) => {
  try {
    const datasets = await listDatasetImages();
    res.json({ datasets });
  } catch (error) {
    logError('Error listing dataset images', error);
    res.status(500).json({ error: 'Failed to list dataset images' });
  }
});

/**
 * Create a new dataset
 * 
 * @param {string} req.body.name - Name of the dataset to create
 * @returns {Object} Success status and dataset path
 */
router.post('/create', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Dataset name is required' });
    }
    
    const result = await createDataset(name);
    res.json(result);
  } catch (error) {
    logError('Error creating dataset', error);
    
    // Handle specific errors with appropriate status codes
    if (error.message === 'Dataset already exists') {
      return res.status(409).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to create dataset' });
  }
});

/**
 * Add an existing image to a dataset
 * 
 * @param {string} req.body.imagePath - Path of the image to add
 * @param {string} req.body.datasetName - Name of the dataset to add the image to
 * @returns {Object} Success status and new image path
 */
router.post('/add-image', async (req, res) => {
  try {
    const { imagePath, datasetName } = req.body;
    
    if (!imagePath || !datasetName) {
      return res.status(400).json({ error: 'Image path and dataset name are required' });
    }
    
    const result = await addImageToDataset(imagePath, datasetName);
    res.json(result);
  } catch (error) {
    logError('Error adding image to dataset', error);
    
    // Handle specific errors with appropriate status codes
    if (error.message === 'Dataset not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Image not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Image already exists in the dataset') {
      return res.status(409).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to add image to dataset' });
  }
});

/**
 * Upload an image directly to a specified dataset
 * 
 * @param {File} req.file - The image file to upload
 * @param {string} req.body.dataset - Dataset name to upload to (mandatory)
 * @returns {Object} Uploaded image information (path, url)
 */
router.post('/upload', handleMulterErrors, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      logError('No image file provided for dataset upload', { body: req.body });
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Dataset is mandatory
    const { dataset } = req.body;
    if (!dataset) {
      logError('Dataset name is required for upload', { body: req.body });
      // Clean up the uploaded file if dataset is missing
      fs.unlink(req.file.path, (err) => {
        if (err) logError('Failed to clean up orphaned upload file', { path: req.file.path, error: err });
      });
      return res.status(400).json({ error: 'Dataset name is required' });
    }

    // Initialize paths
    let targetPath = ''; 
    let relativePath = ''; 

    // Validate dataset name
    if (!/^[a-zA-Z0-9_-]+$/.test(dataset)) {
      logError('Invalid dataset name provided for upload', { dataset });
      // Clean up the uploaded file
      fs.unlink(req.file.path, (err) => {
          if (err) logError('Failed to clean up orphaned upload file', { path: req.file.path, error: err });
      });
      return res.status(400).json({ 
        error: 'Invalid dataset name. Use only letters, numbers, underscores, and hyphens.' 
      });
    }
    
    // Securely create dataset path (ensures it's within the datasets/local directory)
    const datasetPathResult = securePath(`datasets/local/${dataset}`, WORKSPACE_PATH, { createIfNotExist: true });
    
    if (!datasetPathResult.isValid || !datasetPathResult.path.startsWith(path.join(WORKSPACE_PATH, 'datasets', 'local'))) {
       logError('Invalid or insecure dataset path for upload', { dataset, path: datasetPathResult.path, error: datasetPathResult.error });
      // Clean up the uploaded file
      fs.unlink(req.file.path, (err) => {
        if (err) logError('Failed to clean up orphaned upload file', { path: req.file.path, error: err });
      });
      return res.status(400).json({ error: 'Invalid dataset path' });
    }
    
    // Get the filename from the uploaded file and validate it
    const fileName = getBasename(req.file.path);
    const fileNameResult = validateFilename(fileName);
    
    if (!fileNameResult.isValid) {
      logError('Invalid filename for upload', { fileName, error: fileNameResult.error });
       // Clean up the uploaded file
      fs.unlink(req.file.path, (err) => {
        if (err) logError('Failed to clean up orphaned upload file', { path: req.file.path, error: err });
      });
      return res.status(400).json({ error: 'Invalid filename' });
    }
    
    // Create the final destination path securely
    const newPathResult = securePath(`datasets/local/${dataset}/${fileNameResult.sanitized}`, WORKSPACE_PATH);
    
    if (!newPathResult.isValid || !newPathResult.path.startsWith(datasetPathResult.path)) {
      logError('Invalid or insecure final path for upload', { path: newPathResult.path, error: newPathResult.error });
       // Clean up the uploaded file
      fs.unlink(req.file.path, (err) => {
        if (err) logError('Failed to clean up orphaned upload file', { path: req.file.path, error: err });
      });
      return res.status(400).json({ error: 'Invalid path for file' });
    }
    
    // Ensure the target directory exists (redundant check, but safe)
    ensureDir(datasetPathResult.path);
    
    // Move the file from temporary upload location to the final dataset location
    fs.renameSync(req.file.path, newPathResult.path);
    
    // Update paths for response
    targetPath = newPathResult.path;
    relativePath = newPathResult.relativePath;
    
    logInfo(`Image uploaded directly to dataset: ${dataset}`, { 
      newPath: targetPath
    });
    
    // Respond with success and the relative path/URL
    res.json({
      success: true,
      path: relativePath,
      // Note: The view URL still uses the /api/images/view endpoint
      url: `/api/images/view${relativePath}` 
    });

  } catch (error) {
    logError('Error uploading image to dataset', error);
    // Ensure temp file is cleaned up on unexpected errors
    if (req.file?.path) { 
       fs.unlink(req.file.path, (err) => {
        if (err) logError('Failed to clean up upload file after error', { path: req.file.path, error: err });
      });
    }
    res.status(500).json({ error: 'Failed to process uploaded image for dataset' });
  }
});

/**
 * Delete a dataset
 * 
 * @param {string} req.params.name - Name of the dataset to delete
 * @returns {Object} Success status and message
 */
router.delete('/:name', async (req, res) => {
  try {
    const { name } = req.params;
    
    if (!name) {
      return res.status(400).json({ error: 'Dataset name is required' });
    }
    
    const result = await deleteDataset(name);
    res.json(result);
  } catch (error) {
    logError('Error deleting dataset', error);
    
    // Handle specific errors with appropriate status codes
    if (error.message.includes('Dataset not found')) {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to delete dataset' });
  }
});

/**
 * Delete an image from a specific dataset
 * 
 * @param {string} req.params.datasetName - Name of the dataset
 * @param {string} req.params.imageName - Name of the image to delete (URL encoded)
 * @returns {Object} Success status and message
 */
router.delete('/:datasetName/images/:imageName', async (req, res) => {
  try {
    const { datasetName, imageName: encodedImageName } = req.params;
    
    // Decode the image name as the frontend encodes it
    const imageName = decodeURIComponent(encodedImageName);

    if (!datasetName || !imageName) {
      return res.status(400).json({ error: 'Dataset name and image name are required' });
    }

    // Call the service function to handle deletion
    const result = await deleteDatasetImage(datasetName, imageName); 

    res.json(result); // Send the result from the service function

  } catch (error) {
    logError('Error deleting image from dataset route', { 
        dataset: req.params.datasetName, 
        image: req.params.imageName, // Log encoded name
        error: error.message // Log error message
    });
    
    // Handle specific errors from the service
    if (error.message.includes('Dataset not found') || error.message.includes('Image not found') || error.code === 'ENOENT') {
      // Treat file not found (ENOENT) also as 404
      return res.status(404).json({ error: 'Image or dataset not found' });
    }
    
    // Handle permission errors specifically if needed
    if (error.code === 'EPERM' || error.code === 'EACCES') {
        return res.status(403).json({ error: 'Permission denied to delete image' });
    }

    // Generic server error for other issues
    res.status(500).json({ error: 'Failed to delete image from dataset' });
  }
});

module.exports = router; 