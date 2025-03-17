// SPDX-License-Identifier: Apache-2.0
/**
 * Generation Options Schema
 * 
 * This module defines the validation schema for caption generation options.
 */

import { z } from 'zod';

// Configuration for option min/max values and steps
export const OPTION_CONFIGS = {
  temperature: { min: 0, max: 1, step: 0.1, precision: 1 },
  max_tokens: { min: 1, max: 8192, step: 1, precision: 0 },
  top_p: { min: 0, max: 1, step: 0.05, precision: 2 },
  repetition_penalty: { min: 1, max: 2, step: 0.1, precision: 1 },
  global_context: { min: 0, max: 0, step: 0, precision: 0 }
} as const;

// Default options for caption generation
export const DEFAULT_OPTIONS = {
  temperature: 0.7,
  max_tokens: 4096,
  top_p: 0.95,
  repetition_penalty: 1.1,
  global_context: "You are a visual captioning perspective."
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
    
  global_context: z
    .string()
    .default(DEFAULT_OPTIONS.global_context)
});

// Type for generation options
export type GenerationOptions = z.infer<typeof GenerationOptionsSchema>; 