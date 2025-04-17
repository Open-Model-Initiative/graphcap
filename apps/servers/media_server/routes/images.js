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
const fs = require('node:fs');
const path = require('node:path');
const { logInfo, logError } = require('../utils/logger');
const { upload, handleMulterErrors } = require('../middleware/upload');
const { listImages, processImage, serveImage } = require('../services/image-service');
const { loadImageCaptions } = require('../services/caption-service');
const { 
  securePath, 
  validateFilename, 
  getBasename,
  ensureDir 
} = require('../utils/path-utils');
const { WORKSPACE_PATH } = require('../config');
const { webpCacheDir } = require('../config');

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
    const format = req.query.format || 'webp';
    
    // Reduce logging to minimal information
    logInfo(`Image view request for: ${imagePath.split('/').pop()}`);
    
    // Pass the request object to serveImage for WebP detection
    const result = await serveImage(imagePath, width, height, format, req);
    
    // Reduce logging
    
    // If this is a WebP image from the cache, redirect to the WebP endpoint
    if (result.isWebp && result.webpUrl) {
      return res.redirect(result.webpUrl);
    }
    
    // Improve caching headers
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Vary', 'Origin, Accept');  // Add Accept to Vary header for proper caching
    
    // Increase cache duration for better performance
    const cacheMaxAge = 86400; // 24 hours in seconds
    res.setHeader('Cache-Control', `public, max-age=${cacheMaxAge}, immutable`);
    
    // Add ETag support for conditional requests
    const etag = `W/"${imagePath}-${width || 'orig'}-${height || 'orig'}-${format}"`;
    res.setHeader('ETag', etag);
    
    // Check if client has a valid cached version
    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end(); // Not Modified
    }
    
    res.sendFile(result.path, {
      headers: {
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': `public, max-age=${cacheMaxAge}, immutable`,
        'ETag': etag
      },
      dotfiles: 'allow',
      maxAge: cacheMaxAge * 1000 // Convert to milliseconds for sendFile
    });
  } catch (error) {
    logError('Error serving image', { 
      path: req.params[0], 
      error: error.message
    });
    res.status(500).json({ error: 'Failed to serve image' });
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

/**
 * Serve a WebP image from the cache
 * 
 * @param {string} imagePath - Path to the WebP image in the cache
 * @returns {File} The WebP image file
 */
router.get('/webp/*', async (req, res) => {
  try {
    const imagePath = req.params[0];
    
    // Don't join with webpCacheDir here, as it might cause path duplication
    // Instead, use securePath to validate and resolve the path
    
    logInfo(`WebP cache request received for: ${imagePath}`);
    
    // Validate the path to prevent directory traversal
    // Use WORKSPACE_PATH as the base to ensure consistent path resolution
    const pathResult = securePath(
      path.join('webp_cache', imagePath), 
      WORKSPACE_PATH, 
      { mustExist: true }
    );
    
    if (!pathResult.isValid) {
      logError('Invalid WebP cache path', { 
        path: imagePath, 
        error: pathResult.error
      });
      return res.status(404).json({ error: 'WebP image not found' });
    }
    
    // Improve caching headers
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Vary', 'Origin, Accept');
    
    // Increase cache duration for better performance
    const cacheMaxAge = 86400; // 24 hours in seconds
    res.setHeader('Cache-Control', `public, max-age=${cacheMaxAge}, immutable`);
    res.setHeader('Content-Type', 'image/webp');
    
    // Add ETag support for conditional requests
    const etag = `W/"${imagePath}"`;
    res.setHeader('ETag', etag);
    
    // Check if client has a valid cached version
    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end(); // Not Modified
    }
    
    res.sendFile(pathResult.path, {
      headers: {
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': `public, max-age=${cacheMaxAge}, immutable`,
        'ETag': etag
      },
      dotfiles: 'allow',
      maxAge: cacheMaxAge * 1000 // Convert to milliseconds for sendFile
    });
  } catch (error) {
    logError('Error serving WebP image', { 
      path: req.params[0], 
      error: error.message
    });
    
    res.status(404).json({ error: 'WebP image not found' });
  }
});

module.exports = router; 