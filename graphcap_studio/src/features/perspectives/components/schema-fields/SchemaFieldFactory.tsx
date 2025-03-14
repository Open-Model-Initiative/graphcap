// SPDX-License-Identifier: Apache-2.0
/**
 * Schema Field Factory
 * 
 * Factory component for rendering different types of schema fields.
 */

import React from 'react';
import { Stack, Text } from '@chakra-ui/react';
import { SchemaField } from '@/features/perspectives/types';
import { TagField } from './TagField';
import { NodeField } from './NodeField';
import { EdgeField } from './EdgeField';
import { BaseField } from './BaseField';

interface SchemaFieldFactoryProps {
  field: SchemaField;
  value: any;
  className?: string;
}

export const SchemaFieldFactory: React.FC<SchemaFieldFactoryProps> = ({
  field,
  value,
  className = ''
}) => {
  // Helper function to detect if value is a node
  const isNode = (val: any): boolean => {
    return (
      typeof val === 'object' &&
      val !== null &&
      'id' in val &&
      'label' in val
    );
  };

  // Helper function to detect if value is an edge
  const isEdge = (val: any): boolean => {
    return (
      typeof val === 'object' &&
      val !== null &&
      'source' in val &&
      'target' in val
    );
  };

  // Helper function to detect if value is a tag array
  const isTagArray = (val: any): boolean => {
    return (
      Array.isArray(val) &&
      val.every(item => typeof item === 'string')
    );
  };

  // Determine the appropriate component based on field type and value structure
  if (field.is_list) {
    if (isTagArray(value)) {
      return <TagField field={field} value={value} className={className} />;
    }
    
    if (Array.isArray(value) && value.every(isNode)) {
      return (
        <BaseField field={field} value={value} className={className}>
          <Stack direction="column" gap="2">
            {value.map((node, index) => (
              <NodeField
                key={node.id || index}
                field={{ ...field, is_list: false }}
                value={node}
              />
            ))}
          </Stack>
        </BaseField>
      );
    }
    
    if (Array.isArray(value) && value.every(isEdge)) {
      return (
        <BaseField field={field} value={value} className={className}>
          <Stack direction="column" gap="2">
            {value.map((edge, index) => (
              <EdgeField
                key={`${edge.source}-${edge.target}-${index}`}
                field={{ ...field, is_list: false }}
                value={edge}
              />
            ))}
          </Stack>
        </BaseField>
      );
    }
  } else {
    if (isNode(value)) {
      return <NodeField field={field} value={value} className={className} />;
    }
    
    if (isEdge(value)) {
      return <EdgeField field={field} value={value} className={className} />;
    }
  }

  // Default rendering for other types
  return (
    <BaseField field={field} value={value} className={className}>
      <Text fontSize="sm" color="gray.300" whiteSpace="pre-wrap">
        {typeof value === 'object'
          ? JSON.stringify(value, null, 2)
          : String(value)
        }
      </Text>
    </BaseField>
  );
}; 