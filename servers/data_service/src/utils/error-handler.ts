// SPDX-License-Identifier: Apache-2.0
/**
 * Error Handler
 *
 * Utility for handling and formatting errors in a consistent way.
 */

import type { Context } from "hono";
import { ZodError } from "zod";
import { logger } from "./logger";

interface ErrorResponse {
	status: "error";
	statusCode: number;
	message: string;
	timestamp: string;
	path?: string;
	details?: unknown;
	validationErrors?: Record<string, string[]>;
}

/**
 * Creates a standardized error response object
 */
export function createErrorResponse(
	message: string,
	statusCode = 400,
	details?: unknown,
	path?: string,
): ErrorResponse {
	return {
		status: "error",
		statusCode,
		message,
		timestamp: new Date().toISOString(),
		path,
		details,
	};
}

/**
 * Handles validation errors from Zod
 */
export function handleValidationError(error: ZodError, c: Context): Response {
	const validationErrors: Record<string, string[]> = {};

	for (const err of error.errors) {
		const path = err.path.join(".");
		if (!validationErrors[path]) {
			validationErrors[path] = [];
		}
		validationErrors[path].push(err.message);
	}

	const response = createErrorResponse(
		"Validation error",
		400,
		undefined,
		c.req.path,
	);

	response.validationErrors = validationErrors;

	logger.debug({ validationErrors }, "Validation errors");

	return c.json(response, 400);
}

/**
 * Handles general application errors
 */
export function handleApplicationError(error: unknown, c: Context): Response {
	if (error instanceof ZodError) {
		return handleValidationError(error, c);
	}

	const statusCode = 500;
	let message = "Internal server error";
	let details = undefined;

	if (error instanceof Error) {
		message = error.message;
		details = {
			name: error.name,
			stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
		};
	} else if (typeof error === "string") {
		message = error;
	} else if (typeof error === "object" && error !== null) {
		message = "Application error";
		details = error;
	}

	logger.error({ error, path: c.req.path }, message);

	const response = createErrorResponse(
		message,
		statusCode,
		details,
		c.req.path,
	);
	return c.json(response, statusCode);
}

/**
 * Error handling middleware for Hono
 */
export function errorHandlerMiddleware(options: { logErrors?: boolean } = {}) {
	return async (c: Context, next: () => Promise<void>) => {
		try {
			await next();
		} catch (error) {
			if (options.logErrors !== false) {
				logger.error(
					{
						error,
						path: c.req.path,
						method: c.req.method,
						headers: Object.fromEntries(c.req.headers.entries()),
					},
					"Error caught in middleware",
				);
			}

			return handleApplicationError(error, c);
		}
	};
}

/**
 * Not found error handler for Hono
 */
export function notFoundHandler(c: Context) {
	const response = createErrorResponse(
		`Route not found: ${c.req.method} ${c.req.path}`,
		404,
		undefined,
		c.req.path,
	);

	return c.json(response, 404);
}
