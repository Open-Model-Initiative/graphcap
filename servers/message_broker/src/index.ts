/**
 * GraphCap Message Broker
 *
 * Main entry point for the message broker service.
 */

import type { Server } from "bun";
import app from "./app";
import { env } from "./env";
import { close, connect } from "./services/broker";

// Start server using Bun's built-in server
if (import.meta.main) {
	const port = Number.parseInt(env.PORT);

	console.info(`Message broker preparing to start on port ${port}`);
	console.info(
		`Health check will be available at http://localhost:${port}/health`,
	);
	console.info(
		`API documentation will be available at http://localhost:${port}/docs`,
	);

	// Initialize RabbitMQ connection before starting the server
	connect()
		.then(() => {
			// Use Bun's serve method with error handling
			let server: Server | null = null;

			try {
				server = Bun.serve({
					fetch: app.fetch,
					port: port,
					development: env.NODE_ENV === "development",
					error(error) {
						console.error(`Server error: ${error.message}`);
						return new Response(`Server error: ${error.message}`, {
							status: 500,
						});
					},
				});

				console.info(`Server started successfully on port ${port}`);
				console.info(`Local: http://localhost:${port}`);
			} catch (error: unknown) {
				const errorMessage =
					error instanceof Error ? error.message : String(error);
				console.error(`Failed to start server: ${errorMessage}`);
				process.exit(1);
			}

			// Handle graceful shutdown
			const shutdown = async () => {
				console.info("Shutting down server...");

				try {
					// Close RabbitMQ connection
					await close();

					// Close HTTP server if it exists
					if (server) {
						server.stop(true);
						console.info("HTTP server closed");
					}

					console.info("Message broker stopped gracefully");
					process.exit(0);
				} catch (error) {
					console.error("Error during shutdown:", error);
					process.exit(1);
				}
			};

			// Register shutdown handlers
			process.on("SIGTERM", shutdown);
			process.on("SIGINT", shutdown);
		})
		.catch((error) => {
			console.error(`RabbitMQ connection failed: ${error.message}`);
			console.error(
				"Server startup aborted due to RabbitMQ connection failure",
			);
			process.exit(1);
		});
}

// Export the app for testing and importing
export default {
	port: Number.parseInt(env.PORT),
	fetch: app.fetch,
};
