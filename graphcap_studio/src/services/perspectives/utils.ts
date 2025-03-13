// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Service Utilities
 * 
 * This module provides utility functions for the perspectives service.
 */

import { SERVER_IDS } from '@/common/constants';
import { ServerConnection } from './types';
import { DEFAULTS } from './constants';

/**
 * Get the GraphCap Server URL from server connections context
 */
export function getGraphCapServerUrl(connections: ServerConnection[]): string {
  const graphcapServerConnection = connections.find(
    conn => conn.id === SERVER_IDS.GRAPHCAP_SERVER
  );
  
  return graphcapServerConnection?.url || import.meta.env.VITE_GRAPHCAP_SERVER_URL || DEFAULTS.SERVER_URL;
}

/**
 * Ensure path starts with /workspace if it doesn't already
 */
export function ensureWorkspacePath(path: string): string {
  // If path already starts with /workspace, return it as is
  if (path.startsWith('/workspace/')) {
    return path;
  }
  
  // If path starts with /datasets, replace with /workspace/datasets
  if (path.startsWith('/datasets/')) {
    return `/workspace${path}`;
  }
  
  // If path doesn't start with /, add it
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Add /workspace prefix if not already present
  return `/workspace${normalizedPath}`;
}

/**
 * Check if a path is a URL
 */
export function isUrl(path: string): boolean {
  return path.startsWith('http://') || path.startsWith('https://');
}

/**
 * Handle API error responses
 */
export async function handleApiError(response: Response, defaultMessage: string): Promise<never> {
  let errorMessage = `${defaultMessage}: ${response.status}`;
  
  try {
    const errorData = await response.json();
    errorMessage = errorData.detail || errorMessage;
  } catch (e) {
    // If we can't parse the error as JSON, use the status text
    errorMessage = `${defaultMessage}: ${response.statusText}`;
  }
  
  throw new Error(errorMessage);
} 