// SPDX-License-Identifier: Apache-2.0
/**
 * Tag Field Component
 * 
 * Component for rendering tag fields.
 */

import React from 'react';
import { BaseField } from './BaseField';
import { TagFieldProps } from './types';

export const TagField: React.FC<TagFieldProps> = ({ field, value, className }) => {
  if (!Array.isArray(value)) {
    return null;
  }

  return (
    <BaseField field={field} value={value} className={className}>
      <div className="flex flex-wrap gap-2">
        {value.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          >
            {tag}
          </span>
        ))}
      </div>
    </BaseField>
  );
}; 