// SPDX-License-Identifier: Apache-2.0

/**
 * Default values for provider form
 */
export const DEFAULT_PROVIDER_FORM_DATA = {
	name: "",
	kind: "openai" as const,
	environment: "cloud" as const,
	baseUrl: "",
	apiKey: "",
	isEnabled: false,
	defaultModel: "",
	models: [],
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
	"gemini",
	"ollama",
	"vllm",
] as const;
