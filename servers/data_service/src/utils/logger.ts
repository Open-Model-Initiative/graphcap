// SPDX-License-Identifier: Apache-2.0
/**
 * Logger Utility
 * 
 * Structured logging with pino.
 */

import pino from 'pino';
import { env } from '../env';

// Define request and response types for serializers
interface PinoRequest {
  method: string;
  url: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}

interface PinoResponse {
  statusCode: number;
  getHeaders?: () => Record<string, string | string[] | number | undefined>;
}

// Configure logger based on environment
const loggerConfig = {
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: env.NODE_ENV !== 'production' 
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          messageFormat: '{msg} {reqId} {req.method} {req.url}',
        },
      } 
    : undefined,
  // Add request ID generation - helps to correlate logs from the same request
  genReqId: (req: PinoRequest) => {
    // If we have an existing ID in headers, use it
    if (req.headers?.['x-request-id']) {
      return req.headers['x-request-id'];
    }
    return crypto.randomUUID();
  },
  // Return request/response serializers - these functions control what gets logged
  serializers: {
    req: (req: PinoRequest) => ({
      method: req.method,
      url: req.url,
      headers: req.headers,
      // Skip body for GET/HEAD requests where there shouldn't be any
      ...(req.method !== 'GET' && req.method !== 'HEAD' && { body: req.body }),
    }),
    res: (res: PinoResponse) => ({
      status: res.statusCode,
      headers: res.getHeaders?.() || {},
    }),
    err: pino.stdSerializers.err,
  },
  // Ensure timestamps are present
  timestamp: pino.stdTimeFunctions.isoTime,
  // Base object included in every log
  base: {
    service: 'graphcap-data-service',
    env: env.NODE_ENV,
  },
};

// Create and export the logger instance
export const logger = pino(loggerConfig); 