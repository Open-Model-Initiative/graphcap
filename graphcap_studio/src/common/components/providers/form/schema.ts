// SPDX-License-Identifier: Apache-2.0
import { z } from 'zod';

/**
 * Schema for rate limits validation
 */
export const rateLimitsSchema = z.object({
  requestsPerMinute: z.number().min(0).default(0),
  tokensPerMinute: z.number().min(0).default(0)
});

/**
 * Schema for provider form validation
 */
export const providerFormSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  kind: z.string().min(1, { message: 'Kind is required' }),
  environment: z.enum(['cloud', 'local'] as const),
  baseUrl: z.string().url({ message: 'Please enter a valid URL' }),
  envVar: z.string().min(1, { message: 'Environment variable is required' }),
  isEnabled: z.boolean().default(true),
  rateLimits: rateLimitsSchema.default({
    requestsPerMinute: 0,
    tokensPerMinute: 0
  })
});

/**
 * Type for provider form data
 */
export type ProviderFormData = z.infer<typeof providerFormSchema>;

/**
 * Schema for model selection
 */
export const modelSelectionSchema = z.object({
  name: z.string().min(1, { message: 'Provider name is required' }),
  modelId: z.string().min(1, { message: 'Model ID is required' })
});

/**
 * Type for model selection data
 */
export type ModelSelectionData = z.infer<typeof modelSelectionSchema>; 