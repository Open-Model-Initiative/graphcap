import React from 'react';
import { SchemaField } from '@/services/perspectives/types';

interface PerspectiveFieldProps {
  field: SchemaField;
  value: any;
  className?: string;
}

export function PerspectiveField({ field, value, className = '' }: PerspectiveFieldProps) {
  const renderComplexList = () => {
    if (!Array.isArray(value) || !field.fields || field.fields.length === 0) return null;

    return (
      <div className="space-y-2">
        {value.map((item, index) => (
          <div key={index} className="bg-gray-800 p-3 rounded-lg">
            <div className="grid grid-cols-3 gap-2">
              {field.fields.map((subField) => (
                <div key={subField.name} className="text-sm">
                  <span className="text-gray-400 font-medium">{subField.name}: </span>
                  <span className="text-gray-200">
                    {subField.type === 'float' && typeof item[subField.name] === 'number'
                      ? Number(item[subField.name]).toFixed(2)
                      : item[subField.name]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSimpleField = () => {
    if (!value) return null;

    if (field.type === 'str') {
      return (
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-200 whitespace-pre-wrap">{value}</p>
        </div>
      );
    }

    if (field.type === 'float' && typeof value === 'number') {
      return <p className="text-gray-200">{Number(value).toFixed(2)}</p>;
    }

    return null;
  };

  return (
    <div className={`perspective-field ${className}`}>
      <h4 className="text-sm font-medium text-gray-300 mb-2">
        {field.name.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </h4>
      <div className="mt-1">
        {field.is_list && field.is_complex ? renderComplexList() : renderSimpleField()}
      </div>
    </div>
  );
} 