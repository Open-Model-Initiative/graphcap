// SPDX-License-Identifier: Apache-2.0
/**
 * Batch Queue Routes
 * 
 * This module defines the API routes for batch job queue management.
 */

import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import * as handlers from '../controllers/batch_queue';
import {
  batchJobCancelResponseSchema,
  batchJobCreateSchema,
  batchJobReorderResponseSchema,
  batchJobReorderSchema,
  batchJobSchema,
  batchJobStatusResponseSchema
} from '../schemas/batch_queue';
import { 

  errorResponse,
} from '../schemas/common';

// Create a new OpenAPI router
const router = new OpenAPIHono();

// Route definitions
const createBatchJobRoute = createRoute({
  method: 'post',
  path: '/create',
  tags: ['Batch Jobs'],
  summary: 'Create a new batch job',
  description: 'Creates a new batch caption job with the specified images and perspectives',
  request: {
    body: {
      content: {
        'application/json': {
          schema: batchJobCreateSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Batch job created successfully',
      content: {
        'application/json': {
          schema: z.object({
            jobId: z.string().uuid(),
            status: z.string(),
            createdAt: z.string(),
            position: z.number(),
          }),
        },
      },
    },
    400: {
      description: 'Invalid request',
      content: {
        'application/json': {
          schema: errorResponse,
        },
      },
    },
    500: {
      description: 'Server error',
      content: {
        'application/json': {
          schema: errorResponse,
        },
      },
    },
  },
});

const listBatchJobsRoute = createRoute({
  method: 'get',
  path: '/list',
  tags: ['Batch Jobs'],
  summary: 'List batch jobs',
  description: 'Returns a paginated list of batch jobs with optional filtering',
  request: {
    query: z.object({
      status: z.string().optional(),
      limit: z.string().optional(),
      offset: z.string().optional(),
      include_archived: z.string().optional(),
    }),
  },
  responses: {
    200: {
      description: 'List of batch jobs',
      content: {
        'application/json': {
          schema: z.object({
            jobs: z.array(batchJobSchema),
            total: z.number(),
            offset: z.number(),
            limit: z.number(),
          }),
        },
      },
    },
    500: {
      description: 'Server error',
      content: {
        'application/json': {
          schema: errorResponse,
        },
      },
    },
  },
});

const getBatchJobStatusRoute = createRoute({
  method: 'get',
  path: '/status/:jobId',
  tags: ['Batch Jobs'],
  summary: 'Get job status',
  description: 'Returns detailed status information for a specific batch job',
  request: {
    params: z.object({
      jobId: z.string().uuid(),
    }),
    query: z.object({
      includeItems: z.string().optional(),
    }),
  },
  responses: {
    200: {
      description: 'Batch job status with optional items',
      content: {
        'application/json': {
          schema: batchJobStatusResponseSchema,
        },
      },
    },
    404: {
      description: 'Job not found',
      content: {
        'application/json': {
          schema: errorResponse,
        },
      },
    },
    500: {
      description: 'Server error',
      content: {
        'application/json': {
          schema: errorResponse,
        },
      },
    },
  },
});

const cancelBatchJobRoute = createRoute({
  method: 'post',
  path: '/cancel/:jobId',
  tags: ['Batch Jobs'],
  summary: 'Cancel job',
  description: 'Cancels a running or pending batch job',
  request: {
    params: z.object({
      jobId: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: 'Batch job cancelled successfully',
      content: {
        'application/json': {
          schema: batchJobCancelResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid request',
      content: {
        'application/json': {
          schema: errorResponse,
        },
      },
    },
    404: {
      description: 'Job not found',
      content: {
        'application/json': {
          schema: errorResponse,
        },
      },
    },
    500: {
      description: 'Server error',
      content: {
        'application/json': {
          schema: errorResponse,
        },
      },
    },
  },
});

const reorderBatchJobsRoute = createRoute({
  method: 'post',
  path: '/reorder',
  tags: ['Batch Jobs'],
  summary: 'Reorder jobs',
  description: 'Changes the priority of jobs in the queue based on the order of job IDs provided',
  request: {
    body: {
      content: {
        'application/json': {
          schema: batchJobReorderSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Batch jobs reordered successfully',
      content: {
        'application/json': {
          schema: batchJobReorderResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid request',
      content: {
        'application/json': {
          schema: errorResponse,
        },
      },
    },
    500: {
      description: 'Server error',
      content: {
        'application/json': {
          schema: errorResponse,
        },
      },
    },
  },
});

// Register routes directly without middleware
router.openapi(createBatchJobRoute, handlers.createBatchJob);
router.openapi(listBatchJobsRoute, handlers.listBatchJobs);
router.openapi(getBatchJobStatusRoute, handlers.getBatchJobStatus);
router.openapi(cancelBatchJobRoute, handlers.cancelBatchJob);
router.openapi(reorderBatchJobsRoute, handlers.reorderBatchJobs);

// Export the router
export const batchQueueRoutes = router; 