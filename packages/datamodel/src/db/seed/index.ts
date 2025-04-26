// SPDX-License-Identifier: Apache-2.0
/**
 * Database Seed Entrypoint
 * 
 * This script orchestrates the seeding of all data into the database.
 * Add new seed operations here in the desired order.
 */

import { logger } from '@graphcap/lib';
import { seedProviders } from '../features/provider_config/seed_providers';

/**
 * Main seed function that orchestrates all seeding operations
 */
async function seed() {
  try {
    logger.info('Starting database seeding...');

    // Add all seed operations here in the desired order
    await seedProviders();
    
    // Add more seed operations here as needed:
    // await seedOtherData();
    // await seedMoreData();
    
    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error('Database seeding failed:', error);
    process.exit(1);
  }
}

// Execute seed function when run directly
if (import.meta.main) {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
} 