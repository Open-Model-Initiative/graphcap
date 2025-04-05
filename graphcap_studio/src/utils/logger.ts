// SPDX-License-Identifier: Apache-2.0
/**
 * Logger Utility
 * 
 * Provides safe logging utilities that redact sensitive information and
 * only log in debug mode.
 */

// Check if we're in debug mode - can be set via environment variable or localStorage
const isDebugMode = () => {
  // Check environment variable if available
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
    return true;
  }
  
  // Check localStorage for debug flag
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('debug_mode') === 'true';
  }
  
  return false;
};

/**
 * List of keys that contain sensitive information to redact
 */
const SENSITIVE_KEYS = [
  'api_key',
  'apiKey',
  'api-key',
  'secret',
  'password',
  'token',
  'auth',
  'authorization',
  'key',
  'access_token',
  'refresh_token',
  'private_key',
];

/**
 * Redacts sensitive information from an object
 */
function redactSensitiveInfo(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  // Handle primitive values
  if (typeof obj !== 'object') {
    return obj;
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => redactSensitiveInfo(item));
  }
  
  // Handle objects
  const result: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Check if key contains sensitive info
    const isSensitive = SENSITIVE_KEYS.some(
      (sensitiveKey) => key.toLowerCase().includes(sensitiveKey)
    );
    
    if (isSensitive && typeof value === 'string') {
      // Redact the value if it's sensitive and a string
      result[key] = value.length > 0 ? '[REDACTED]' : '';
    } else if (typeof value === 'object' && value !== null) {
      // Recursively check nested objects
      result[key] = redactSensitiveInfo(value);
    } else {
      // Pass through other values
      result[key] = value;
    }
  }
  
  return result;
}

/**
 * Safe log function that only logs in debug mode and redacts sensitive information
 */
export function debugLog(componentName: string, message: string, ...args: unknown[]): void {
  if (!isDebugMode()) {
    return;
  }

  // Redact sensitive information from all args
  const safeArgs = args.map((arg) => redactSensitiveInfo(arg));
  
  // Use the component name as a prefix
  console.log(`[${componentName}] ${message}`, ...safeArgs);
}

/**
 * Log warning messages with component prefix
 */
export function debugWarn(componentName: string, message: string, ...args: unknown[]): void {
  if (!isDebugMode()) {
    return;
  }

  // Redact sensitive information from all args
  const safeArgs = args.map((arg) => redactSensitiveInfo(arg));
  
  // Use the component name as a prefix
  console.warn(`[${componentName}] ${message}`, ...safeArgs);
}

/**
 * Log error messages with component prefix
 */
export function debugError(componentName: string, message: string, ...args: unknown[]): void {
  if (!isDebugMode()) {
    return;
  }

  // Redact sensitive information from all args
  const safeArgs = args.map((arg) => redactSensitiveInfo(arg));
  
  // Use the component name as a prefix
  console.error(`[${componentName}] ${message}`, ...safeArgs);
}

/**
 * Enable debug mode in localStorage
 */
export function enableDebugMode(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('debug_mode', 'true');
  }
}

/**
 * Disable debug mode in localStorage
 */
export function disableDebugMode(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('debug_mode', 'false');
  }
}

/**
 * Check if debug mode is enabled
 */
export function getDebugModeStatus(): boolean {
  return isDebugMode();
} 