// SPDX-License-Identifier: Apache-2.0
/**
 * Express app setup for the Graphcap Media Server
 * 
 * This module sets up the Express app with middleware and routes.
 * 
 * @module app
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const { logInfo } = require('./utils/logger');
const { globalErrorHandler } = require('./middleware/error-handler');
const { uploadDir, thumbnailsDir } = require('./config');

// Import routes
const healthRoutes = require('./routes/health');
const imagesRoutes = require('./routes/images');
const datasetsRoutes = require('./routes/datasets');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Create required directories if they don't exist
if (!fs.existsSync(uploadDir)) {
  logInfo(`Creating upload directory: ${uploadDir}`);
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(thumbnailsDir)) {
  logInfo(`Creating thumbnails directory: ${thumbnailsDir}`);
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

// Routes
app.use('/health', healthRoutes);
app.use('/api/images', imagesRoutes);
app.use('/api/datasets', datasetsRoutes);

// Global error handler - must be defined after all routes
app.use(globalErrorHandler);

module.exports = app; 