// SPDX-License-Identifier: Apache-2.0
/**
 * Provider Types
 *
 * Type definitions for provider-related data.
 */

/**
 * Server-side provider configuration
 * This is the configuration that gets sent to the inference server
 */
export interface ServerProviderConfig {
	name: string;
	kind: string;
	environment: "cloud" | "local";
	base_url: string;
	api_key: string;  // Required for server requests
	default_model?: string;
	models: string[];
	fetch_models: boolean;
	rate_limits?: {
		requests_per_minute?: number;
		tokens_per_minute?: number;
	};
}

/**
 * Provider model
 */
export interface ProviderModel {
	id: number;
	providerId: number;
	name: string;
	isEnabled: boolean;
	createdAt: string | Date;
	updatedAt: string | Date;
}

/**
 * Rate limits configuration
 */
export interface RateLimits {
	id: number;
	providerId: number;
	requestsPerMinute?: number;
	tokensPerMinute?: number;
	createdAt: string | Date;
	updatedAt: string | Date;
}

/**
 * Provider configuration stored in data service
 */
export interface Provider {
	id: number;
	name: string;
	kind: string;
	environment: "cloud" | "local";
	baseUrl: string;
	apiKey: string;  // Changed from optional to required
	isEnabled: boolean;
	defaultModel?: string;
	fetchModels: boolean;
	createdAt: string | Date;
	updatedAt: string | Date;
	models?: ProviderModel[];
	rateLimits?: RateLimits;
}

/**
 * Provider creation payload
 */
export interface ProviderCreate {
	name: string;
	kind: string;
	environment: "cloud" | "local";
	baseUrl: string;
	apiKey: string;  // Changed from optional to required
	isEnabled?: boolean;
	defaultModel?: string;
	fetchModels?: boolean;
	models?: Array<{
		name: string;
		isEnabled?: boolean;
	}>;
	rateLimits?: {
		requestsPerMinute?: number;
		tokensPerMinute?: number;
	};
}

/**
 * Provider update payload
 */
export interface ProviderUpdate {
	name?: string;
	kind?: string;
	environment?: "cloud" | "local";
	baseUrl?: string;
	apiKey?: string;
	isEnabled?: boolean;
	defaultModel?: string;
	fetchModels?: boolean;
	models?: Array<{
		id?: number;
		name: string;
		isEnabled?: boolean;
	}>;
	rateLimits?: {
		requestsPerMinute?: number;
		tokensPerMinute?: number;
	};
}

/**
 * Provider API key update payload
 */
export interface ProviderApiKey {
	apiKey: string;
}

/**
 * Success response
 */
export interface SuccessResponse {
	success: boolean;
	message: string;
}

/**
 * Provider model info from GraphCap server
 */
export interface ProviderModelInfo {
	id: string;
	name: string;
	is_default: boolean;
}

/**
 * Provider models response from GraphCap server
 */
export interface ProviderModelsResponse {
	provider: string;
	models: ProviderModelInfo[];
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
		api_key: provider.apiKey,
		default_model: provider.defaultModel,
		models: provider.models?.map(m => m.name) || [],
		fetch_models: provider.fetchModels,
		rate_limits: provider.rateLimits ? {
			requests_per_minute: provider.rateLimits.requestsPerMinute,
			tokens_per_minute: provider.rateLimits.tokensPerMinute
		} : undefined
	};
}
