// SPDX-License-Identifier: Apache-2.0
/**
 * Server Connections Service
 * 
 * This module provides functions for checking the health of server connections
 * such as the Media Server and GraphCap Server.
 */

import { SERVER_IDS } from '../constants';

/**
 * Interface for health check response
 */
interface HealthCheckResponse {
  status: string;
}

/**
 * Check the health of a server by making a request to its health endpoint
 * 
 * @param url - The base URL of the server
 * @returns A promise that resolves to a boolean indicating if the server is healthy
 */
export async function checkServerHealth(url: string): Promise<boolean> {
  try {
    // Normalize URL by removing trailing slash if present
    const normalizedUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    
    // Make request to health endpoint
    const response = await fetch(`${normalizedUrl}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Set a timeout to prevent long-hanging requests
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) {
      console.error(`Health check failed with status: ${response.status}`);
      return false;
    }
    
    const data = await response.json() as HealthCheckResponse;
    
    // Check if the response contains a valid status
    return data.status === 'ok' || data.status === 'healthy';
  } catch (error) {
    console.error('Error checking server health:', error);
    return false;
  }
}

/**
 * Check the health of the Media Server
 * 
 * @param url - The base URL of the Media Server
 * @returns A promise that resolves to a boolean indicating if the server is healthy
 */
export async function checkMediaServerHealth(url: string): Promise<boolean> {
  return checkServerHealth(url);
}

/**
 * Check the health of the GraphCap Server
 * 
 * @param url - The base URL of the GraphCap Server
 * @returns A promise that resolves to a boolean indicating if the server is healthy
 */
export async function checkGraphCapServerHealth(url: string): Promise<boolean> {
  return checkServerHealth(url);
}

/**
 * Check the health of the Data Service
 * 
 * @param url - The base URL of the Data Service
 * @returns A promise that resolves to a boolean indicating if the server is healthy
 */
export async function checkDataServiceHealth(url: string): Promise<boolean> {
  return checkServerHealth(url);
}

/**
 * Check the health of a server by its ID
 * 
 * @param id - The ID of the server (from SERVER_IDS)
 * @param url - The base URL of the server
 * @returns A promise that resolves to a boolean indicating if the server is healthy
 */
export async function checkServerHealthById(id: string, url: string): Promise<boolean> {
  switch (id) {
    case SERVER_IDS.MEDIA_SERVER:
      return checkMediaServerHealth(url);
    case SERVER_IDS.GRAPHCAP_SERVER:
      return checkGraphCapServerHealth(url);
    case SERVER_IDS.DATA_SERVICE:
      return checkDataServiceHealth(url);
    default:
      console.error(`Unknown server ID: ${id}`);
      return false;
  }
} 