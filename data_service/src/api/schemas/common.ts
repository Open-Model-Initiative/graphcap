// SPDX-License-Identifier: Apache-2.0
/**
 * Common API Schemas
 * 
 * This module contains common response schemas and definitions used across API routes.
 */

import { z } from 'zod';

// Common response schemas
export const errorResponse = z.object({ error: z.string() });
export type ErrorResponse = z.infer<typeof errorResponse>;

export const successResponse = z.object({ 
  success: z.boolean(), 
  message: z.string() 
});
export type SuccessResponse = z.infer<typeof successResponse>;

// Common response definitions
export const commonResponses = {
  500: {
    description: 'Server error',
    content: {
      'application/json': {
        schema: errorResponse,
      },
    },
  },
} as const;

export const notFoundResponse = {
  404: {
    description: 'Resource not found',
    content: {
      'application/json': {
        schema: errorResponse,
      },
    },
  },
} as const;

export const invalidRequestResponse = {
  400: {
    description: 'Invalid request',
    content: {
      'application/json': {
        schema: errorResponse,
      },
    },
  },
} as const;

// Common status codes
export const StatusCodes = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
} as const; 