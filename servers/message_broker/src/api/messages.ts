/**
 * Message API endpoints for publishing and consuming messages
 */

import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import { QUEUES } from '../models/message';
import { 
  acknowledgeMessage, 
  getMessage, 
  publishMessage, 
  rejectMessage 
} from '../services/messages';

// Create validation schemas
const publishSchema = z.object({
  queue: z.string().min(1),
  message: z.record(z.unknown())
});

const ackSchema = z.object({
  deliveryTag: z.number().int().positive()
});

const rejectSchema = z.object({
  deliveryTag: z.number().int().positive(),
  requeue: z.boolean().optional()
});

// Create a router for messages
export const messagesRouter = new OpenAPIHono();

// Publish message route
const publishRoute = createRoute({
  method: 'post',
  path: '/publish',
  tags: ['Messages'],
  summary: 'Publish a message to a queue',
  description: 'Publishes a message to the specified queue',
  request: {
    body: {
      content: {
        'application/json': {
          schema: publishSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Message published successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            messageId: z.string(),
          }),
        },
      },
    },
    400: {
      description: 'Invalid request',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            error: z.string(),
          }),
        },
      },
    },
    500: {
      description: 'Server error',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            error: z.string(),
          }),
        },
      },
    },
  },
});

messagesRouter.openapi(publishRoute, async (c) => {
  try {
    const { queue, message } = c.req.valid('json');
    
    // Ensure the queue exists
    if (!(Object.values(QUEUES).includes(queue))) {
      return c.json({ 
        success: false, 
        error: `Invalid queue: ${queue}. Valid queues are: ${Object.values(QUEUES).join(', ')}` 
      }, 400);
    }
    
    const messageId = await publishMessage(queue, message);
    
    return c.json({ 
      success: true, 
      messageId 
    }, 201);
  } catch (error) {
    console.error('Error publishing message:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});

// Get message route
const getMessageRoute = createRoute({
  method: 'get',
  path: '/get/{queue}',
  tags: ['Messages'],
  summary: 'Get a message from a queue',
  description: 'Retrieves a message from the specified queue',
  request: {
    params: z.object({
      queue: z.string().min(1)
    }),
    query: z.object({
      autoAck: z.string().optional()
    }),
  },
  responses: {
    200: {
      description: 'Message retrieved successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.any()
          }),
        },
      },
    },
    204: {
      description: 'No messages available',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.null()
          }),
        },
      },
    },
    400: {
      description: 'Invalid request',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            error: z.string()
          }),
        },
      },
    },
    500: {
      description: 'Server error',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            error: z.string()
          }),
        },
      },
    },
  },
});

messagesRouter.openapi(getMessageRoute, async (c) => {
  try {
    const queue = c.req.param('queue');
    const autoAck = c.req.query('autoAck') === 'true';
    
    // Ensure the queue exists
    if (!(Object.values(QUEUES).includes(queue))) {
      return c.json({ 
        success: false, 
        error: `Invalid queue: ${queue}. Valid queues are: ${Object.values(QUEUES).join(', ')}` 
      }, 400);
    }
    
    const message = await getMessage(queue, autoAck);
    
    if (!message) {
      return c.json({ 
        success: true, 
        message: null 
      }, 204);
    }
    
    return c.json({ 
      success: true, 
      message 
    });
  } catch (error) {
    console.error('Error getting message:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});

// Acknowledge message route
const ackRoute = createRoute({
  method: 'post',
  path: '/ack',
  tags: ['Messages'],
  summary: 'Acknowledge a message',
  description: 'Acknowledges a message has been processed successfully',
  request: {
    body: {
      content: {
        'application/json': {
          schema: ackSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Message acknowledged successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
          }),
        },
      },
    },
    500: {
      description: 'Server error',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            error: z.string(),
          }),
        },
      },
    },
  },
});

messagesRouter.openapi(ackRoute, async (c) => {
  try {
    const { deliveryTag } = c.req.valid('json');
    
    await acknowledgeMessage(deliveryTag);
    
    return c.json({ 
      success: true 
    });
  } catch (error) {
    console.error('Error acknowledging message:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});

// Reject message route
const rejectRoute = createRoute({
  method: 'post',
  path: '/reject',
  tags: ['Messages'],
  summary: 'Reject a message',
  description: 'Rejects a message, optionally requeuing it',
  request: {
    body: {
      content: {
        'application/json': {
          schema: rejectSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Message rejected successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
          }),
        },
      },
    },
    500: {
      description: 'Server error',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            error: z.string(),
          }),
        },
      },
    },
  },
});

messagesRouter.openapi(rejectRoute, async (c) => {
  try {
    const { deliveryTag, requeue = true } = c.req.valid('json');
    
    await rejectMessage(deliveryTag, requeue);
    
    return c.json({ 
      success: true 
    });
  } catch (error) {
    console.error('Error rejecting message:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
}); 