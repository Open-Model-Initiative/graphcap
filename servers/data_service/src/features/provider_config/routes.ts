// SPDX-License-Identifier: Apache-2.0
/**
 * Provider Routes
 * 
 * This module defines the API routes for provider management.
 */

import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import { commonResponses, invalidRequestResponse, notFoundResponse, successResponse } from '../../api/schemas/common';
import * as handlers from './controller';
import { providerCreateSchema, providerSchema, providerUpdateSchema } from './schemas';

// Create a new OpenAPI router
const router = new OpenAPIHono();

// Common response schemas
const errorResponse = z.object({ error: z.string() });

// Route definitions
const getAllProvidersRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Providers'],
  summary: 'Get all providers',
  description: 'Returns a list of all configured providers',
  responses: {
    200: {
      description: 'List of providers',
      content: {
        'application/json': {
          schema: z.array(providerSchema),
        },
      },
    },
    ...commonResponses,
  },
});

const getProviderRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Providers'],
  summary: 'Get provider by ID',
  description: 'Returns a specific provider by ID',
  request: {
    params: z.object({
      id: z.string().min(1),
    }),
  },
  responses: {
    200: {
      description: 'Provider details',
      content: {
        'application/json': {
          schema: providerSchema,
        },
      },
    },
    ...notFoundResponse,
    ...commonResponses,
  },
});

const createProviderRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Providers'],
  summary: 'Create a new provider',
  description: 'Creates a new provider configuration',
  request: {
    body: {
      content: {
        'application/json': {
          schema: providerCreateSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Provider created successfully',
      content: {
        'application/json': {
          schema: providerSchema,
        },
      },
    },
    ...invalidRequestResponse,
    ...commonResponses,
  },
});

const updateProviderRoute = createRoute({
  method: 'put',
  path: '/{id}',
  tags: ['Providers'],
  summary: 'Update a provider',
  description: 'Updates an existing provider configuration',
  request: {
    params: z.object({
      id: z.string().min(1),
    }),
    body: {
      content: {
        'application/json': {
          schema: providerUpdateSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Provider updated successfully',
      content: {
        'application/json': {
          schema: providerSchema,
        },
      },
    },
    ...notFoundResponse,
    ...invalidRequestResponse,
    ...commonResponses,
  },
});

const deleteProviderRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  tags: ['Providers'],
  summary: 'Delete a provider',
  description: 'Deletes an existing provider configuration',
  request: {
    params: z.object({
      id: z.string().min(1),
    }),
  },
  responses: {
    200: {
      description: 'Provider deleted successfully',
      content: {
        'application/json': {
          schema: successResponse,
        },
      },
    },
    ...notFoundResponse,
    ...commonResponses,
  },
});

// Register routes with handlers
router.openapi(getAllProvidersRoute, handlers.getProviders);
router.openapi(getProviderRoute, handlers.getProvider);
router.openapi(createProviderRoute, handlers.createProvider);
router.openapi(updateProviderRoute, handlers.updateProvider);
router.openapi(deleteProviderRoute, handlers.deleteProvider);

// Export the router
export const providerRoutes = router; 