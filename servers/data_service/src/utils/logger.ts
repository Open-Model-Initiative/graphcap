// SPDX-License-Identifier: Apache-2.0
/**
 * Logger Utility
 * 
 * Structured logging with pino.
 */

import pino from 'pino';
import { env } from '../env';

// Configure logger based on environment
const loggerConfig = {
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: env.NODE_ENV !== 'production' 
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
        },
      } 
    : undefined,
};

// Create and export the logger instance
export const logger = pino(loggerConfig); 