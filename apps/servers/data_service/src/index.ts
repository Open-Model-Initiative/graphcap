// SPDX-License-Identifier: Apache-2.0
/**
 * GraphCap Data Service
 *
 * Main entry point for the data service API.
 */

import app from "./app";
import { env } from "./env";
import { logger } from "./utils/logger";

// Start server using Bun's built-in server
if (import.meta.main) {
	const port = Number.parseInt(env.PORT);

	logger.info(`Data service preparing to start on port ${port}`);
	logger.info(
		`Health check will be available at http://localhost:${port}/health`,
	);
	logger.info(
		`API documentation will be available at http://localhost:${port}/docs`,
	);

try {
  Bun.serve({
    fetch: app.fetch,
    port: port,
    development: env.NODE_ENV === "development",
    error(error) {
      logger.error(`Server error: ${error.message}`);
      return new Response(`Server error: ${error.message}`, {
        status: 500,
      });
    },
  });

  logger.info(`Server started successfully on port ${port}`);
  logger.info(`Local: http://localhost:${port}`);
} catch (error: any) {
		logger.error(`Failed to start server: ${error.message}`);
		process.exit(1);
	}
}
