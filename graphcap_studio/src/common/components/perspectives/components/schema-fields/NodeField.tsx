// SPDX-License-Identifier: Apache-2.0
/**
 * Node Field Component
 * 
 * Component for rendering node fields.
 */

import React from 'react';
import { BaseField } from './BaseField';
import { NodeFieldProps } from './types';

export const NodeField: React.FC<NodeFieldProps> = ({ field, value, className }) => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const { id, label, type, ...rest } = value;

  return (
    <BaseField field={field} value={value} className={className}>
      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-200">{label}</span>
          {type && (
            <span className="text-xs px-2 py-0.5 bg-gray-700 rounded-full text-gray-400">
              {type}
            </span>
          )}
        </div>
        <div className="text-xs text-gray-400">ID: {id}</div>
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