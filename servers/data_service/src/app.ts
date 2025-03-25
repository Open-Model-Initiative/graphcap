// SPDX-License-Identifier: Apache-2.0
/**
 * GraphCap Data Service App
 * 
 * Main Hono application setup with middleware and routes.
 */

import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { apiReference } from '@scalar/hono-api-reference';
import { cors } from 'hono/cors';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';
import { timing } from 'hono/timing';
import { z } from 'zod';

import { batchQueueRoutes } from './api/routes/batch_queue';
import { checkDatabaseConnection } from './db/init';
import { env } from './env';
import { providerRoutes } from './features/providers/routes';
import { logger } from './utils/logger';

// Create OpenAPI Hono app
const app = new OpenAPIHono();

// Add middleware
app.use('*', cors());
app.use('*', prettyJSON());
app.use('*', timing());
app.use('*', secureHeaders());

// Add custom logger middleware
app.use('*', async (c, next) => {
  const { method, url } = c.req;
  logger.info({ method, url }, 'Request received');
  
  const start = Date.now();
  await next();
  const end = Date.now();
  
  const status = c.res.status;
  logger.info({ method, url, status, responseTime: end - start }, 'Request completed');
});

// Health check endpoint
const healthCheckRoute = createRoute({
  method: 'get',
  path: '/health',
  tags: ['System'],
  summary: 'Health check endpoint',
  description: 'Returns the health status of the API',
  responses: {
    200: {
      description: 'API is healthy',
      content: {
        'application/json': {
          schema: z.object({
            status: z.string(),
            service: z.string(),
            version: z.string(),
            timestamp: z.string(),
          }),
        },
      },
    },
  },
});

app.openapi(healthCheckRoute, (c) => {
  return c.json({
    status: 'ok',
    service: 'graphcap-data-service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Database health check endpoint
const dbHealthCheckRoute = createRoute({
  method: 'get',
  path: '/health/db',
  tags: ['System'],
  summary: 'Database health check endpoint',
  description: 'Returns the health status of the database connection',
  responses: {
    200: {
      description: 'Database is healthy',
      content: {
        'application/json': {
          schema: z.object({
            status: z.string(),
            database: z.string(),
            timestamp: z.string(),
          }),
        },
      },
    },
    500: {
      description: 'Database connection failed',
      content: {
        'application/json': {
          schema: z.object({
            status: z.string(),
            error: z.string(),
            timestamp: z.string(),
          }),
        },
      },
    },
  },
});

app.openapi(dbHealthCheckRoute, async (c) => {
  try {
    const isConnected = await checkDatabaseConnection();
    
    if (isConnected) {
      return c.json({
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      });
    } else {
      return c.json({
        status: 'error',
        error: 'Database connection failed',
        timestamp: new Date().toISOString(),
      }, 500);
    }
  } catch (error) {
    return c.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown database error',
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

// API routes with v1 prefix
app.route(`${env.API_PREFIX}/v1/providers`, providerRoutes);
app.route(`${env.API_PREFIX}/v1/perspectives/batch`, batchQueueRoutes);

// OpenAPI documentation
app.doc('openapi', {
  openapi: '3.0.0',
  info: {
    title: 'GraphCap Data Service API',
    version: '1.0.0',
    description: 'API for managing GraphCap provider configurations and batch perspective jobs',
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}`,
      description: 'Local development server',
    },
  ],
});

// API Reference UI (Scalar)
app.get('/docs', apiReference({
  spec: {
    url: '/openapi',
  },
  theme: 'default',
  layout: 'modern',
}));

// Error handling
app.onError((err, c) => {
  logger.error({ err, path: c.req.path }, 'Unhandled error');
  return c.json({ error: 'Internal server error' }, 500);
});

// Export the app
export default app;

// Export app type for client usage
export type AppType = typeof app; 