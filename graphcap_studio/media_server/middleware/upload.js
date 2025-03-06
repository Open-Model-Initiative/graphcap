// SPDX-License-Identifier: Apache-2.0
/**
 * File upload middleware for the Graphcap Media Server
 * 
 * This module provides middleware functions to handle file uploads.
 * 
 * @module middleware/upload
 */

const path = require('path');
const multer = require('multer');
const { logError } = require('../utils/logger');
const { uploadDir, FILE_SIZE_LIMIT } = require('../config');

// File filter to validate file types
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitize the original filename to prevent path traversal
    const sanitizedFilename = path.basename(file.originalname).replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${sanitizedFilename}`);
  }
});

// Configure multer with limits and file filter
const upload = multer({ 
  storage,
  limits: {
    fileSize: FILE_SIZE_LIMIT,
    files: 5 // Maximum number of files per upload
  },
  fileFilter
});

/**
 * Middleware to handle multer errors
 * 
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function handleMulterErrors(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === 'LIMIT_FILE_SIZE') {
      logError('File too large', err);
      return res.status(413).json({ 
        error: `File too large. Maximum size is ${FILE_SIZE_LIMIT / (1024 * 1024)}MB` 
      });
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      logError('Too many files', err);
      return res.status(413).json({ error: 'Too many files. Maximum is 5 files per upload' });
    } else {
      logError('Multer error', err);
      return res.status(400).json({ error: err.message });
    }
  } else if (err) {
    // Other errors
    logError('Upload error', err);
    return res.status(500).json({ error: 'File upload failed' });
  }
  next();
}

module.exports = {
  upload,
  handleMulterErrors
}; 