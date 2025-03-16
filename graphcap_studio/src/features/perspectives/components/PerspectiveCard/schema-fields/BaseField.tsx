// SPDX-License-Identifier: Apache-2.0
/**
 * Base Field Component
 * 
 * Base component for rendering schema fields.
 */

import React from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  Badge,
} from '@chakra-ui/react';
import { BaseFieldProps } from './types';
import { ClipboardButton } from '@/components/ui/buttons';

export const BaseField: React.FC<BaseFieldProps> = ({
  field,
  value,
  className = '',
  children
}) => {
  return (
    <Box className={className} mb="4">
      <Flex alignItems="center" justifyContent="space-between" mb="1">
        <Flex alignItems="center" gap="2">
          <Text fontSize="sm" fontWeight="medium" color="gray.300">
            {field.name.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </Text>
          <ClipboardButton 
            content={value}
            label="Copy field value"
            size="xs"
            variant="ghost"
            p="1"
            iconOnly
          />
        </Flex>
        {field.type && (
          <Badge variant="subtle" colorScheme="gray" borderRadius="full" px="2" py="0.5" fontSize="xs">
            {field.type}
            {field.is_list && ' []'}
          </Badge>
        )}
      </Flex>
      {field.description && (
        <Text fontSize="xs" color="gray.400" mb="2">{field.description}</Text>
      )}
      <Box>
        {children}
      </Box>
    </Box>
  );
}; 