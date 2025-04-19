// SPDX-License-Identifier: Apache-2.0
/**
 * Provider Controllers
 *
 * This module defines the controller functions for provider management.
 */

import { dbClient } from "@graphcap/datamodel/src/db";
import { providerModels, providerRateLimits, providers } from "@graphcap/datamodel/src/schema";
import { eq } from "drizzle-orm";
import type { Context } from "hono";
import type { Logger } from "pino";
import { decryptApiKey, encryptApiKey } from "../../utils/encryption";
import { processApiKeyForUpdate } from "./api-key-manager";
import type { Provider, ProviderCreate, ProviderUpdate } from "./schemas";



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
		const allProviders = await dbClient.query.providers.findMany({
			with: {
				models: true,
				rateLimits: true,
			},
		});

		// Decrypt API keys before returning to client
		for (const provider of allProviders) {
			if (provider.apiKey) {
				logger.debug(
					{ providerId: provider.id },
					"Decrypting API key for provider",
				);
				provider.apiKey = await decryptApiKey(provider.apiKey);

				// Log whether API key is present after decryption (without showing the actual key)
				logger.debug(
					{
						providerId: provider.id,
						apiKeyPresent: Boolean(provider.apiKey),
						apiKeyLength: provider.apiKey ? provider.apiKey.length : 0,
					},
					"Provider API key decryption result",
				);
			} else {
				logger.debug(
					{ providerId: provider.id },
					"No API key to decrypt for provider",
				);
			}
		}

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
	const id = c.req.param("id");
	logger.debug({ id }, "Fetching provider by ID");

	try {
		// @ts-ignore - Hono OpenAPI validation types are not properly recognized
		const { id: paramId } = c.req.valid("param") as ValidatedParams;
		if (id === paramId) {
			const provider = await dbClient.query.providers.findFirst({
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

			// Decrypt API key before returning to client
			if (provider.apiKey) {
				logger.debug(
					{
						providerId: id,
						encryptedKeyLength: provider.apiKey.length,
					},
					"Decrypting API key for provider",
				);

				provider.apiKey = await decryptApiKey(provider.apiKey);

				// Log the result of decryption (without showing the actual key)
				logger.debug(
					{
						providerId: id,
						apiKeyPresent: Boolean(provider.apiKey),
						apiKeyLength: provider.apiKey ? provider.apiKey.length : 0,
					},
					"Provider API key decryption result",
				);
			} else {
				logger.debug({ providerId: id }, "No API key to decrypt for provider");
			}

			logger.info({ providerId: id }, "Provider fetched successfully");
			return c.json(provider);
		}

		// If ID mismatch, return not found (removed else clause)
		logger.warn({ providerId: id }, "Provider not found");
		return c.json({ error: "Provider not found" }, 404);
	} catch (error) {
		logger.error({ error, providerId: id }, "Error fetching provider");
		return c.json({ error: "Failed to fetch provider" }, 500);
	}
};

/**
 * Validates provider data during creation
 */
const validateProviderCreate = (
	data: ProviderCreate,
): Record<string, string[]> => {
	const validationErrors: Record<string, string[]> = {};

	// Name validation
	if (!data.name) {
		validationErrors.name = ["Provider name is required"];
	} else if (data.name.trim() === "") {
		validationErrors.name = ["Provider name cannot be just whitespace"];
	} else if (data.name.length < 3) {
		validationErrors.name = [
			"Provider name must be at least 3 characters long",
		];
	}

	// Kind validation
	if (!data.kind) {
		validationErrors.kind = ["Provider kind is required"];
	} else if (data.kind.trim() === "") {
		validationErrors.kind = ["Provider kind cannot be just whitespace"];
	}

	// Base URL validation
	if (!data.baseUrl) {
		validationErrors.baseUrl = ["Base URL is required"];
	} else {
		try {
			new URL(data.baseUrl);
		} catch (e) {
			validationErrors.baseUrl = ["Base URL must be a valid URL"];
		}
	}

	// Environment validation
	if (!data.environment) {
		validationErrors.environment = ["Environment is required"];
	} else if (!["cloud", "local"].includes(data.environment)) {
		validationErrors.environment = [
			'Environment must be either "cloud" or "local"',
		];
	}

	return validationErrors;
};

/**
 * Handles specific error cases for provider creation
 */
const handleProviderCreateError = (c: Context, error: unknown) => {
	const logger = c.var.logger;

	logger.error(
		{
			error,
			message: error instanceof Error ? error.message : "Unknown error",
			stack: error instanceof Error ? error.stack : undefined,
		},
		"Error creating provider",
	);

	// Check for specific error types to provide better error messages
	if (error instanceof Error) {
		// Handle database unique constraint violation
		if (
			error.message.includes("duplicate key value violates unique constraint")
		) {
			return c.json(
				{
					status: "error",
					statusCode: 400,
					message: "A provider with that name already exists",
					details: {
						type: "UniqueConstraintViolation",
					},
				},
				400,
			);
		}

		// Handle other database errors
		if (error.message.includes("database") || error.message.includes("query")) {
			return c.json(
				{
					status: "error",
					statusCode: 500,
					message: "Database error occurred while creating provider",
					details: {
						type: "DatabaseError",
					},
				},
				500,
			);
		}

		// Handle validation errors from Zod or other validators
		if (error.message.includes("validation")) {
			return c.json(
				{
					status: "error",
					statusCode: 400,
					message: "Validation error",
					details: {
						message: error.message,
					},
				},
				400,
			);
		}
	}

	// Generic error fallback
	return c.json(
		{
			status: "error",
			statusCode: 500,
			message: "Failed to create provider",
			details: error instanceof Error ? { message: error.message } : undefined,
		},
		500,
	);
};

/**
 * Creates provider data in the database
 */
const saveProviderToDatabase = async (
	tx: typeof dbClient,
	providerData: Omit<ProviderCreate, "models" | "rateLimits">,
	models?: ProviderCreate["models"],
	rateLimits?: ProviderCreate["rateLimits"],
) => {
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
				isEnabled: model.isEnabled ?? true,
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

		// Validate the provider data
		const validationErrors = validateProviderCreate(data);

		// If there are validation errors, return them
		if (Object.keys(validationErrors).length > 0) {
			logger.debug(
				{ validationErrors },
				"Validation errors in provider creation",
			);
			return c.json(
				{
					status: "error",
					statusCode: 400,
					message: "Validation failed",
					validationErrors,
				},
				400,
			);
		}

		// Extract models and rate limits if provided
		const { models, rateLimits, ...providerData } = data;

		// Encrypt API key if provided
		if (providerData.apiKey) {
			providerData.apiKey = await encryptApiKey(providerData.apiKey);
		}

		// Start a transaction
		const result = await db.transaction(async (tx) => {
			return saveProviderToDatabase(tx, providerData, models, rateLimits);
		});

		logger.info(
			{
				provider: {
					id: result?.id,
					name: result?.name,
					kind: result?.kind,
				},
			},
			"Provider created successfully",
		);
		return c.json(result, 201);
	} catch (error) {
		return handleProviderCreateError(c, error);
	}
};

