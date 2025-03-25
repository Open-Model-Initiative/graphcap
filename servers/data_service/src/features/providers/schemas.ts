// SPDX-License-Identifier: Apache-2.0
/**
 * Provider Schemas
 * 
 * Zod schemas for provider-related data validation.
 */

import { z } from 'zod';

// Base provider schema
export const providerSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Name is required'),
  kind: z.string().min(1, 'Kind is required'),
  environment: z.enum(['cloud', 'local']),
  envVar: z.string().min(1, 'Environment variable name is required'),
  baseUrl: z.string().url('Must be a valid URL'),
  apiKey: z.string().optional(),
  isEnabled: z.boolean().default(true),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  models: z.array(
    z.object({
      id: z.number(),
      providerId: z.number(),
      name: z.string().min(1, 'Model name is required'),
      isEnabled: z.boolean().default(true),
      createdAt: z.string().or(z.date()),
      updatedAt: z.string().or(z.date()),
    })
  ).optional(),
  rateLimits: z.object({
    id: z.number(),
    providerId: z.number(),
    requestsPerMinute: z.number().optional(),
    tokensPerMinute: z.number().optional(),
    createdAt: z.string().or(z.date()),
    updatedAt: z.string().or(z.date()),
  }).optional(),
});

// Schema for creating a new provider
export const providerCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  kind: z.string().min(1, 'Kind is required'),
  environment: z.enum(['cloud', 'local']),
  envVar: z.string().min(1, 'Environment variable name is required'),
  baseUrl: z.string().url('Must be a valid URL'),
  apiKey: z.string().optional(),
  isEnabled: z.boolean().default(true),
  models: z.array(
    z.object({
      name: z.string().min(1, 'Model name is required'),
      isEnabled: z.boolean().default(true),
    })
  ).optional(),
  rateLimits: z.object({
    requestsPerMinute: z.number().optional(),
    tokensPerMinute: z.number().optional(),
  }).optional(),
});

// Schema for updating an existing provider
export const providerUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  kind: z.string().min(1, 'Kind is required').optional(),
  environment: z.enum(['cloud', 'local']).optional(),
  envVar: z.string().min(1, 'Environment variable name is required').optional(),
  baseUrl: z.string().url('Must be a valid URL').optional(),
  isEnabled: z.boolean().optional(),
  models: z.array(
    z.object({
      id: z.number().optional(),
      name: z.string().min(1, 'Model name is required'),
      isEnabled: z.boolean().default(true),
    })
  ).optional(),
  rateLimits: z.object({
    requestsPerMinute: z.number().optional(),
    tokensPerMinute: z.number().optional(),
  }).optional(),
});

// Schema for updating a provider's API key
export const providerApiKeySchema = z.object({
  apiKey: z.string()
    .min(1, { message: 'API key is required and cannot be empty' })
    .refine(val => val.trim() !== '', {
      message: 'API key cannot be just whitespace'
    }),
});

// Export types
export type Provider = z.infer<typeof providerSchema>;
export type ProviderCreate = z.infer<typeof providerCreateSchema>;
export type ProviderUpdate = z.infer<typeof providerUpdateSchema>;
export type ProviderApiKey = z.infer<typeof providerApiKeySchema>; 