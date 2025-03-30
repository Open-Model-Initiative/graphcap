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
 * Get safe query parameters with error handling
 */
const getSafeQueryParams = (c: Context): Record<string, string | string[]> => {
	try {
		return c.req.query();
	} catch (e) {
		logger.debug({ error: e }, "Failed to get query parameters");
		return {}; // Fallback to empty object if query() throws an error
	}
};

/**
 * Extract and parse request body based on content type
 */
const parseRequestBody = async (clonedReq: Request, contentType: string): Promise<unknown> => {
	if (contentType.includes("application/json")) {
		try {
			return await clonedReq.json();
		} catch (jsonError) {
			logger.debug({ error: jsonError }, "Failed to parse JSON body");
			return "[Unparseable JSON]";
		}
	} 
	
	if (contentType.includes("multipart/form-data")) {
		return "[Multipart form data]";
	} 
	
	if (contentType.includes("application/x-www-form-urlencoded")) {
		try {
			return Object.fromEntries(await clonedReq.formData());
		} catch (formError) {
			logger.debug({ error: formError }, "Failed to parse form data");
			return "[Unparseable form data]";
		}
	} 
	
	// Default to text handling
	try {
		const textBody = await clonedReq.text();
		return textBody.length > 1000 ? `${textBody.substring(0, 1000)}... [truncated]` : textBody;
	} catch (textError) {
		logger.debug({ error: textError }, "Failed to get text body");
		return "[Unreadable text body]";
	}
};

/**
 * Extract request body with proper error handling
 */
const getRequestBody = async (c: Context, method: string): Promise<[unknown, boolean]> => {
	// Skip for GET and HEAD requests
	if (method === "GET" || method === "HEAD") {
		return [null, true];
	}

	try {
		// Check if the request can be cloned
		if (c.req.raw.clone && typeof c.req.raw.clone === 'function') {
			const clonedReq = c.req.raw.clone();
			const contentType = c.req.header("content-type") ?? "";
			const body = await parseRequestBody(clonedReq, contentType);
			return [body, true];
		}
		
		// If request cloning is not supported
		logger.debug("Request body logging skipped - Request.clone() not supported");
		return ["[Body logging disabled - clone not supported]", false];
	} catch (e) {
		logger.debug({ error: e }, "Error while attempting to read request body");
		return ["[Error reading request body]", true];
	}
};

/**
 * Log request information
 */
const logRequest = (
	method: string, 
	url: string, 
	path: string, 
	queryParams: Record<string, string | string[]>, 
	headers: Record<string, string>,
	body: unknown,
	bodyReadable: boolean
) => {
	logger.info(
		{
			type: "request",
			method,
			url,
			path,
			query: queryParams,
			headers,
			body,
			bodyReadable,
		},
		"API Request",
	);
};

/**
 * Log response information
 */
const logResponse = (
	method: string,
	url: string,
	path: string,
	status: number | undefined,
	headers: Headers | undefined,
	responseTime: number
) => {
	logger.info(
		{
			type: "response",
			method,
			url,
			path,
			status,
			headers,
			responseTime,
			body: "[Response body not captured]",
		},
		"API Response",
	);
};

/**
 * Detailed logging middleware
 *
 * This middleware captures and logs detailed request/response information
 * separately from the pino logger middleware.
 */
export const createDetailedLoggingMiddleware = () => {
	return async (c: Context, next: () => Promise<void>) => {
		// Extract basic request information
		const { method } = c.req;
		const url = c.req.url;
		const path = c.req.path;
		
		// Get request components
		const queryParams = getSafeQueryParams(c);
		const [reqBody, bodyReadable] = await getRequestBody(c, method);
		
		// Log the request
		logRequest(method, url, path, queryParams, c.req.header(), reqBody, bodyReadable);

		// Process the request and measure response time
		const startTime = Date.now();
		await next();
		const responseTime = Date.now() - startTime;

		// Log response details
		logResponse(method, url, path, c.res?.status, c.res?.headers, responseTime);
	};
};
