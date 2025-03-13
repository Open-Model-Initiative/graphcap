// SPDX-License-Identifier: Apache-2.0
/**
 * Perspective Content Component
 * 
 * This component displays the content of a perspective.
 */

import React from 'react';
import { usePerspectiveUI } from './context/PerspectiveUIContext';
import { SchemaFieldFactory } from './components/schema-fields';

interface PerspectiveContentProps {
  perspectiveKey: string;
  data: Record<string, any>;
  className?: string;
}

export function PerspectiveContent({
  perspectiveKey,
  data,
  className = '',
}: PerspectiveContentProps) {
  const { schemas } = usePerspectiveUI();
  const schema = schemas[perspectiveKey];

  if (!schema) {
    return (
      <div className="text-sm text-gray-400 text-center py-4">
        Schema not found for perspective: {perspectiveKey}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {schema.schema_fields.map((field) => (
        <div key={field.name} className="bg-gray-800 p-3 rounded-lg">
          <SchemaFieldFactory
            field={field}
            value={data[field.name]}
            className="perspective-field"
          />
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