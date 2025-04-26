// SPDX-License-Identifier: Apache-2.0
/**
 * Database initialization
 * 
 * This module provides functions to initialize the database and check its health.
 */

import { logger } from '@graphcap/lib';
import { sql } from 'drizzle-orm';
import { dbClient } from './index';

/**
 * Check database connection
 * 
 * @returns Promise<boolean> True if connection is successful, false otherwise
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    // Execute a simple query to check if the database is accessible
    await dbClient.execute(sql`SELECT 1 as connected`);
    // If we get here without an error, the connection is successful
    return true;
  } catch (error) {
    logger.error({ error }, 'Database connection check failed');
    return false;
  }
}

/**
 * Initialize database
 * 
 * This function checks the database connection and logs the status.
 * It can be extended to perform other initialization tasks as needed.
 */
export async function initializeDatabase(): Promise<void> {
  try {
    logger.info('Initializing database connection');
    
    const isConnected = await checkDatabaseConnection();
    
    if (isConnected) {
      logger.info('Database connection successful');
    } else {
      logger.error('Database connection failed');
      throw new Error('Could not connect to database');
    }
  } catch (error) {
    logger.error({ error }, 'Database initialization failed');
    throw error;
  }
} 