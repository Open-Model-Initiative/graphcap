// SPDX-License-Identifier: Apache-2.0
/**
 * Database connection setup
 * 
 * This module initializes the database connection using Drizzle ORM with PostgreSQL.
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize Drizzle ORM with the connection pool and schema
export const db = drizzle(pool, { schema });

// Export a function to close the database connection
export const closeDatabase = async () => {
  await pool.end();
}; 