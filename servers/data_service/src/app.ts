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
import { logTestRoutes } from './api/routes/log_test';
import { checkDatabaseConnection } from './db/init';
import { env } from './env';
import { providerRoutes } from './features/provider_config/routes';
import { errorHandlerMiddleware, notFoundHandler } from './utils/error-handler';
import { logger } from './utils/logger';
import { createDetailedLoggingMiddleware, createPinoLoggerMiddleware } from './utils/pino-middleware';

// Create OpenAPI Hono app
const app = new OpenAPIHono();

// Add error handling middleware first so it can catch errors from other middleware
app.use('*', errorHandlerMiddleware({ logErrors: true }));

// Add middleware
app.use('*', cors());
app.use('*', prettyJSON());
app.use('*', timing());
app.use('*', secureHeaders());

// Add pino logger middleware
app.use('*', createPinoLoggerMiddleware());

// Add detailed logging middleware for API routes
app.use('/api/*', createDetailedLoggingMiddleware());
app.use(`${env.API_PREFIX}/*`, createDetailedLoggingMiddleware());

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

// Add alias for API v1 health endpoint
app.get(`${env.API_PREFIX}/v1/health`, (c) => {
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
app.route(`${env.API_PREFIX}/v1/logs`, logTestRoutes);

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

// Error handling - replace existing onError handler
app.onError((err, c) => {
  // The middleware should handle most errors,
  // but this is a fallback for errors that somehow bypass the middleware
  logger.error({ err, path: c.req.path }, 'Unhandled error in onError handler');
  
  return c.json({
    status: 'error',
    statusCode: 500,
    message: 'Internal server error',
    timestamp: new Date().toISOString(),
    path: c.req.path
  }, 500);
});

// Add not found handler
app.notFound(notFoundHandler);

// Export the app
export default app;

// Export app type for client usage
export type AppType = typeof app; 