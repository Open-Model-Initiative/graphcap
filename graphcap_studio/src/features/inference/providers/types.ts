// SPDX-License-Identifier: Apache-2.0
/**
 * Provider Types
 *
 * Type definitions for provider-related data.
 */

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
 * Provider configuration
 */
export interface Provider {
	id: number;
	name: string;
	kind: string;
	environment: "cloud" | "local";
	envVar: string;
	baseUrl: string;
	apiKey?: string;
	isEnabled: boolean;
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
	envVar: string;
	baseUrl: string;
	apiKey?: string;
	isEnabled?: boolean;
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
	envVar?: string;
	baseUrl?: string;
	isEnabled?: boolean;
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
