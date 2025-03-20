/**
 * Health check API for monitoring
 */

import { Hono } from 'hono';
import { getChannel } from '../services/broker';

// Create a router for health checks
const app = new Hono();

/**
 * Simple health check endpoint
 * GET /health
 */
app.get('/', async (c) => {
  try {
    // Check RabbitMQ connection
    await getChannel();
    
    return c.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'graphcap_message_broker',
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return c.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'graphcap_message_broker',
      error: error instanceof Error ? error.message : String(error),
    }, 500);
  }
});

export default app; 