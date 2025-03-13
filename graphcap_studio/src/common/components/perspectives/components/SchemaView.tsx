// SPDX-License-Identifier: Apache-2.0
/**
 * SchemaView Component
 * 
 * This component displays the schema information for a perspective.
 */

import React from 'react';
import { PerspectiveSchema, SchemaField } from '@/services/perspectives/types';

interface SchemaViewProps {
  schema: PerspectiveSchema;
  className?: string;
}

export function SchemaView({ schema, className = '' }: SchemaViewProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {schema.schema_fields.map((field: SchemaField) => (
        <div key={field.name} className="bg-gray-800 p-3 rounded-lg">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">
                {field.name}
              </span>
              <span className="text-xs px-2 py-0.5 bg-gray-700 rounded-full text-gray-400">
                {field.type}
                {field.is_list && ' []'}
                {field.is_complex && ' (complex)'}
              </span>
            </div>
            {field.description && (
              <p className="text-xs text-gray-400">{field.description}</p>
            )}
            {field.is_complex && field.fields && (
              <div className="pl-4 border-l border-gray-700 mt-2">
                <h5 className="text-xs font-medium text-gray-400 mb-2">Fields:</h5>
                <div className="space-y-2">
                  {field.fields.map((subField: SchemaField) => (
                    <div key={subField.name} className="flex items-center justify-between">
                      <span className="text-xs text-gray-300">{subField.name}</span>
                      <span className="text-xs px-2 py-0.5 bg-gray-700 rounded-full text-gray-400">
                        {subField.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 