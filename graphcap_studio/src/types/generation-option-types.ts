// SPDX-License-Identifier: Apache-2.0
/**
 * Generation Options Schema
 *
 * This module defines the validation schema for generation options,
 * replacing the legacy CaptionOptions with a consolidated schema.
 */

import { z } from "zod";

// Configuration for option min/max values and steps
export const OPTION_CONFIGS = {
	temperature: { min: 0, max: 1, step: 0.1, precision: 1 },
	max_tokens: { min: 1, max: 8192, step: 1, precision: 0 },
	top_p: { min: 0, max: 1, step: 0.05, precision: 2 },
	repetition_penalty: { min: 1, max: 2, step: 0.1, precision: 1 },
	global_context: { min: 0, max: 0, step: 0, precision: 0 },
} as const;

// Supported resolution presets
export const RESOLUTION_PRESETS = {
	NONE: { label: "No Resize", value: "NONE" },
	SD_VGA: { label: "SD (640×480)", value: "SD_VGA" },
	HD_720P: { label: "HD (720p)", value: "HD_720P" },
	FHD_1080P: { label: "FHD (1080p)", value: "FHD_1080P" },
	QHD_1440P: { label: "QHD (1440p)", value: "QHD_1440P" },
	UHD_4K: { label: "4K UHD", value: "UHD_4K" },
	UHD_8K: { label: "8K UHD", value: "UHD_8K" },
} as const;

// Default options for generation
export const DEFAULT_OPTIONS = {
	temperature: 0.7,
	max_tokens: 4096,
	top_p: 0.95,
	repetition_penalty: 1.1,
	resize_resolution: "NONE", // Default to no resize
	global_context: "You are a visual captioning perspective.",
	context: [] as string[], // Default to empty context array
	provider_name: "", // Default to empty (will be populated later)
	model_name: "", // Default to empty (will be populated later)
} as const;

// Schema for generation options
export const GenerationOptionsSchema = z.object({
	temperature: z
		.number()
		.min(OPTION_CONFIGS.temperature.min)
		.max(OPTION_CONFIGS.temperature.max)
		.default(DEFAULT_OPTIONS.temperature),

	max_tokens: z
		.number()
		.int()
		.min(OPTION_CONFIGS.max_tokens.min)
		.max(OPTION_CONFIGS.max_tokens.max)
		.default(DEFAULT_OPTIONS.max_tokens),

	top_p: z
		.number()
		.min(OPTION_CONFIGS.top_p.min)
		.max(OPTION_CONFIGS.top_p.max)
		.default(DEFAULT_OPTIONS.top_p),

	repetition_penalty: z
		.number()
		.min(OPTION_CONFIGS.repetition_penalty.min)
		.max(OPTION_CONFIGS.repetition_penalty.max)
		.default(DEFAULT_OPTIONS.repetition_penalty),

	resize_resolution: z.string().default(DEFAULT_OPTIONS.resize_resolution),

	global_context: z.string().default(DEFAULT_OPTIONS.global_context),
	
	// Added context array (was in CaptionOptions)
	context: z.array(z.string()).default([]),
	
	// Provider and model selection (using names instead of IDs)
	provider_name: z.string().default(DEFAULT_OPTIONS.provider_name),
	
	model_name: z.string().default(DEFAULT_OPTIONS.model_name),
});

// Type for generation options
export type GenerationOptions = z.infer<typeof GenerationOptionsSchema>;

/**
 * Format generation options for API requests
 * This transforms the frontend GenerationOptions to the format expected by the API
 */
export function formatApiOptions(options: GenerationOptions): Record<string, unknown> {
	return {
		model: options.model_name, // API expects 'model' instead of model_name
		temperature: options.temperature,
		max_tokens: options.max_tokens,
		top_p: options.top_p,
		repetition_penalty: options.repetition_penalty,
		global_context: options.global_context,
		context: options.context,
		resize_resolution: options.resize_resolution,
	};
}

/**
 * Format a complete caption request
 * 
 * @param imagePath Path to the image
 * @param perspective Perspective name
 * @param options Generation options
 * @param providerId Provider ID to use with the API
 * @returns Formatted request object
 */
export function formatCaptionRequest(
	imagePath: string,
	perspective: string,
	options: GenerationOptions,
	providerId: string
): {
	image_path: string;
	perspective: string;
	provider_id: string;
	options: Record<string, unknown>;
} {
	return {
		image_path: imagePath,
		perspective: perspective,
		provider_id: providerId,
		options: formatApiOptions(options),
	};
}
