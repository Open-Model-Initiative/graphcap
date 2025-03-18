import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

export default defineConfig({
  out: './src/db/migrations',
  schema: './src/db/schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },
  verbose: true,
  strict: true,
  tablesFilter: ['providers*', 'provider_*'],
  schemaFilter: 'public',
  migrations: {
    prefix: 'timestamp',
    table: '__drizzle_migrations__',
    schema: 'public'
  }
}); 