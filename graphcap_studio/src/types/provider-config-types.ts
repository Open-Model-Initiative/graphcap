// SPDX-License-Identifier: Apache-2.0
/**
 * Provider Types
 *
 * Type definitions for provider-related data with Zod validation.
 */

import { z } from "zod";

// ============================================================================
// SECTION A - ZOD SCHEMAS
// ============================================================================

/**
 * Base provider schema
 */
export const BaseProviderSchema = z.object({
	id: z.string(),
	name: z.string().min(1, "Name is required"),
	isEnabled: z.boolean().default(true),
});

/**
 * Provider model schema
 */
export const ProviderModelSchema = z.object({
	id: z.string(),
	providerId: z.string(),
	name: z.string().min(1, "Model name is required"),
	isEnabled: z.boolean().default(true),
	createdAt: z.string().or(z.date()),
	updatedAt: z.string().or(z.date()),
});

/**
 * Complete provider schema
 */
export const ProviderSchema = BaseProviderSchema.extend({
	kind: z.string().min(1, "Kind is required"),
	environment: z.enum(["cloud", "local"]),
	baseUrl: z.string().url("Must be a valid URL"),
	apiKey: z.string().optional(),
	defaultModel: z.string().optional(),
	createdAt: z.string().or(z.date()),
	updatedAt: z.string().or(z.date()),
	models: z.array(ProviderModelSchema).optional(),
});

// Provider creation schema
export const ProviderCreateSchema = z.object({
	name: z.string().min(1, "Name is required"),
	kind: z.string().min(1, "Kind is required"),
	environment: z.enum(["cloud", "local"]),
	baseUrl: z.string().url("Must be a valid URL"),
	apiKey: z.string().optional(),
	isEnabled: z.boolean().default(true),
	defaultModel: z.string().optional(),
	models: z
		.array(
			z.object({
				name: z.string().min(1, "Model name is required"),
				isEnabled: z.boolean().default(true),
			}),
		)
		.optional(),
});

// Provider update schema
export const ProviderUpdateSchema = z.object({
	name: z.string().min(1, "Name is required").optional(),
	kind: z.string().min(1, "Kind is required").optional(),
	environment: z.enum(["cloud", "local"]).optional(),
	baseUrl: z.string().url("Must be a valid URL").optional(),
	apiKey: z.string().optional(),
	isEnabled: z.boolean().optional(),
	defaultModel: z.string().optional(),
	models: z
		.array(
			z.object({
				id: z.string().optional(),
				name: z.string().min(1, "Model name is required"),
				isEnabled: z.boolean().default(true),
			}),
		)
		.optional(),
});

// Provider model info schema
export const ProviderModelInfoSchema = z.object({
	id: z.string(),
	name: z.string(),
	is_default: z.boolean().optional(),
});

// Provider models response schema
export const ProviderModelsResponseSchema = z.object({
	provider: z.string(),
	models: z.array(ProviderModelInfoSchema),
});

// Success response schema
export const SuccessResponseSchema = z.object({
	success: z.boolean(),
	message: z.string(),
});

// Error details schema
export const ErrorDetailsSchema = z.object({
	message: z.string(),
	code: z.string().optional(),
	details: z.record(z.unknown()).optional(),
});

// Connection details schema
export const ConnectionDetailsSchema = z.object({
	result: z.boolean(),
	details: z.record(z.unknown()).optional(),
	message: z.string().optional(),
});

// Server provider config schema
export const ServerProviderConfigSchema = z.object({
	name: z.string(),
	kind: z.string(),
	environment: z.enum(["cloud", "local"]),
	base_url: z.string(),
	api_key: z.string(),
	default_model: z.string().optional(),
	models: z.array(z.string()),
});

// ============================================================================
// SECTION B - INFERRED TYPES
// ============================================================================

/**
 * Base provider interface for selection
 */
export type BaseProvider = z.infer<typeof BaseProviderSchema>;

/**
 * Provider model
 */
export type ProviderModel = z.infer<typeof ProviderModelSchema>;

/**
 * Provider configuration stored in data service
 */
export type Provider = z.infer<typeof ProviderSchema>;

/**
 * Provider creation payload
 */
export type ProviderCreate = z.infer<typeof ProviderCreateSchema>;

/**
 * Provider update payload
 */
export type ProviderUpdate = z.infer<typeof ProviderUpdateSchema>;

/**
 * Provider model info from GraphCap server
 */
export type ProviderModelInfo = z.infer<typeof ProviderModelInfoSchema>;

/**
 * Provider models response from GraphCap server
 */
export type ProviderModelsResponse = z.infer<
	typeof ProviderModelsResponseSchema
>;

/**
 * Success response
 */
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;

/**
 * Error details
 */
export type ErrorDetails = z.infer<typeof ErrorDetailsSchema>;

/**
 * Connection details
 */
export type ConnectionDetails = z.infer<typeof ConnectionDetailsSchema>;

/**
 * Server-side provider configuration
 * This is the configuration that gets sent to the inference server
 */
export type ServerProviderConfig = z.infer<typeof ServerProviderConfigSchema>;

// ============================================================================
// SECTION C - UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert string ID to number for API calls
 */
export function denormalizeProviderId(id: string): number {
	return Number.parseInt(id, 10);
}

/**
 * Convert number ID to string for frontend use
 */
export function normalizeProviderId(id: number | string): string {
	return id.toString();
}

/**
 * Helper function to convert Provider to ServerProviderConfig
 */
export function toServerConfig(provider: Provider): ServerProviderConfig {
	return {
		name: provider.name,
		kind: provider.kind,
		environment: provider.environment,
		base_url: provider.baseUrl,
		api_key: provider.apiKey || "",
		default_model: provider.defaultModel,
		models: provider.models?.map((m) => m.name) || [],
	};
}
