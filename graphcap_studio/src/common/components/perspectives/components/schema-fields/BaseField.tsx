// SPDX-License-Identifier: Apache-2.0
/**
 * Base Field Component
 * 
 * Base component for rendering schema fields.
 */

import React from 'react';
import { BaseFieldProps } from './types';
import { useClipboard } from '@/common/hooks/useClipboard';

export const BaseField: React.FC<BaseFieldProps> = ({
  field,
  value,
  className = '',
  children
}) => {
  const { copyToClipboard, hasCopied } = useClipboard();

  const handleCopy = () => {
    const textValue = typeof value === 'string' 
      ? value 
      : JSON.stringify(value, null, 2);
    copyToClipboard(textValue);
  };

  return (
    <div className={`field-container ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-300">
            {field.name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </span>
          <button
            onClick={handleCopy}
            className="p-1 rounded-md hover:bg-gray-700 transition-colors"
            title="Copy field value"
          >
            {hasCopied ? (
              <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            )}
          </button>
        </div>
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