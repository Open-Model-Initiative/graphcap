// SPDX-License-Identifier: Apache-2.0
/**
 * Provider Seed Script
 * 
 * This script seeds the database with predefined provider configurations.
 */

import { db } from '../index';
import { providers, providerModels} from '../schema';
import { eq } from 'drizzle-orm';
import { logger } from '../../utils/logger';

// Define interfaces for provider configurations
interface RateLimits {
  requests_per_minute: number;
  tokens_per_minute: number;
}

interface BaseProviderConfig {
  kind: string;
  environment: string;
  env_var: string;
  base_url: string;
}

interface ProviderWithModels extends BaseProviderConfig {
  models: string[];
  rate_limits?: RateLimits;
}

interface ProviderWithFetchModels extends BaseProviderConfig {
  fetch_models: boolean;
}

type ProviderConfig = ProviderWithModels | ProviderWithFetchModels;

interface ProviderConfigs {
  [key: string]: ProviderConfig;
}

/**
 * Seeds the database with predefined provider data
 */
export async function seedProviders() {
  try {
    logger.info('Starting provider seeding...');
    
    // Predefined provider configurations based on the example TOML
    const providerConfigs: ProviderConfigs = {
      "openai": {
        kind: "openai",
        environment: "cloud",
        env_var: "OPENAI_API_KEY",
        base_url: "https://api.openai.com/v1",
        models: [
          "gpt-4o-mini",
          "gpt-4o",
        ]
      },
      "gemini": {
        kind: "gemini",
        environment: "cloud",
        env_var: "GOOGLE_API_KEY",
        base_url: "https://generativelanguage.googleapis.com/v1beta",
        models: [
          "gemini-2.0-flash-exp",
        ],
        rate_limits: {
          requests_per_minute: 10,
          tokens_per_minute: 4000000
        }
      },
      "openrouter": {
        kind: "openrouter",
        environment: "cloud",
        env_var: "OPENROUTER_API_KEY",
        base_url: "https://openrouter.ai/api/v1",
        models: [
          "minimax/minimax-01",
          "qwen/qvq-72b-preview",
          "qwen/qvq-32b-preview",
          "qwen/qvq-1.5b-preview",
          "google/gemini-2.0-flash-exp:free",
          "mistralai/pixtral-large-2411",
          "meta-llama/llama-3.2-90b-vision-instruct:free",
          "qwen/qwen-2-vl-72b-instruct"
        ]
      },
      "ollama": {
        kind: "ollama",
        environment: "local",
        env_var: "CUSTOM_PROVIDER_1_KEY",
        base_url: "http://localhost:11434",
        fetch_models: true
      }
    };

    // Process each provider
    for (const [name, providerConfig] of Object.entries(providerConfigs)) {
      logger.info(`Processing provider: ${name}`);
      
      // Check if provider already exists
      const existingProvider = await db.query.providers.findFirst({
        where: eq(providers.name, name)
      });
      
      if (existingProvider) {
        logger.info(`Provider ${name} already exists, skipping...`);
        continue;
      }
      
      // Insert provider
      const [insertedProvider] = await db.insert(providers).values({
        name,
        kind: providerConfig.kind,
        environment: providerConfig.environment,
        envVar: providerConfig.env_var,
        baseUrl: providerConfig.base_url,
        isEnabled: true
      }).returning();
      
      logger.info(`Inserted provider: ${name} with ID: ${insertedProvider.id}`);
      
      // Insert models if provided
      if ('models' in providerConfig && Array.isArray(providerConfig.models)) {
        for (const modelName of providerConfig.models) {
          await db.insert(providerModels).values({
            providerId: insertedProvider.id,
            name: modelName,
            isEnabled: true
          });
          logger.info(`Inserted model: ${modelName} for provider: ${name}`);
        }
      }
    }
  } catch (error) {
    logger.error('Error seeding providers:', error);
  }
}