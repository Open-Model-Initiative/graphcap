// SPDX-License-Identifier: Apache-2.0
/**
 * Path validation utilities for the Graphcap Media Server
 * 
 * This module provides functions to validate and sanitize file paths
 * to prevent path traversal attacks.
 * 
 * @module utils/path-validator
 * @deprecated Use path-utils.js instead
 */

const { securePath } = require('./path-utils');
const { WORKSPACE_PATH } = require('../config');

/**
 * Validates and sanitizes a file path to prevent path traversal attacks
 * 
 * @param {string} userPath - The user-provided path
 * @param {string} basePath - The base path that the final path must be within
 * @returns {Object} Object containing the validated path and success status
 * @deprecated Use securePath from path-utils.js instead
 */
function validatePath(userPath, basePath = WORKSPACE_PATH) {
  const result = securePath(userPath, basePath);
  
  // Return in the old format for backward compatibility
  return {
    isValid: result.isValid,
    path: result.path,
    error: result.error
  };
}

module.exports = {
  validatePath
}; 