// SPDX-License-Identifier: Apache-2.0
/**
 * File system utilities for the Graphcap Media Server
 * 
 * This module provides functions for working with the file system,
 * particularly for listing directory contents.
 * 
 * @module utils/file-system
 */

const fs = require('fs');
const path = require('path');
const { securePath } = require('./path-utils');
const { logError } = require('./logger');

/**
 * Lists the contents of a directory
 * 
 * @param {string} dirPath - The directory path to list
 * @param {string} basePath - The base path for security validation
 * @returns {Object} Object containing success status and directory contents or error
 */
async function listDirectory(dirPath, basePath) {
  try {
    // Validate and resolve the path
    const pathResult = securePath(dirPath, basePath, { mustExist: true });
    
    if (!pathResult.isValid) {
      return {
        success: false,
        error: pathResult.error
      };
    }
    
    // Check if the path is a directory
    const stats = await fs.promises.stat(pathResult.path);
    if (!stats.isDirectory()) {
      return {
        success: false,
        error: 'Path is not a directory'
      };
    }
    
    // Read directory contents
    const entries = await fs.promises.readdir(pathResult.path);
    
    // Get details for each entry
    const contents = await Promise.all(
      entries.map(async (entry) => {
        const entryPath = path.join(pathResult.path, entry);
        try {
          const entryStats = await fs.promises.stat(entryPath);
          
          // Generate a unique ID for the entry
          const relativePath = path.relative(basePath, entryPath).replace(/\\/g, '/');
          const id = relativePath;
          
          return {
            id,
            name: entry,
            type: entryStats.isDirectory() ? 'directory' : 'file',
            size: entryStats.isFile() ? entryStats.size : undefined,
            lastModified: entryStats.mtime.toISOString()
          };
        } catch (error) {
          logError(`Error getting stats for ${entryPath}`, error);
          return null;
        }
      })
    );
    
    // Filter out null entries (from errors)
    const validContents = contents.filter(entry => entry !== null);
    
    return {
      success: true,
      path: pathResult.relativePath,
      contents: validContents
    };
  } catch (error) {
    logError(`Error listing directory ${dirPath}`, error);
    return {
      success: false,
      error: `Failed to list directory: ${error.message}`
    };
  }
}

module.exports = {
  listDirectory
}; 