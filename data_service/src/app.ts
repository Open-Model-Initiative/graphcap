// SPDX-License-Identifier: Apache-2.0
/**
 * GraphCap Data Service App
 * 
 * Main Hono application setup with middleware and routes.
 */

import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { prettyJSON } from 'hono/pretty-json';
import { timing } from 'hono/timing';
import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import { apiReference } from '@scalar/hono-api-reference';

import { env } from './env';
import { logger } from './utils/logger';
import { providerRoutes } from './api/routes/providers';

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

// API routes
app.route(`${env.API_PREFIX}/providers`, providerRoutes);

// OpenAPI documentation
app.doc('openapi', {
  openapi: '3.0.0',
  info: {
    title: 'GraphCap Data Service API',
    version: '1.0.0',
    description: 'API for managing GraphCap provider configurations',
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