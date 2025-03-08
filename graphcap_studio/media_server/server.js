// SPDX-License-Identifier: Apache-2.0
/**
 * Graphcap Media Server
 * 
 * This server provides media processing capabilities for the Graphcap Studio application.
 * It currently supports image processing (viewing, cropping, rotating, etc.) and will be
 * extended to support video and other media types in the future.
 * 
 * @module MediaServer
 */

const app = require('./app');
const { PORT, WORKSPACE_PATH, uploadDir, thumbnailsDir } = require('./config');
const { logInfo } = require('./utils/logger');

// Start the server
const server = app.listen(PORT, () => {
  logInfo(`Media Server running on port ${PORT}`);
  logInfo(`Workspace path: ${WORKSPACE_PATH}`);
  logInfo(`Upload directory: ${uploadDir}`);
  logInfo(`Thumbnails directory: ${thumbnailsDir}`);
  
  // Import and run background WebP generation without blocking server startup
  const { generateWebpArtifacts } = require('./utils/background-webp-generator');
  logInfo('Starting background WebP generation process...');
  generateWebpArtifacts();
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logInfo('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logInfo('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  logInfo('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logInfo('HTTP server closed');
  });
}); 