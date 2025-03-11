// SPDX-License-Identifier: Apache-2.0
import { pgTable, serial, text, boolean, integer, timestamp } from 'drizzle-orm/pg-core';

/**
 * Providers table schema
 * Stores information about AI model providers like OpenAI, Gemini, etc.
 */
export const providers = pgTable('providers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  kind: text('kind').notNull(), // openai, gemini, etc.
  environment: text('environment').notNull(), // cloud, local
  envVar: text('env_var').notNull(),
  baseUrl: text('base_url').notNull(),
  apiKey: text('api_key'), // Will store encrypted API key
  isEnabled: boolean('is_enabled').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Provider models table schema
 * Stores models associated with each provider
 */
export const providerModels = pgTable('provider_models', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').references(() => providers.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  isEnabled: boolean('is_enabled').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Provider rate limits table schema
 * Stores rate limit configurations for providers
 */
export const providerRateLimits = pgTable('provider_rate_limits', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').references(() => providers.id, { onDelete: 'cascade' }),
  requestsPerMinute: integer('requests_per_minute'),
  tokensPerMinute: integer('tokens_per_minute'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}); 