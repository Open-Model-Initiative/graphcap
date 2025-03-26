// SPDX-License-Identifier: Apache-2.0
/**
 * Log Test Routes
 * 
 * Test routes to demonstrate the usage of the pino logger.
 */

import { Hono } from 'hono';

// Create a new router instance
const router = new Hono();

// Test route that uses the logger
router.get('/', (c) => {
  // Get the pino logger instance from context
  const { logger } = c.var;

  // Log at different levels
  logger.trace('This is a trace message');
  logger.debug('This is a debug message');
  logger.info('This is an info message');
  logger.warn('This is a warning message');

  // Log objects
  logger.info({ user: { id: 1, name: 'test user' } }, 'User info');

  // Log with additional context
  logger.assign({ requestId: 'test-123' });
  logger.info('Message with request ID');

  // Set a response message
  logger.setResMessage('Log test successful');

  // Return a basic response
  return c.json({
    message: 'Logger test route',
    levels: ['trace', 'debug', 'info', 'warn', 'error', 'fatal'],
    time: new Date().toISOString()
  });
});

// Add a route that triggers an error
router.get('/error', (c) => {
  const { logger } = c.var;
  
  try {
    // Simulate an error
    throw new Error('Test error for logging');
  } catch (error) {
    // Log the error
    logger.error({ error }, 'An error occurred');
    
    // Return an error response
    return c.json({
      status: 'error',
      message: 'Test error triggered',
      time: new Date().toISOString()
    }, 500);
  }
});

// Export the router
export const logTestRoutes = router; 