// SPDX-License-Identifier: Apache-2.0
/**
 * Schema Field Formatters
 * 
 * Utility functions for formatting schema field values for display and clipboard.
 */

/**
 * Format value for clipboard copying based on its data type
 */
export const formatValueForClipboard = (value: any): string | Record<string, any> => {
  // Handle null or undefined
  if (value === null || value === undefined) {
    return '';
  }

  // Handle arrays of strings - convert to comma-separated string without quotes
  if (Array.isArray(value) && value.every(item => typeof item === 'string')) {
    return value.join(', ');
  }
  
  // Handle arrays of numbers
  if (Array.isArray(value) && value.every(item => typeof item === 'number')) {
    return value.join(', ');
  }
  
  // Handle arrays of objects (nodes)
  if (Array.isArray(value) && 
      value.length > 0 && 
      typeof value[0] === 'object' && 
      'id' in value[0] && 
      'label' in value[0]) {
    return value.map(node => node.label).join(', ');
  }
  
  // Handle arrays of edges
  if (Array.isArray(value) && 
      value.length > 0 && 
      typeof value[0] === 'object' && 
      'source' in value[0] && 
      'target' in value[0]) {
    return value.map(edge => `${edge.source} → ${edge.target}`).join(', ');
  }

  // Handle dates
  if (value instanceof Date) {
    return value.toISOString();
  }
  
  // Handle simple objects
  if (typeof value === 'object' && value !== null) {
    // For generic objects, we still use JSON.stringify
    // This will be handled by the ClipboardButton
    return value;
  }
  
  // Handle primitives
  return String(value);
};

/**
 * Determines if a value is a node object
 */
export const isNode = (val: any): boolean => {
  return (
    typeof val === 'object' &&
    val !== null &&
    'id' in val &&
    'label' in val
  );
};

/**
 * Determines if a value is an edge object
 */
export const isEdge = (val: any): boolean => {
  return (
    typeof val === 'object' &&
    val !== null &&
    'source' in val &&
    'target' in val
  );
};

/**
 * Determines if a value is an array of string tags
 */
export const isTagArray = (val: any): boolean => {
  return (
    Array.isArray(val) &&
    val.every(item => typeof item === 'string')
  );
}; 