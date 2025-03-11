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
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');
const { logInfo } = require('./utils/logger');
const { globalErrorHandler } = require('./middleware/error-handler');
const { uploadDir, thumbnailsDir, webpCacheDir } = require('./config');

// Import routes
const healthRoutes = require('./routes/health');
const imagesRoutes = require('./routes/images');
const datasetsRoutes = require('./routes/datasets');
const filesRoutes = require('./routes/files');

// Initialize Express app
const app = express();

// Disable x-powered-by header to prevent information disclosure
app.disable('x-powered-by');

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for now, can be restricted to specific domains later
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // Cache preflight requests for 24 hours
}));

// Add specific CORS headers for image routes
app.use('/api/images/view', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(express.json());
app.use(morgan('dev'));

// Configure helmet with options that allow cross-origin resource sharing
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', '*'], // Allow images from any source
      connectSrc: ["'self'", '*'] // Allow connections to any source
    }
  }
}));

// Create required directories if they don't exist
if (!fs.existsSync(uploadDir)) {
  logInfo(`Creating upload directory: ${uploadDir}`);
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(thumbnailsDir)) {
  logInfo(`Creating thumbnails directory: ${thumbnailsDir}`);
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

if (!fs.existsSync(webpCacheDir)) {
  logInfo(`Creating WebP cache directory: ${webpCacheDir}`);
  fs.mkdirSync(webpCacheDir, { recursive: true });
}

// Configure Express to serve static files from the WebP cache directory
// This is needed because Express doesn't serve files from directories starting with a dot by default
app.use('/webp_cache', express.static(webpCacheDir, {
  maxAge: 86400000, // Cache for 24 hours
  immutable: true,  // Content is immutable until the maxAge
  index: false,     // Disable directory listing
  dotfiles: 'allow' // Allow serving files that begin with a dot
}));

// Routes
app.use('/health', healthRoutes);
app.use('/api/images', imagesRoutes);
app.use('/api/datasets', datasetsRoutes);
app.use('/api/files', filesRoutes);

// Global error handler - must be defined after all routes
app.use(globalErrorHandler);

module.exports = app; 