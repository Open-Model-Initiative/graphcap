// SPDX-License-Identifier: Apache-2.0
/**
 * Base Field Component
 * 
 * Base component for rendering schema fields.
 */

import React from 'react';
import { BaseFieldProps } from './types';

export const BaseField: React.FC<BaseFieldProps> = ({
  field,
  value,
  className = '',
  children
}) => {
  return (
    <div className={`field-container ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-300">
          {field.name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
        </span>
        {field.type && (
          <span className="text-xs px-2 py-0.5 bg-gray-700 rounded-full text-gray-400">
            {field.type}
            {field.is_list && ' []'}
          </span>
        )}
      </div>
      {field.description && (
        <p className="text-xs text-gray-400 mb-2">{field.description}</p>
      )}
      <div className="field-content">
        {children}
      </div>
    </div>
  );
}; 