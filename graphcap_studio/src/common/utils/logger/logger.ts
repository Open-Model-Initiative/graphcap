// SPDX-License-Identifier: Apache-2.0
/**
 * Logger Utility
 * 
 * This module provides standardized logging functions for the frontend application.
 * It supports different log levels and formatting options.
 */

// Define log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

// Logger configuration
interface LoggerConfig {
  minLevel: LogLevel;
  enableTimestamps: boolean;
  enableModuleName: boolean;
}

// Default configuration
const defaultConfig: LoggerConfig = {
  minLevel: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  enableTimestamps: true,
  enableModuleName: true
};

// Current configuration
let currentConfig: LoggerConfig = { ...defaultConfig };

/**
 * Configure the logger
 * 
 * @param config - Logger configuration options
 */
export function configureLogger(config: Partial<LoggerConfig>): void {
  currentConfig = { ...currentConfig, ...config };
}

/**
 * Format a log message with optional timestamp and module name
 * 
 * @param level - Log level
 * @param moduleName - Name of the module
 * @param message - Log message
 * @returns Formatted log message
 */
function formatLogMessage(level: LogLevel, moduleName: string, message: string): string {
  const parts: string[] = [];
  
  if (currentConfig.enableTimestamps) {
    parts.push(`${new Date().toISOString()}`);
  }
  
  parts.push(`[${level}]`);
  
  if (currentConfig.enableModuleName && moduleName) {
    parts.push(`[${moduleName}]`);
  }
  
  parts.push(message);
  
  return parts.join(' ');
}

/**
 * Check if a log level should be displayed
 * 
 * @param level - Log level to check
 * @returns Whether the log level should be displayed
 */
function shouldLog(level: LogLevel): boolean {
  const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
  const currentLevelIndex = levels.indexOf(currentConfig.minLevel);
  const targetLevelIndex = levels.indexOf(level);
  
  return targetLevelIndex >= currentLevelIndex;
}

/**
 * Create a logger instance for a specific module
 * 
 * @param moduleName - Name of the module
 * @returns Logger instance
 */
export function createLogger(moduleName: string) {
  return {
    /**
     * Log a debug message
     * 
     * @param message - Log message
     * @param data - Optional data to include
     */
    debug(message: string, data?: unknown): void {
      if (shouldLog(LogLevel.DEBUG)) {
        const formattedMessage = formatLogMessage(LogLevel.DEBUG, moduleName, message);
        console.debug(formattedMessage, data !== undefined ? data : '');
      }
    },
    
    /**
     * Log an info message
     * 
     * @param message - Log message
     * @param data - Optional data to include
     */
    info(message: string, data?: unknown): void {
      if (shouldLog(LogLevel.INFO)) {
        const formattedMessage = formatLogMessage(LogLevel.INFO, moduleName, message);
        console.info(formattedMessage, data !== undefined ? data : '');
      }
    },
    
    /**
     * Log a warning message
     * 
     * @param message - Log message
     * @param data - Optional data to include
     */
    warn(message: string, data?: unknown): void {
      if (shouldLog(LogLevel.WARN)) {
        const formattedMessage = formatLogMessage(LogLevel.WARN, moduleName, message);
        console.warn(formattedMessage, data !== undefined ? data : '');
      }
    },
    
    /**
     * Log an error message
     * 
     * @param message - Log message
     * @param error - Optional error object or data
     */
    error(message: string, error?: unknown): void {
      if (shouldLog(LogLevel.ERROR)) {
        const formattedMessage = formatLogMessage(LogLevel.ERROR, moduleName, message);
        console.error(formattedMessage);
        
        if (error !== undefined) {
          if (error instanceof Error) {
            console.error(error.message);
            console.error(error.stack);
          } else {
            console.error(error);
          }
        }
      }
    }
  };
}

// Export a default logger for quick use
export const logger = createLogger('App'); 