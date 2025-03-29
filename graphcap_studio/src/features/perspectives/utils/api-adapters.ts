// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives API Adapters
 *
 * This module provides adapter functions for converting between API and application
 * types for the perspectives feature, including caption request formatting.
 */

import type { GenerationOptions } from "@/types/generation-option-types";
import { formatApiOptions } from "@/types/generation-option-types";
import type { Provider } from "@/types/provider-config-types";
import { denormalizeProviderId } from "@/types/provider-config-types";

// Legacy caption options interface for migration purposes
interface LegacyCaptionOptions {
  model: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  repetition_penalty?: number;
  global_context?: string;
  context?: string[];
  resize?: boolean;
  resize_resolution?: string;
}

/**
 * Format a caption generation request
 * Converts from application types to the API request format
 */
export function formatCaptionRequest(
  imagePath: string,
  perspective: string,
  provider: Provider,
  options: GenerationOptions
): {
  image_path: string;
  perspective: string;
  provider_id: number;
  options: Record<string, unknown>;
} {
  return {
    image_path: imagePath,
    perspective,
    provider_id: denormalizeProviderId(provider.id),
    options: formatApiOptions(options)
  };
}

/**
 * Convert from CaptionOptions format to GenerationOptions format
 * Used during the migration from CaptionOptions to GenerationOptions
 */
export function legacyCaptionToGenerationOptions(
  captionOptions: LegacyCaptionOptions,
  providerId: string
): GenerationOptions {
  return {
    model_id: captionOptions.model,
    max_tokens: captionOptions.max_tokens ?? 4096,
    temperature: captionOptions.temperature ?? 0.7,
    top_p: captionOptions.top_p ?? 0.95,
    repetition_penalty: captionOptions.repetition_penalty ?? 1.1,
    global_context: captionOptions.global_context ?? "You are a visual captioning perspective.",
    context: captionOptions.context ?? [],
    resize_resolution: captionOptions.resize_resolution ?? "NONE",
    provider_id: providerId
  };
}

// Interface for perspective data structure
interface PerspectiveDataWithOptions {
  model: string;
  provider: string;
  options?: LegacyCaptionOptions;
}

/**
 * Convert from PerspectiveData to GenerationOptions format
 * Used for loading saved perspective settings
 */
export function perspectiveDataToGenerationOptions(
  perspectiveData: PerspectiveDataWithOptions,
  providerIdMap: Record<string, string>
): GenerationOptions {
  // If we have structured options, use those
  if (perspectiveData.options) {
    return legacyCaptionToGenerationOptions(
      perspectiveData.options,
      providerIdMap[perspectiveData.provider] || ""
    );
  }
  
  // Otherwise create minimal options
  return {
    model_id: perspectiveData.model,
    provider_id: providerIdMap[perspectiveData.provider] || "",
    max_tokens: 4096,
    temperature: 0.7,
    top_p: 0.95,
    repetition_penalty: 1.1,
    global_context: "You are a visual captioning perspective.",
    context: [],
    resize_resolution: "NONE"
  };
} 