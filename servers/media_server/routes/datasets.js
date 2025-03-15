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
const { logInfo, logError } = require('../utils/logger');
const { listDatasetImages, createDataset, addImageToDataset, deleteDataset } = require('../services/dataset-service');

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
    } else if (error.message === 'Image not found') {
      return res.status(404).json({ error: error.message });
    } else if (error.message === 'Image already exists in the dataset') {
      return res.status(409).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to add image to dataset' });
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

module.exports = router; 