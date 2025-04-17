// SPDX-License-Identifier: Apache-2.0
/**
 * Error Handler
 * 
 * Utilities for handling and formatting errors in the client application.
 */

// Import from our custom toast utility
import { toast } from './toast';

interface ServerErrorResponse {
  status?: string;
  statusCode?: number;
  message?: string;
  timestamp?: string;
  path?: string;
  details?: unknown;
  validationErrors?: Record<string, string[]>;
}

/**
 * Extracts a message from a validation error object
 */
function extractValidationErrorMessage(validationErrors: Record<string, string[]>): string | null {
  const validationMessages: string[] = [];
  
  for (const [field, errors] of Object.entries(validationErrors)) {
    for (const errorMsg of errors) {
      validationMessages.push(`${field}: ${errorMsg}`);
    }
  }
  
  if (validationMessages.length > 0) {
    return `Validation errors:\n${validationMessages.join('\n')}`;
  }
  
  return null;
}

/**
 * Extracts message from a server error object
 */
function extractServerErrorMessage(serverError: ServerErrorResponse): string | null {
  // If there's a message, use it
  if (serverError.message) {
    return serverError.message;
  }
  
  // If there are validation errors, format them
  if (serverError.validationErrors) {
    return extractValidationErrorMessage(serverError.validationErrors);
  }
  
  // If there's an error property with a message (common in Axios errors)
  if ('error' in serverError && typeof serverError.error === 'string') {
    return serverError.error;
  }
  
  return null;
}

/**
 * Formats a server error response into a human-readable message
 */
export function formatServerError(error: unknown): string {
  // If it's already a string, just return it
  if (typeof error === 'string') {
    return error;
  }
  
  // Try to handle server error response
  if (error && typeof error === 'object') {
    const serverError = error as ServerErrorResponse;
    const message = extractServerErrorMessage(serverError);
    if (message) {
      return message;
    }
  }
  
  // Fallback for Error instances
  if (error instanceof Error) {
    return error.message;
  }
  
  // Last resort
  return 'An unknown error occurred';
}

/**
 * Shows a toast notification for server errors
 */
export function showServerError(error: unknown, title = 'Error'): void {
  const message = formatServerError(error);
  toast.error({ title, description: message });
}

/**
 * Helper to extract validation errors from server responses
 */
export function getValidationErrors(error: unknown): Record<string, string> | null {
  if (!error || typeof error !== 'object') {
    return null;
  }
  
  const serverError = error as ServerErrorResponse;
  
  if (!serverError.validationErrors) {
    return null;
  }
  
  const formattedErrors: Record<string, string> = {};
  
  for (const [field, errors] of Object.entries(serverError.validationErrors)) {
    if (errors && errors.length > 0) {
      formattedErrors[field] = errors[0];
    }
  }
  
  return Object.keys(formattedErrors).length > 0 ? formattedErrors : null;
}

/**
 * Handles common query/mutation errors
 */
export function handleApiError(error: unknown): void {
  showServerError(error);
  console.error('API error:', error);
} 