/**
 * Validates provider data during update
 */
const validateProviderUpdate = (
): Record<string, string[]> => {
	const validationErrors: Record<string, string[]> = {};
	
	// Add validation logic here if needed
	
	return validationErrors;
};

/**
 * Checks if a value has changed
 */
const hasValueChanged = (existingValue: unknown, newValue: unknown): boolean => {
	return existingValue !== newValue && newValue !== undefined;
};

/**
 * Creates a log entry for API key changes
 */
const createApiKeyLogEntry = (
	existingValue: unknown, 
	value: unknown
): { from: unknown; to: unknown } => {
	return {
		from: existingValue ? "[ENCRYPTED]" : "[EMPTY]",
		to: value ? "[NEW_VALUE]" : "[EMPTY]",
	};
};

/**
 * Logs an API key change
 */
const logApiKeyChange = (
	logger: Logger,
	id: string,
	existingValue: unknown,
	value: unknown
): void => {
	logger.info(
		{ providerId: id },
		`Updating API key from ${existingValue ? "existing value" : "empty"} to ${value ? "new value" : "empty"}`,
	);
};

/**
 * Logs all field changes
 */
const logAllFieldChanges = (
	logger: Logger,
	id: string,
	existingProvider: Record<string, unknown>,
	updatedFields: Record<string, { from: unknown; to: unknown }>
): void => {
	if (Object.keys(updatedFields).length > 0) {
		logger.info(
			{
				providerId: id,
				provider: existingProvider.name,
				updatedFields,
			},
			"Provider fields being updated",
		);
	}
};

/**
 * Logs field changes between existing provider and update data
 */
