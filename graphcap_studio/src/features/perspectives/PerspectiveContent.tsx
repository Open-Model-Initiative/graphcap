// SPDX-License-Identifier: Apache-2.0
/**
 * Perspective Content Component
 * 
 * This component displays the content of a perspective.
 */

import React, { ReactNode } from 'react';
import { PerspectiveSchema } from './types';
import { SchemaFieldFactory } from './components/schema-fields';

interface PerspectiveContentProps {
  data: Record<string, any>;
  schema: PerspectiveSchema;
  renderField: (field: PerspectiveSchema['schema_fields'][0], value: any) => ReactNode;
  className?: string;
}

export function PerspectiveContent({
  data,
  schema,
  renderField,
  className = '',
}: PerspectiveContentProps) {
  if (!schema) {
    return (
      <div className="text-sm text-gray-400 text-center py-4">
        Schema not available
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {schema.schema_fields.map((field) => (
        <div key={field.name} className="bg-gray-800 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-gray-300 mb-2">
            {field.description || field.name}
          </h4>
          {renderField(field, data[field.name])}
        </div>
      ))}
    </div>
  );
}

// Default content display for any perspective
function DefaultContent({ content }: { readonly content: Record<string, any> }) {
  return (
    <div className="space-y-2">
      {Object.entries(content).map(([key, value]) => (
        <div key={key}>
          <h5 className="text-xs font-medium text-gray-300 mb-1 capitalize">{key.replace(/_/g, ' ')}</h5>
          <p className="text-sm text-gray-400 whitespace-pre-wrap">
            {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
          </p>
        </div>
      ))}
    </div>
  );
} 