// SPDX-License-Identifier: Apache-2.0
/**
 * Error handling middleware for the Graphcap Media Server
 * 
 * This module provides middleware functions to handle errors.
 * 
 * @module middleware/error-handler
 */

const { logError } = require('../utils/logger');

/**
 * Global error handler middleware
 * 
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function globalErrorHandler(err, req, res, next) {
  logError('Unhandled server error', err);
  
  // Don't expose stack traces in production
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message || 'Unknown error';
    
  res.status(500).json({ error: errorMessage });
}

module.exports = {
  globalErrorHandler
}; 