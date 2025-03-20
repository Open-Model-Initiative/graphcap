// SPDX-License-Identifier: Apache-2.0
/**
 * GraphCap Message Broker App
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

import { messagesRouter } from './api/messages';
import { env } from './env';
import { getChannel } from './services/broker';

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
  console.info(`Request received: ${method} ${url}`);
  
  const start = Date.now();
  await next();
  const end = Date.now();
  
  const status = c.res.status;
  console.info(`Request completed: ${method} ${url} ${status} (${end - start}ms)`);
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
    500: {
      description: 'API is not healthy',
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

app.openapi(healthCheckRoute, async (c) => {
  try {
    // Check RabbitMQ connection
    await getChannel();
    
    return c.json({
      status: 'ok',
      service: 'graphcap-message-broker',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return c.json({
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

// API routes with v1 prefix
app.route(`${env.API_PREFIX}/v1/messages`, messagesRouter);

// OpenAPI documentation
app.doc('openapi', {
  openapi: '3.0.0',
  info: {
    title: 'GraphCap Message Broker API',
    version: '1.0.0',
    description: 'API for managing message queues and exchanges in the GraphCap system',
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
  definition: {
    url: '/openapi',
  },
  theme: 'default',
  layout: 'modern',
}));

// Error handling
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

// Export the app
export default app;

// Export app type for client usage
export type AppType = typeof app; 