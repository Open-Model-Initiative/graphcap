// SPDX-License-Identifier: Apache-2.0
/**
 * Path validation utilities for the Graphcap Media Server
 * 
 * This module provides functions to validate and sanitize file paths
 * to prevent path traversal attacks.
 * 
 * @module utils/path-validator
 */

const path = require('path');
const { logError } = require('./logger');
const { WORKSPACE_PATH } = require('../config');

/**
 * Validates and sanitizes a file path to prevent path traversal attacks
 * 
 * @param {string} userPath - The user-provided path
 * @param {string} basePath - The base path that the final path must be within
 * @returns {Object} Object containing the validated path and success status
 */
function validatePath(userPath, basePath = WORKSPACE_PATH) {
  try {
    // Normalize the path to resolve any '..' or '.' segments
    const normalizedPath = path.normalize(userPath).replace(/^(\.\.(\/|\\|$))+/, '');
    
    // Construct the full path
    const fullPath = path.join(basePath, normalizedPath);
    
    // Ensure the path is within the allowed base path
    if (!fullPath.startsWith(path.resolve(basePath))) {
      return { 
        isValid: false, 
        path: null, 
        error: 'Access denied: Path outside of allowed directory' 
      };
    }
    
    return { isValid: true, path: fullPath, error: null };
  } catch (error) {
    logError('Path validation error', error);
    return { isValid: false, path: null, error: 'Invalid path' };
  }
}

module.exports = {
  validatePath
}; 