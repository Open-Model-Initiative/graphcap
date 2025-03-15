// SPDX-License-Identifier: Apache-2.0
/**
 * Environment Configuration
 * 
 * Type-safe environment variables using Zod.
 */

import { z } from 'zod';
import { config } from 'dotenv';

// Load environment variables
config();

// Define environment schema with Zod
const envSchema = z.object({
  // Server configuration
  PORT: z.string().default('32550'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Database configuration
  DATABASE_URL: z.string(),
  
  // Security
  ENCRYPTION_KEY: z.string().min(16),
  
  // API configuration
  API_PREFIX: z.string().default('/api'),
  
  // Provider configuration
  PROVIDER_CONFIG_PATH: z.string().optional(),
  WORKSPACE_PATH: z.string().optional(),
  GRAPHCAP_SERVER_PATH: z.string().optional(),
});

// Parse and validate environment variables
export const env = envSchema.parse(process.env);

// Type for environment variables
export type Env = z.infer<typeof envSchema>; 