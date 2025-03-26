// SPDX-License-Identifier: Apache-2.0
/**
 * Provider Controllers
 *
 * This module defines the controller functions for provider management.
 */

import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { db } from "../../db";
import { providerModels, providerRateLimits, providers } from "../../db/schema";
import { encryptApiKey } from "../../utils/encryption";
import { logger } from "../../utils/logger";
import type {
	ProviderApiKey,
	ProviderCreate,
	ProviderUpdate,
} from "./schemas";

// Type for the validated parameters
type ValidatedParams = {
	id: string;
};

/**
 * Get all providers
 */
export const getProviders = async (c: Context) => {
	const { logger } = c.var;
	logger.debug("Fetching all providers");

	try {
		const allProviders = await db.query.providers.findMany({
			with: {
				models: true,
				rateLimits: true,
			},
		});

		logger.info(
			{ count: allProviders.length },
			"Providers fetched successfully",
		);
		return c.json(allProviders);
	} catch (error) {
		// Log the full error details for debugging
		logger.error(
			{
				error,
				message: error instanceof Error ? error.message : "Unknown error",
				stack: error instanceof Error ? error.stack : undefined,
			},
			"Error fetching providers",
		);

		// Return a more informative error response
		return c.json(
			{
				error: "Failed to fetch providers",
				message:
					error instanceof Error ? error.message : "Unknown database error",
			},
			500,
		);
	}
};

/**
 * Get a specific provider by ID
 */
export const getProvider = async (c: Context) => {
	const { logger } = c.var;
	const id = c.req.param('id');
	logger.debug({ id }, "Fetching provider by ID");

	try {
		// @ts-ignore - Hono OpenAPI validation types are not properly recognized
		const { id: paramId } = c.req.valid("param") as ValidatedParams;
		if (id === paramId) {
			const provider = await db.query.providers.findFirst({
				where: eq(providers.id, Number.parseInt(id)),
				with: {
					models: true,
					rateLimits: true,
				},
			});

			if (!provider) {
				logger.debug({ id }, "Provider not found");
				return c.json({ error: "Provider not found" }, 404);
			}

			logger.info({ providerId: id }, "Provider fetched successfully");
			return c.json(provider);
		} else {
			logger.warn({ providerId: id }, "Provider not found");
			return c.json({ error: "Provider not found" }, 404);
		}
	} catch (error) {
		logger.error({ error, providerId: id }, "Error fetching provider");
		return c.json({ error: "Failed to fetch provider" }, 500);
	}
};

/**
 * Create a new provider
 */
