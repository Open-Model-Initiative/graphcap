// SPDX-License-Identifier: Apache-2.0
/**
 * GraphCap Data Service
 *
 * Main entry point for the data service API.
 */

import { logger } from "@graphcap/lib";
import app from "./app";
import { env } from "./env";

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
	} catch (error) {
		// Use unknown and type check for Error instance
		if (error instanceof Error) {
			logger.error(`Failed to start server: ${error.message}`);
		} else {
			logger.error(`Failed to start server with unknown error: ${String(error)}`);
		}
		process.exit(1);
	}
}
