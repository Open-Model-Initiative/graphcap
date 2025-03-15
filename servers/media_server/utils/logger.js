// SPDX-License-Identifier: Apache-2.0
/**
 * Logging utilities for the Graphcap Media Server
 * 
 * This module provides standardized logging functions for the application.
 * 
 * @module utils/logger
 */

/**
 * Log informational messages
 * 
 * @param {string} message - The log message
 * @param {Object|null} data - Optional data to include in the log
 */
function logInfo(message, data = null) {
  const logMessage = data 
    ? `${message}: ${JSON.stringify(data, null, 2)}`
    : message;
  console.log(`[INFO] ${new Date().toISOString()} - ${logMessage}`);
}

/**
 * Log error messages
 * 
 * @param {string} message - The error message
 * @param {Error|Object} error - The error object or additional data
 */
function logError(message, error) {
  console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
  if (error) {
    if (error instanceof Error) {
      console.error(`${error.message}\n${error.stack}`);
    } else {
      console.error(JSON.stringify(error, null, 2));
    }
  }
}

module.exports = {
  logInfo,
  logError
}; 