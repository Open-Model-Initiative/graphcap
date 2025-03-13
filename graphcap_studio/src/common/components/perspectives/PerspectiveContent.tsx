// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { PerspectiveField } from './components/PerspectiveField';
import { usePerspectiveUI } from './context/PerspectiveUIContext';

interface PerspectiveContentProps {
  perspectiveKey: string;
  data: Record<string, any>;
  className?: string;
}

/**
 * Component for displaying the content of a generated perspective
 * Uses a generic approach to display any perspective content
 */
export function PerspectiveContent({ perspectiveKey, data, className = '' }: PerspectiveContentProps) {
  const { schemas } = usePerspectiveUI();
  const schema = schemas[perspectiveKey];

  if (!schema) {
    return (
      <div className="text-red-500 p-4">
        Error: Schema not found for perspective {perspectiveKey}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {schema.schema_fields.map((field) => (
        <PerspectiveField
          key={field.name}
          field={field}
          value={data[field.name]}
          className="perspective-field-container"
        />
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