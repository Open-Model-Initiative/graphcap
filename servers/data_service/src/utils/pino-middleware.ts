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
		let reqBody: unknown = null;
		let bodyReadable = true;
		if (method !== "GET" && method !== "HEAD") {
			try {
				// Check if the request can be cloned (only works in certain environments)
				if (c.req.raw.clone && typeof c.req.raw.clone === 'function') {
					// Clone the request to read the body without consuming it
					const clonedReq = c.req.raw.clone();
					const contentType = c.req.header("content-type") || "";

					if (contentType.includes("application/json")) {
						try {
							reqBody = await clonedReq.json();
						} catch (jsonError) {
							logger.debug({ error: jsonError }, "Failed to parse JSON body");
							reqBody = "[Unparseable JSON]";
						}
					} else if (contentType.includes("multipart/form-data")) {
						reqBody = "[Multipart form data]";
					} else if (contentType.includes("application/x-www-form-urlencoded")) {
						try {
							reqBody = Object.fromEntries(await clonedReq.formData());
						} catch (formError) {
							logger.debug({ error: formError }, "Failed to parse form data");
							reqBody = "[Unparseable form data]";
						}
					} else {
						try {
							const textBody = await clonedReq.text();
							reqBody = textBody.length > 1000 ? `${textBody.substring(0, 1000)}... [truncated]` : textBody;
						} catch (textError) {
							logger.debug({ error: textError }, "Failed to get text body");
							reqBody = "[Unreadable text body]";
						}
					}
				} else {
					// If request cloning is not supported, don't attempt to read the body
					bodyReadable = false;
					reqBody = "[Body logging disabled - clone not supported]";
					logger.debug("Request body logging skipped - Request.clone() not supported");
				}
			} catch (e) {
				logger.debug({ error: e }, "Error while attempting to read request body");
				reqBody = "[Error reading request body]";
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
				bodyReadable,
			},
			"API Request",
		);

		// Process the request
		const startTime = Date.now();
		await next();
		const responseTime = Date.now() - startTime;

		// Log response details
		// We don't attempt to capture the response body to avoid interference
		// Response body capture requires special handling at the route level
		const resStatus = c.res?.status;
		const resHeaders = c.res?.headers;

		// Log the response
		logger.info(
			{
				type: "response",
				method,
				url,
				path,
				status: resStatus,
				headers: resHeaders,
				responseTime,
				body: "[Response body not captured]",
			},
			"API Response",
		);
	};
};
