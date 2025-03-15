// SPDX-License-Identifier: Apache-2.0
/**
 * Tag Field Component
 * 
 * Component for rendering tag fields.
 */

import React from 'react';
import { Flex, Tag } from "@chakra-ui/react";
import { BaseField } from './BaseField';
import { TagFieldProps } from './types';

export const TagField: React.FC<TagFieldProps> = ({ field, value, className }) => {
  if (!Array.isArray(value)) {
    return null;
  }

  return (
    <BaseField field={field} value={value} className={className}>
      <Flex flexWrap="wrap" gap="2">
        {value.map((tag, index) => (
          <Tag.Root
            key={`${tag}-${index}`}
            size="sm"
            variant="subtle"
            colorPalette="blue"
          >
            <Tag.Label>{tag}</Tag.Label>
          </Tag.Root>
        ))}
      </Flex>
    </BaseField>
  );
}; 