const logFieldChanges = (
	logger: Logger,
	id: string,
	existingProvider: Record<string, unknown>,
	providerData: Partial<ProviderUpdate>
): Record<string, { from: unknown; to: unknown }> => {
	const updatedFields: Record<string, { from: unknown; to: unknown }> = {};

	// Compare each field being updated with existing values
	for (const [key, value] of Object.entries(providerData)) {
		const existingValue = (existingProvider as Record<string, unknown>)[key];
		
		// Only process if the value is actually changing
		if (hasValueChanged(existingValue, value)) {
			// Special handling for API key to avoid logging actual values
			if (key === "apiKey") {
				updatedFields[key] = createApiKeyLogEntry(existingValue, value);
				logApiKeyChange(logger, id, existingValue, value);
			} else {
				updatedFields[key] = { from: existingValue, to: value };
			}
		}
	}

	// Log all field changes
	logAllFieldChanges(logger, id, existingProvider, updatedFields);

	return updatedFields;
};

/**
 * Processes model updates
 */
const processModelUpdates = async (
	tx: typeof dbClient,
	id: string,
	models: ProviderUpdate["models"],
) => {
	if (!models || models.length === 0) return;

	// First, delete existing models
	await tx
		.delete(providerModels)
		.where(eq(providerModels.providerId, Number.parseInt(id)));

	// Then insert new models
	await tx.insert(providerModels).values(
		models.map((model) => {
			// Create base model data object
			const modelData = {
				providerId: Number.parseInt(id),
				name: model.name,
				isEnabled: model.isEnabled ?? true,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			// Only include ID if it exists and is a number
			if (model.id !== undefined && typeof model.id === "number") {
				return {
					...modelData,
					id: model.id,
				};
			}

			// Let database auto-generate ID
			return modelData;
		}),
	);
};

/**
 * Processes rate limit updates
 */
const processRateLimitUpdates = async (
	tx: typeof dbClient,
	id: string,
	rateLimits: ProviderUpdate["rateLimits"],
) => {
	if (!rateLimits) return;

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
};

/**
 * Handles database updates for a provider
 */
const updateProviderInDatabase = async (
	tx: typeof dbClient,
	id: string,
	providerData: Partial<ProviderUpdate>,
	models?: ProviderUpdate["models"],
	rateLimits?: ProviderUpdate["rateLimits"],
): Promise<Provider | null> => {
	// Get the current provider from the database to ensure we have the latest data
	const currentProvider = await tx.query.providers.findFirst({
		where: eq(providers.id, Number.parseInt(id)),
	});

	if (!currentProvider) {
		throw new Error(`Provider not found with id ${id}`);
	}

	// Use the API key manager to handle API key updates
	const apiKeyToUse = await processApiKeyForUpdate(
		currentProvider,
		providerData.apiKey,
	);

	// Update provider with the appropriate API key
	await tx
		.update(providers)
		.set({
			...providerData,
			apiKey: apiKeyToUse, // Use the properly determined API key
			updatedAt: new Date(),
		})
		.where(eq(providers.id, Number.parseInt(id)));

	// Update models if provided
	if (models && models.length > 0) {
		await processModelUpdates(tx, id, models);
	}

	// Update rate limits if provided
	if (rateLimits) {
		await processRateLimitUpdates(tx, id, rateLimits);
	}

	// Return the updated provider with relations
	const result = await tx.query.providers.findFirst({
		where: eq(providers.id, Number.parseInt(id)),
		with: {
			models: true,
			rateLimits: true,
		},
	});
	
	// Cast to ensure type safety
	return result as Provider | null;
};

/**
 * Handles specific error cases for provider updates
 */
const handleProviderUpdateError = (c: Context, error: unknown) => {
	const logger = c.var.logger;
	const id = c.req.param("id");

	logger.error(
		{
			error,
			message: error instanceof Error ? error.message : "Unknown error",
			stack: error instanceof Error ? error.stack : undefined,
			providerId: id,
		},
		"Error updating provider",
	);

	// Return error response
	return c.json(
		{
			status: "error",
			statusCode: 500,
			message:
				error instanceof Error ? error.message : "Failed to update provider",
			errorType: error instanceof Error ? error.name : "Unknown",
		},
		500,
	);
};

/**
 * Checks if a provider exists
 */
const checkProviderExists = async (id: string): Promise<boolean> => {
	const provider = await dbClient.query.providers.findFirst({
		where: eq(providers.id, Number.parseInt(id)),
	});
	return !!provider;
};

/**
 * Fetches existing provider with models and rate limits
 */
const fetchExistingProvider = async (id: string): Promise<Provider | null> => {
	const provider = await dbClient.query.providers.findFirst({
		where: eq(providers.id, Number.parseInt(id)),
		with: {
			models: true,
			rateLimits: true,
		},
	});
	
	// Cast to ensure type safety
	return provider as Provider | null;
};

/**
 * Logs API key status for debugging
 */
const logApiKeyStatus = (
	logger: Logger,
	id: string, 
	existingProvider: Provider, 
	providerData: Partial<ProviderUpdate>
): void => {
	logger.debug(
		{
			providerId: id,
			original_apiKey_present: existingProvider.apiKey !== null,
			update_apiKey_present: "apiKey" in providerData,
			update_apiKey_value_present:
				providerData.apiKey !== undefined && providerData.apiKey !== null,
		},
		"API key update status",
	);
};

/**
 * Logs model updates
 */
const logModelUpdates = (
	logger: Logger,
	id: string,
	models: ProviderUpdate["models"]
): void => {
	if (models && models.length > 0) {
		logger.info(
			{ providerId: id, modelCount: models.length },
			"Updating provider models",
		);
	}
};

/**
 * Fetches and logs rate limit information
 */
const fetchAndLogRateLimits = async (
	logger: Logger,
	id: string,
	existingProvider: Provider,
	rateLimits: ProviderUpdate["rateLimits"]
): Promise<void> => {
	if (!rateLimits) return;

	// Query for existing rate limits
	const existingRateLimitsQuery =
		await dbClient.query.providerRateLimits.findFirst({
			where: eq(providerRateLimits.providerId, Number.parseInt(id)),
		});

	logger.info(
		{
			providerId: id,
			provider: existingProvider.name,
			existingRateLimits: existingRateLimitsQuery
				? {
						requestsPerMinute: existingRateLimitsQuery.requestsPerMinute,
						tokensPerMinute: existingRateLimitsQuery.tokensPerMinute,
					}
				: { requestsPerMinute: null, tokensPerMinute: null },
			newRateLimits: rateLimits,
		},
		"Updating provider rate limits",
	);
};

/**
 * Log the result of a successful provider update
 */
const logSuccessfulUpdate = (
	logger: Logger,
	id: string,
	result: Provider | null
): void => {
	logger.info(
		{
			providerId: id,
			provider: {
				name: result?.name,
				kind: result?.kind,
			},
		},
		"Provider updated successfully",
	);
};

/**
 * Update an existing provider
 */
export const updateProvider = async (c: Context) => {
	const { logger } = c.var;
	const id = c.req.param("id");

	try {
		// @ts-ignore - Hono OpenAPI validation types are not properly recognized
		const data = c.req.valid("json") as ProviderUpdate;
		logger.debug(
			{
				id,
				data: {
					...data,
					apiKey: data.apiKey !== undefined ? "[PRESENT]" : "[MISSING]",
				},
			},
			"Updating provider",
		);

		// Check if provider exists
		const existingProvider = await fetchExistingProvider(id);

		if (!existingProvider) {
			logger.debug({ id }, "Provider not found for update");
			return c.json(
				{
					status: "error",
					statusCode: 404,
					message: "Provider not found",
					providerId: id,
				},
				404,
			);
		}

		// Validate update data
		const validationErrors = validateProviderUpdate(data);

		// If there are validation errors, return them
		if (Object.keys(validationErrors).length > 0) {
			logger.debug(
				{ validationErrors },
				"Validation errors in provider update",
			);
			return c.json(
				{
					status: "error",
					statusCode: 400,
					message: "Validation failed",
					providerId: id,
					validationErrors,
				},
				400,
			);
		}

		// Extract models and rate limits if provided
		const { models, rateLimits, ...providerData } = data;

		// Log API key status for debugging
		logApiKeyStatus(logger, id, existingProvider, providerData);

		// Log field changes
		logFieldChanges(logger, id, existingProvider, providerData);

		// Log model and rate limit changes
		logModelUpdates(logger, id, models);
		
		// Log rate limit changes if provided
		await fetchAndLogRateLimits(logger, id, existingProvider, rateLimits);

		// Update the provider in the database
		const result = await dbClient.transaction(async (tx) => {
			return updateProviderInDatabase(tx, id, providerData, models, rateLimits);
		});

		// Log successful update (only if result is not null)
		if (result) {
			logSuccessfulUpdate(logger, id, result);
		}
		
		return c.json(result);
	} catch (error) {
		return handleProviderUpdateError(c, error);
	}
};

/**
 * Delete a provider
 */
export const deleteProvider = async (c: Context) => {
	const { logger } = c.var;
	const id = c.req.param("id");

	logger.debug({ id }, "Deleting provider");

	try {
		// Check if provider exists
		const providerExists = await checkProviderExists(id);

		if (!providerExists) {
			logger.debug({ id }, "Provider not found for deletion");
			return c.json({ error: "Provider not found" }, 404);
		}

		// Delete provider (cascade will handle related records)
		await dbClient.delete(providers).where(eq(providers.id, Number.parseInt(id)));

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
