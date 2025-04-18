// SPDX-License-Identifier: Apache-2.0
/**
 * Database connection setup
 * 
 * This module initializes the database connection using Drizzle ORM with PostgreSQL.
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from '../env';
import * as schema from '../schema';
import { logger } from '../utils/logger';

// Create a PostgreSQL connection pool with error handling
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  // Add connection pool configuration
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 5000, // How long to wait for a connection to become available
});

// Add event listeners for the pool
pool.on('error', (err) => {
  logger.error({ error: err }, 'Unexpected error on idle database client');
});

pool.on('connect', () => {
  logger.debug('New database connection established');
});

// Initialize Drizzle ORM with the connection pool and schema
export const db = drizzle(pool, { schema });

// Export a function to close the database connection
export const closeDatabase = async () => {
  logger.info('Closing database connection pool');
  await pool.end();
  logger.info('Database connection pool closed');
}; 