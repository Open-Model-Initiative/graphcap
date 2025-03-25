// SPDX-License-Identifier: Apache-2.0

/**
 * Default values for provider form
 */
export const DEFAULT_PROVIDER_FORM_DATA = {
	name: "",
	kind: "",
	environment: "cloud" as const,
	baseUrl: "",
	apiKey: "",
	isEnabled: true,
	defaultModel: "",
	fetchModels: true,
	models: [],
	rateLimits: {
		requestsPerMinute: 0,
		tokensPerMinute: 0,
	},
};

/**
 * Environment options for providers
 */
export const PROVIDER_ENVIRONMENTS = ["cloud", "local"] as const;

/**
 * Provider kinds
 */
export const PROVIDER_KINDS = [
	"openai",
	"google",
	"ollama",
	"vllm",
] as const;
