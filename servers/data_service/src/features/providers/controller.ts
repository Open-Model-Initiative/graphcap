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
	try {
		logger.debug("Fetching all providers");

		const allProviders = await db.query.providers.findMany({
			with: {
				models: true,
				rateLimits: true,
			},
		});

		logger.debug(
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
	try {
		// @ts-ignore - Hono OpenAPI validation types are not properly recognized
		const { id } = c.req.valid("param") as ValidatedParams;
		logger.debug({ id }, "Fetching provider by ID");

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

		logger.debug({ id }, "Provider fetched successfully");
		return c.json(provider);
	} catch (error) {
		logger.error({ error }, "Error fetching provider");
		return c.json({ error: "Failed to fetch provider" }, 500);
	}
};

/**
 * Create a new provider
 */
export const createProvider = async (c: Context) => {
	try {
		// @ts-ignore - Hono OpenAPI validation types are not properly recognized
		const data = c.req.valid("json") as ProviderCreate;
		logger.debug({ data }, "Creating new provider");

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

		logger.debug({ id: result?.id }, "Provider created successfully");
		return c.json(result, 201);
	} catch (error) {
		logger.error({ error }, "Error creating provider");
		return c.json({ error: "Failed to create provider" }, 500);
	}
};

/**
 * Update an existing provider
 */
export const updateProvider = async (c: Context) => {
	try {
		// @ts-ignore - Hono OpenAPI validation types are not properly recognized
		const { id } = c.req.valid("param") as ValidatedParams;
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
				timestamp: new Date().toISOString(),
				path: c.req.path
			}, 404);
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

		logger.debug({ id }, "Provider updated successfully");
		return c.json(result);
	} catch (error) {
		logger.error({ 
			error,
			message: error instanceof Error ? error.message : "Unknown error",
			stack: error instanceof Error ? error.stack : undefined,
		}, "Error updating provider");

		// Return detailed error response
		return c.json({
			status: "error",
			statusCode: 500,
			message: error instanceof Error ? error.message : "Failed to update provider",
			timestamp: new Date().toISOString(),
			path: c.req.path,
			details: error instanceof Error ? { name: error.name } : undefined
		}, 500);
	}
};

/**
 * Delete a provider
 */
export const deleteProvider = async (c: Context) => {
	try {
		// @ts-ignore - Hono OpenAPI validation types are not properly recognized
		const { id } = c.req.valid("param") as ValidatedParams;
		logger.debug({ id }, "Deleting provider");

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

		logger.debug({ id }, "Provider deleted successfully");
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

		// Validate API key
		if (!apiKey || apiKey.trim() === '') {
			logger.debug({ id }, "Empty API key provided");
			return c.json({
				status: "error",
				statusCode: 400,
				message: "API key cannot be empty",
				timestamp: new Date().toISOString(),
				path: c.req.path,
				validationErrors: {
					"apiKey": ["API key cannot be empty"]
				}
			}, 400);
		}

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

		// Encrypt the API key
		const encryptedApiKey = await encryptApiKey(apiKey);

		// Update the provider's API key
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
			timestamp: new Date().toISOString()
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
