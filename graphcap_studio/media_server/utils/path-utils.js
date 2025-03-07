// SPDX-License-Identifier: Apache-2.0
/**
 * Path utilities for the Graphcap Media Server
 * 
 * This module provides secure path handling functions to prevent path traversal attacks
 * and ensure consistent path handling throughout the application.
 * 
 * @module utils/path-utils
 */

const path = require('path');
const fs = require('fs');
const { logError, logInfo } = require('./logger');
const { WORKSPACE_PATH } = require('../config');

/**
 * Securely resolves a user-provided path relative to a base path
 * 
 * This function prevents path traversal attacks by ensuring the resolved path
 * is within the allowed base directory, even when using symbolic links.
 * 
 * @param {string} userPath - The user-provided path (can be relative or absolute)
 * @param {string} basePath - The base path that the final path must be within (defaults to WORKSPACE_PATH)
 * @param {Object} options - Additional options
 * @param {boolean} options.mustExist - Whether the path must exist (default: false)
 * @param {boolean} options.followSymlinks - Whether to follow symbolic links (default: false)
 * @param {boolean} options.createIfNotExist - Whether to create the directory if it doesn't exist (default: false)
 * @returns {Object} Object containing validation result and resolved path
 */
function securePath(userPath, basePath = WORKSPACE_PATH, options = {}) {
  const {
    mustExist = false,
    followSymlinks = false,
    createIfNotExist = false
  } = options;

  try {
    // Handle empty or undefined paths
    if (!userPath) {
      return {
        isValid: false,
        path: null,
        relativePath: null,
        error: 'Path is required'
      };
    }

    // Normalize the base path
    const normalizedBasePath = path.resolve(basePath);
    
    // Remove any leading slashes from user path to ensure it's treated as relative
    const sanitizedUserPath = userPath.toString().replace(/^[/\\]+/, '');
    
    // Join the base path with the sanitized user path
    let fullPath = path.join(normalizedBasePath, sanitizedUserPath);
    
    // Resolve the path to its canonical form
    fullPath = path.resolve(fullPath);
    
    // Check if the path is within the allowed base path
    if (!fullPath.startsWith(normalizedBasePath)) {
      return {
        isValid: false,
        path: null,
        relativePath: null,
        error: 'Access denied: Path outside of allowed directory'
      };
    }
    
    // Check if path exists if required
    if (mustExist && !fs.existsSync(fullPath)) {
      return {
        isValid: false,
        path: null,
        relativePath: null,
        error: 'Path does not exist'
      };
    }
    
    // Create directory if it doesn't exist and createIfNotExist is true
    if (createIfNotExist && !fs.existsSync(fullPath)) {
      try {
        fs.mkdirSync(fullPath, { recursive: true });
        logInfo(`Created directory: ${fullPath}`);
      } catch (err) {
        return {
          isValid: false,
          path: null,
          relativePath: null,
          error: `Failed to create directory: ${err.message}`
        };
      }
    }
    
    // If we need to follow symlinks, resolve the real path
    if (followSymlinks && fs.existsSync(fullPath)) {
      try {
        const realPath = fs.realpathSync(fullPath);
        
        // Check if the real path is still within the allowed base path
        if (!realPath.startsWith(normalizedBasePath)) {
          return {
            isValid: false,
            path: null,
            relativePath: null,
            error: 'Access denied: Symbolic link points outside of allowed directory'
          };
        }
        
        fullPath = realPath;
      } catch (err) {
        return {
          isValid: false,
          path: null,
          relativePath: null,
          error: `Failed to resolve symbolic link: ${err.message}`
        };
      }
    }
    
    // Calculate the relative path from the base path
    const relativePath = path.relative(normalizedBasePath, fullPath);
    
    return {
      isValid: true,
      path: fullPath,
      relativePath: '/' + relativePath.replace(/\\/g, '/'),
      error: null
    };
  } catch (error) {
    logError('Path validation error', error);
    return {
      isValid: false,
      path: null,
      relativePath: null,
      error: `Invalid path: ${error.message}`
    };
  }
}

/**
 * Validates a filename to ensure it only contains safe characters
 * 
 * @param {string} filename - The filename to validate
 * @returns {Object} Object containing validation result and sanitized filename
 */
function validateFilename(filename) {
  if (!filename) {
    return {
      isValid: false,
      sanitized: null,
      error: 'Filename is required'
    };
  }
  
  // Remove any path components
  const basename = path.basename(filename);
  
  // Check for invalid characters
  if (/[<>:"\/\\|?*\u0000-\u001F]/.test(basename)) {
    // Sanitize by replacing invalid characters
    const sanitized = basename.replace(/[<>:"\/\\|?*\u0000-\u001F]/g, '_');
    return {
      isValid: false,
      sanitized,
      error: 'Filename contains invalid characters'
    };
  }
  
  return {
    isValid: true,
    sanitized: basename,
    error: null
  };
}

/**
 * Joins path segments securely
 * 
 * @param {...string} segments - Path segments to join
 * @returns {string} Joined path
 */
function joinPath(...segments) {
  return path.join(...segments);
}

/**
 * Gets the directory name of a path
 * 
 * @param {string} filePath - The file path
 * @returns {string} Directory name
 */
function getDirname(filePath) {
  return path.dirname(filePath);
}

/**
 * Gets the base name of a file path
 * 
 * @param {string} filePath - The file path
 * @param {string} ext - Optional extension to remove
 * @returns {string} Base name
 */
function getBasename(filePath, ext) {
  return path.basename(filePath, ext);
}

/**
 * Gets the extension of a file path
 * 
 * @param {string} filePath - The file path
 * @returns {string} Extension
 */
function getExtension(filePath) {
  return path.extname(filePath);
}

/**
 * Creates a directory if it doesn't exist
 * 
 * @param {string} dirPath - The directory path
 * @param {boolean} recursive - Whether to create parent directories
 * @returns {boolean} Whether the directory was created successfully
 */
function ensureDir(dirPath, recursive = true) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive });
      return true;
    }
    return true;
  } catch (error) {
    logError(`Failed to create directory: ${dirPath}`, error);
    return false;
  }
}

module.exports = {
  securePath,
  validateFilename,
  joinPath,
  getDirname,
  getBasename,
  getExtension,
  ensureDir
}; 