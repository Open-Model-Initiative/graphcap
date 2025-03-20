// SPDX-License-Identifier: Apache-2.0
/**
 * Environment Configuration
 * 
 * Type-safe environment variables using Zod.
 */

import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables
config();

// Define environment schema with Zod
const envSchema = z.object({
  // Server configuration
  PORT: z.string().default('32552'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // RabbitMQ configuration
  RABBITMQ_HOST: z.string().default('localhost'),
  RABBITMQ_PORT: z.string().default('5672'),
  RABBITMQ_USERNAME: z.string().default('guest'),
  RABBITMQ_PASSWORD: z.string().default('guest'),
  RABBITMQ_VHOST: z.string().default('/'),
  RABBITMQ_RECONNECT_INTERVAL: z.string().default('5000'),
  RABBITMQ_MAX_RECONNECT_ATTEMPTS: z.string().default('10'),
  
  // API configuration
  API_PREFIX: z.string().default('/api'),
});

// Parse and validate environment variables
export const env = envSchema.parse(process.env);

// Type for environment variables
export type Env = z.infer<typeof envSchema>; 