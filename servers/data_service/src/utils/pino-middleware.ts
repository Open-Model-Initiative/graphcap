// SPDX-License-Identifier: Apache-2.0
/**
 * Pino Logger Middleware for Hono
 *
 * Sets up structured logging with hono-pino.
 */

import type { Context } from "hono";
import { pinoLogger } from "hono-pino";
import type { Logger } from "pino";
import { logger } from "./logger";

// Define our logger property in the Hono context variables
declare module "hono" {
	interface ContextVariableMap {
		logger: Logger;
	}
}

/**
 * Create a customized Pino logger middleware for Hono
 *
 * This middleware will log all requests and responses with structured data
 * and provide a child logger instance accessible via c.var.logger.
 */
export const createPinoLoggerMiddleware = () => {
	// Return the pino logger middleware
	return pinoLogger({
		pino: logger,
	});
};

/**
 * Detailed logging middleware
 *
 * This middleware captures and logs detailed request/response information
 * separately from the pino logger middleware.
 */
export const createDetailedLoggingMiddleware = () => {
	return async (c: Context, next: () => Promise<void>) => {
		// Log request details before processing
		const { method } = c.req;
		const url = c.req.url;
		const path = c.req.path;
		
		// Safely get query parameters
		let queryParams: Record<string, string | string[]>;
		try {
			queryParams = c.req.query();
		} catch (e) {
			queryParams = {}; // Fallback to empty object if query() throws an error
			logger.debug({ error: e }, "Failed to get query parameters");
		}

		// Try to get the request body if not a GET or HEAD request
		let reqBody = null;
		if (method !== "GET" && method !== "HEAD") {
			try {
				// Clone the request to read the body without consuming it
				const clonedReq = c.req.raw.clone();
				const contentType = c.req.header("content-type") || "";

				if (contentType.includes("application/json")) {
					reqBody = await clonedReq.json();
				} else if (contentType.includes("multipart/form-data")) {
					reqBody = "Multipart form data";
				} else if (contentType.includes("application/x-www-form-urlencoded")) {
					reqBody = Object.fromEntries(await clonedReq.formData());
				} else {
					reqBody = await clonedReq.text();
				}
			} catch (e) {
				// If we can't read the body, log that
				reqBody = "Could not parse request body";
			}
		}

		// Log the request
		logger.info(
			{
				type: "request",
				method,
				url,
				path,
				query: queryParams,
				headers: c.req.header(),
				body: reqBody,
			},
			"API Request",
		);

		// Process the request
		const startTime = Date.now();
		await next();
		const responseTime = Date.now() - startTime;

		// Log response details
		let resBody = null;
		try {
			// We can't easily get the response body without modifying how responses are created
			// So we'll just log the response status
			resBody = "Response body not captured";
		} catch (e) {
			resBody = "Could not capture response body";
		}

		// Log the response
		logger.info(
			{
				type: "response",
				method,
				url,
				path,
				status: c.res?.status,
				headers: c.res?.headers,
				responseTime,
				body: resBody,
			},
			"API Response",
		);
	};
};
