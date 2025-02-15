/**
 * @license Apache-2.0
 * 
 * Health check service for server connectivity monitoring
 * 
 * @module HealthService
 * 
 * @exports {function} healthQuery - Query configuration for server health check
 * @exports {type} HealthStatus - Health status response type
 */

import { QueryFunction } from '@tanstack/react-query'
import { API_BASE_URL } from './api'

export interface HealthStatus {
  status: string
  latency?: number
  serverInfo?: {
    version?: string
    environment?: string
    timestamp?: string
  }
  connectionDetails?: {
    endpoint: string
    responseTime: number
    statusCode: number
  }
}



/**
 * Fetches server health status
 * 
 * @returns Health status including latency and connection details
 */
const fetchHealthStatus: QueryFunction<HealthStatus> = async () => {
  const startTime = performance.now()
  const endpoint = `${API_BASE_URL}/health`
  
  console.info(`Checking server health at ${endpoint}`)
  
  try {
    const response = await fetch(endpoint)
    const latency = performance.now() - startTime

    console.debug('Server response received', {
      status: response.status,
      statusText: response.statusText,
      latency: `${Math.round(latency)}ms`,
      headers: Object.fromEntries(response.headers.entries())
    })

    if (!response.ok) {
      const errorMessage = `Health check failed with status: ${response.status} (${response.statusText})`
      console.error(errorMessage)
      throw new Error(errorMessage)
    }

    const data = await response.json()
    
    const healthStatus: HealthStatus = {
      status: data.status,
      latency: Math.round(latency),
      serverInfo: {
        version: data.version,
        environment: data.environment,
        timestamp: new Date().toISOString()
      },
      connectionDetails: {
        endpoint,
        responseTime: Math.round(latency),
        statusCode: response.status
      }
    }

    console.info('Server health check successful', healthStatus)
    return healthStatus

  } catch (error) {
    console.error('Health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      endpoint,
    })
    throw error 
  }
} 

/**
 * Query configuration for server health check
 */
export const healthQuery = {
    queryKey: ['health'],
    queryFn: fetchHealthStatus,
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 2,
  }