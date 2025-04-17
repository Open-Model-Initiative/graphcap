// SPDX-License-Identifier: Apache-2.0
/**
 * GraphCap Data Service
 * 
 * Main entry point for the data service API.
 */

import app from './app';
import { env } from './env';
import { logger } from './utils/logger';
import { initializeDatabase } from './db/init';

// Start server using Bun's built-in server
if (import.meta.main) {
  const port = parseInt(env.PORT);
  
  logger.info(`Data service preparing to start on port ${port}`);
  logger.info(`Health check will be available at http://localhost:${port}/health`);
  logger.info(`API documentation will be available at http://localhost:${port}/docs`);
  
  // Initialize database before starting the server
  initializeDatabase()
    .then(() => {
      // Use Bun's serve method with error handling
      try {
        Bun.serve({
          fetch: app.fetch,
          port: port,
          development: env.NODE_ENV === 'development',
          error(error) {
            logger.error(`Server error: ${error.message}`);
            return new Response(`Server error: ${error.message}`, { status: 500 });
          },
        });
        
        logger.info(`Server started successfully on port ${port}`);
        logger.info(`Local: http://localhost:${port}`);
      } catch (error: any) {
        logger.error(`Failed to start server: ${error.message}`);
        process.exit(1);
      }
    })
    .catch((error) => {
      logger.error(`Database initialization failed: ${error.message}`);
      logger.error('Server startup aborted due to database connection failure');
      process.exit(1);
    });
}

// Export the app for testing and importing
export default {
  port: parseInt(env.PORT),
  fetch: app.fetch
}; 