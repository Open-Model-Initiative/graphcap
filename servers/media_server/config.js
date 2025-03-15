// SPDX-License-Identifier: Apache-2.0
/**
 * Configuration settings for the Graphcap Media Server
 * 
 * This module centralizes all configuration settings for the application.
 * 
 * @module config
 */

const path = require('path');

// Environment variables with defaults
const PORT = process.env.PORT || 32400;
const WORKSPACE_PATH = process.env.WORKSPACE_PATH || '/workspace';

// Derived paths
const uploadDir = path.join(WORKSPACE_PATH, 'processed');
const thumbnailsDir = path.join(WORKSPACE_PATH, 'thumbnails');
const webpCacheDir = path.join(WORKSPACE_PATH, 'webp_cache');

// File size limits
const FILE_SIZE_LIMIT = 50 * 1024 * 1024; // 50MB limit for uploads
const MAX_DIMENSION = 2000; // Maximum allowed dimension for thumbnails

module.exports = {
  PORT,
  WORKSPACE_PATH,
  uploadDir,
  thumbnailsDir,
  webpCacheDir,
  FILE_SIZE_LIMIT,
  MAX_DIMENSION
}; 