export const createProvider = async (c: Context) => {
	const { logger } = c.var;
	
	try {
		// @ts-ignore - Hono OpenAPI validation types are not properly recognized
		const data = c.req.valid("json") as ProviderCreate;
		logger.debug({ data }, "Creating new provider");

		// Enhanced validation with detailed error messages
		const validationErrors: Record<string, string[]> = {};
		
		// Name validation
		if (!data.name) {
			validationErrors.name = ['Provider name is required'];
		} else if (data.name.trim() === '') {
			validationErrors.name = ['Provider name cannot be just whitespace'];
		} else if (data.name.length < 3) {
			validationErrors.name = ['Provider name must be at least 3 characters long'];
		}
		
		// Kind validation
		if (!data.kind) {
			validationErrors.kind = ['Provider kind is required'];
		} else if (data.kind.trim() === '') {
			validationErrors.kind = ['Provider kind cannot be just whitespace'];
		}
		
		// Base URL validation
		if (!data.baseUrl) {
			validationErrors.baseUrl = ['Base URL is required'];
		} else {
			try {
				new URL(data.baseUrl);
			} catch (e) {
				validationErrors.baseUrl = ['Base URL must be a valid URL'];
			}
		}
		
		// Environment validation
		if (!data.environment) {
			validationErrors.environment = ['Environment is required'];
		} else if (!['cloud', 'local'].includes(data.environment)) {
			validationErrors.environment = ['Environment must be either "cloud" or "local"'];
		}
		
		// If there are validation errors, return them
		if (Object.keys(validationErrors).length > 0) {
			logger.debug({ validationErrors }, "Validation errors in provider creation");
			return c.json({
				status: "error",
				statusCode: 400,
				message: "Validation failed",
				validationErrors
			}, 400);
		}

		// Extract models and rate limits if provided
		const { models, rateLimits, ...providerData } = data;

		// Encrypt API key if provided
		if (providerData.apiKey) {
			providerData.apiKey = await encryptApiKey(providerData.apiKey);
		}

		// Start a transaction
		const result = await db.transaction(async (tx) => {
			// Insert provider
			const [provider] = await tx
				.insert(providers)
				.values({
					...providerData,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			// Insert models if provided
			if (models && models.length > 0) {
				await tx.insert(providerModels).values(
					models.map((model) => ({
						providerId: provider.id,
						name: model.name,
						isEnabled: model.isEnabled,
						createdAt: new Date(),
						updatedAt: new Date(),
					})),
				);
			}

			// Insert rate limits if provided
			if (rateLimits) {
				await tx.insert(providerRateLimits).values({
					providerId: provider.id,
					requestsPerMinute: rateLimits.requestsPerMinute,
					tokensPerMinute: rateLimits.tokensPerMinute,
					createdAt: new Date(),
					updatedAt: new Date(),
				});
			}

			// Return the created provider with relations
			return await tx.query.providers.findFirst({
				where: eq(providers.id, provider.id),
				with: {
					models: true,
					rateLimits: true,
				},
			});
		});

		logger.info({ 
			provider: { 
				id: result?.id, 
				name: result?.name,
				kind: result?.kind 
			} 
		}, "Provider created successfully");
		return c.json(result, 201);
	} catch (error) {
		logger.error({ 
			error,
			message: error instanceof Error ? error.message : "Unknown error",
			stack: error instanceof Error ? error.stack : undefined
		}, "Error creating provider");
		
		// Check for specific error types to provide better error messages
		if (error instanceof Error) {
			// Handle database unique constraint violation
			if (error.message.includes('duplicate key value violates unique constraint')) {
				return c.json({
					status: "error",
					statusCode: 400,
					message: "A provider with that name already exists",
					details: {
						type: "UniqueConstraintViolation"
					}
				}, 400);
			}
			
			// Handle other database errors
			if (error.message.includes('database') || error.message.includes('query')) {
				return c.json({
					status: "error",
					statusCode: 500,
					message: "Database error occurred while creating provider",
					details: {
						type: "DatabaseError"
					}
				}, 500);
			}
			
			// Handle validation errors from Zod or other validators
			if (error.message.includes('validation')) {
				return c.json({
					status: "error",
					statusCode: 400,
					message: "Validation error",
					details: {
						message: error.message
					}
				}, 400);
			}
		}
		
		// Generic error fallback
		return c.json({
			status: "error",
			statusCode: 500,
			message: "Failed to create provider",
			details: error instanceof Error ? { message: error.message } : undefined
		}, 500);
	}
};

/**
 * Update an existing provider
 */
export const updateProvider = async (c: Context) => {
	const { logger } = c.var;
	const id = c.req.param('id');
	
	try {
		// @ts-ignore - Hono OpenAPI validation types are not properly recognized
		const data = c.req.valid("json") as ProviderUpdate;
		logger.debug({ id, data }, "Updating provider");

		// Check if provider exists
		const existingProvider = await db.query.providers.findFirst({
			where: eq(providers.id, Number.parseInt(id)),
		});

		if (!existingProvider) {
			logger.debug({ id }, "Provider not found for update");
			return c.json({
				status: "error",
				statusCode: 404,
				message: "Provider not found",
				providerId: id
			}, 404);
		}

		// Enhanced validation with detailed error messages
		const validationErrors: Record<string, string[]> = {};
		
		
		// If there are validation errors, return them
		if (Object.keys(validationErrors).length > 0) {
			logger.debug({ validationErrors }, "Validation errors in provider update");
			return c.json({
				status: "error",
				statusCode: 400,
				message: "Validation failed",
				providerId: id,
				validationErrors
			}, 400);
		}

		// Extract models and rate limits if provided
		const { models, rateLimits, ...providerData } = data;

		// Start a transaction
		const result = await db.transaction(async (tx) => {
			// Update provider
			await tx
				.update(providers)
				.set({
					...providerData,
					updatedAt: new Date(),
				})
				.where(eq(providers.id, Number.parseInt(id)));

			// Update models if provided
			if (models && models.length > 0) {
				// First, delete existing models
				await tx
					.delete(providerModels)
					.where(eq(providerModels.providerId, Number.parseInt(id)));

				// Then insert new models
				await tx.insert(providerModels).values(
					models.map((model) => ({
						providerId: Number.parseInt(id),
						name: model.name,
						isEnabled: model.isEnabled,
						createdAt: new Date(),
						updatedAt: new Date(),
					})),
				);
			}

			// Update rate limits if provided
			if (rateLimits) {
				// Check if rate limits exist
				const existingRateLimits = await tx.query.providerRateLimits.findFirst({
					where: eq(providerRateLimits.providerId, Number.parseInt(id)),
				});

				if (existingRateLimits) {
					// Update existing rate limits
					await tx
						.update(providerRateLimits)
						.set({
							requestsPerMinute: rateLimits.requestsPerMinute,
							tokensPerMinute: rateLimits.tokensPerMinute,
							updatedAt: new Date(),
						})
						.where(eq(providerRateLimits.providerId, Number.parseInt(id)));
				} else {
					// Insert new rate limits
					await tx.insert(providerRateLimits).values({
						providerId: Number.parseInt(id),
						requestsPerMinute: rateLimits.requestsPerMinute,
						tokensPerMinute: rateLimits.tokensPerMinute,
						createdAt: new Date(),
						updatedAt: new Date(),
					});
				}
			}

			// Return the updated provider with relations
			return await tx.query.providers.findFirst({
				where: eq(providers.id, Number.parseInt(id)),
				with: {
					models: true,
					rateLimits: true,
				},
			});
		});

		logger.info({ 
			providerId: id,
			provider: { 
				name: result?.name,
				kind: result?.kind 
			} 
		}, "Provider updated successfully");
		return c.json(result);
	} catch (error) {
		logger.error({ 
			error,
			message: error instanceof Error ? error.message : "Unknown error",
			stack: error instanceof Error ? error.stack : undefined,
			providerId: c.req.param('id')
		}, "Error updating provider");

		// Return error response
		return c.json({
			status: "error",
			statusCode: 500,
			message: error instanceof Error ? error.message : "Failed to update provider",
			errorType: error instanceof Error ? error.name : 'Unknown'
		}, 500);
	}
};

/**
 * Delete a provider
 */
export const deleteProvider = async (c: Context) => {
	const { logger } = c.var;
	const id = c.req.param('id');
	
	logger.debug({ id }, "Deleting provider");
	
	try {
		// Check if provider exists
		const existingProvider = await db.query.providers.findFirst({
			where: eq(providers.id, Number.parseInt(id)),
		});

		if (!existingProvider) {
			logger.debug({ id }, "Provider not found for deletion");
			return c.json({ error: "Provider not found" }, 404);
		}

		// Delete provider (cascade will handle related records)
		await db.delete(providers).where(eq(providers.id, Number.parseInt(id)));

		logger.info({ providerId: id }, "Provider deleted successfully");
		return c.json({
			success: true,
			message: "Provider deleted successfully",
		});
	} catch (error) {
		logger.error({ error }, "Error deleting provider");
		return c.json({ error: "Failed to delete provider" }, 500);
	}
};

/**
 * Update a provider's API key
 */
export const updateProviderApiKey = async (c: Context) => {
	try {
		// @ts-ignore - Hono OpenAPI validation types are not properly recognized
		const { id } = c.req.valid("param") as ValidatedParams;
		// @ts-ignore - Hono OpenAPI validation types are not properly recognized
		const { apiKey } = c.req.valid("json") as ProviderApiKey;
		logger.debug({ id }, "Updating provider API key");

		// Check if provider exists
		const existingProvider = await db.query.providers.findFirst({
			where: eq(providers.id, Number.parseInt(id)),
		});

		if (!existingProvider) {
			logger.debug({ id }, "Provider not found for API key update");
			return c.json({
				status: "error",
				statusCode: 404,
				message: "Provider not found",
				timestamp: new Date().toISOString(),
				path: c.req.path
			}, 404);
		}

		// Validate API key
		const validationErrors: Record<string, string[]> = {};
		
		if (!apiKey || apiKey.trim() === '') {
			validationErrors.apiKey = ['API key cannot be empty'];
		}
		
		// If there are validation errors, return them
		if (Object.keys(validationErrors).length > 0) {
			logger.debug({ validationErrors }, "API key validation errors");
			return c.json({
				status: "error",
				statusCode: 400,
				message: "Validation failed",
				timestamp: new Date().toISOString(),
				path: c.req.path,
				validationErrors
			}, 400);
		}

		// Encrypt API key
		const encryptedApiKey = await encryptApiKey(apiKey);

		// Update API key
		await db
			.update(providers)
			.set({
				apiKey: encryptedApiKey,
				updatedAt: new Date(),
			})
			.where(eq(providers.id, Number.parseInt(id)));

		logger.debug({ id }, "Provider API key updated successfully");
		return c.json({
			success: true,
			message: "API key updated successfully",
		});
	} catch (error) {
		const providerId = c.req.param('id');
		logger.error({ 
			error,
			message: error instanceof Error ? error.message : "Unknown error",
			stack: error instanceof Error ? error.stack : undefined,
			providerId
		}, "Error updating provider API key");
		
		// Return detailed error response
		return c.json({
			status: "error",
			statusCode: 500,
			message: error instanceof Error ? error.message : "Failed to update API key",
			timestamp: new Date().toISOString(),
			path: c.req.path,
			details: error instanceof Error ? { name: error.name } : undefined
		}, 500);
	}
};
