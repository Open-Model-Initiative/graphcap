// SPDX-License-Identifier: Apache-2.0
/**
 * File browsing routes for the Graphcap Media Server
 * 
 * This module provides routes for browsing the workspace directory.
 * 
 * @module routes/files
 */

const express = require('express');
const { WORKSPACE_PATH } = require('../config');
const { listDirectory } = require('../utils/file-system');

const router = express.Router();

/**
 * @route GET /api/files/browse
 * @description List contents of a directory in the workspace
 * @param {string} path - The directory path to list (relative to workspace)
 * @returns {Object} Directory contents
 */
router.get('/browse', async (req, res) => {
  try {
    const dirPath = req.query.path || '/';
    const result = await listDirectory(dirPath, WORKSPACE_PATH);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }
    
    res.json({
      success: true,
      path: result.path,
      contents: result.contents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router; 