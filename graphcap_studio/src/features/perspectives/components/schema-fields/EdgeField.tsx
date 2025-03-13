// SPDX-License-Identifier: Apache-2.0
/**
 * Edge Field Component
 * 
 * Component for rendering edge fields.
 */

import React from 'react';
import { BaseField } from './BaseField';
import { EdgeFieldProps } from './types';

export const EdgeField: React.FC<EdgeFieldProps> = ({ field, value, className }) => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const { source, target, type, ...rest } = value;

  return (
    <BaseField field={field} value={value} className={className}>
      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-sm font-medium text-gray-200">{source}</span>
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          <span className="text-sm font-medium text-gray-200">{target}</span>
          {type && (
            <span className="text-xs px-2 py-0.5 bg-gray-700 rounded-full text-gray-400 ml-2">
              {type}
            </span>
          )}
        </div>
        {Object.entries(rest).length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-700">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(rest).map(([key, val]) => (
                <div key={key} className="text-xs">
                  <span className="text-gray-400">{key}: </span>
                  <span className="text-gray-300">
                    {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </BaseField>
  );
}; 