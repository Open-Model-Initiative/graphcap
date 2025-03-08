// SPDX-License-Identifier: Apache-2.0
/**
 * Health check routes for the Graphcap Media Server
 * 
 * This module provides routes for health checks.
 * 
 * @module routes/health
 */

const express = require('express');
const router = express.Router();

/**
 * Health check endpoint
 * 
 * @returns {Object} Status object
 */
router.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = router; 