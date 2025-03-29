// SPDX-License-Identifier: Apache-2.0
/**
 * Provider API Adapters
 *
 * This module provides adapter functions for converting between API and application
 * provider types, handling the conversion between numeric and string IDs.
 */

import type { Provider, ProviderModel, ProviderModelInfo } from "@/types/provider-config-types";
import { normalizeProviderId } from "@/types/provider-config-types";

// Type for raw API provider data
interface ApiProvider {
	id: number;
	name: string;
	kind: string;
	environment: "cloud" | "local";
	baseUrl: string;
	apiKey?: string;
	isEnabled: boolean;
	defaultModel?: string;
	createdAt: string | Date;
	updatedAt: string | Date;
	models?: ApiProviderModel[];
}

// Type for raw API provider model data
interface ApiProviderModel {
	id: number;
	providerId: number;
	name: string;
	isEnabled: boolean;
	createdAt: string | Date;
	updatedAt: string | Date;
}

// Type for raw API model info
interface ApiModelInfo {
	id: string;
	name: string;
	is_default?: boolean;
}

/**
 * Convert API provider to application Provider type
 * This handles ID conversion from number to string
 */
export function fromApiProvider(apiProvider: ApiProvider): Provider {
	return {
		id: normalizeProviderId(apiProvider.id),
		name: apiProvider.name,
		kind: apiProvider.kind,
		environment: apiProvider.environment,
		baseUrl: apiProvider.baseUrl,
		apiKey: apiProvider.apiKey,
		isEnabled: apiProvider.isEnabled,
		defaultModel: apiProvider.defaultModel,
		createdAt: apiProvider.createdAt,
		updatedAt: apiProvider.updatedAt,

		// Convert nested models
		models: apiProvider.models?.map((model: ApiProviderModel) => ({
			id: normalizeProviderId(model.id),
			providerId: normalizeProviderId(model.providerId),
			name: model.name,
			isEnabled: model.isEnabled,
			createdAt: model.createdAt,
			updatedAt: model.updatedAt,
		})),
	};
}

/**
 * Convert application Provider to API provider
 * This handles ID conversion from string to number
 */
export function toApiProvider(provider: Provider): ApiProvider {
	return {
		id: Number.parseInt(provider.id, 10),
		name: provider.name,
		kind: provider.kind,
		environment: provider.environment,
		baseUrl: provider.baseUrl,
		apiKey: provider.apiKey,
		isEnabled: provider.isEnabled,
		defaultModel: provider.defaultModel,
		createdAt: provider.createdAt,
		updatedAt: provider.updatedAt,

		// Convert models back to numeric IDs
		models: provider.models?.map((model) => ({
			id: Number.parseInt(model.id, 10),
			providerId: Number.parseInt(model.providerId, 10),
			name: model.name,
			isEnabled: model.isEnabled,
			createdAt: model.createdAt,
			updatedAt: model.updatedAt,
		})),
	};
}

/**
 * Convert API model info to application ProviderModelInfo
 */
export function fromApiModelInfo(apiModel: ApiModelInfo): ProviderModelInfo {
	return {
		id: apiModel.id,
		name: apiModel.name,
		is_default: apiModel.is_default,
	};
}

/**
 * Create a provider model with defaults
 */
export function createProviderModel(
	providerId: string,
	name: string,
	id?: string,
): ProviderModel {
	return {
		id: id || crypto.randomUUID(), // Generate UUID if no ID provided
		providerId,
		name,
		isEnabled: true,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	};
}
