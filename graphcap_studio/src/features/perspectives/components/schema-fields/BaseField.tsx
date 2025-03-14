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
  Button,
  Icon
} from '@chakra-ui/react';
import { BaseFieldProps } from './types';
import { useClipboard } from '@/common/hooks/useClipboard';

export const BaseField: React.FC<BaseFieldProps> = ({
  field,
  value,
  className = '',
  children
}) => {
  const { copyToClipboard, hasCopied } = useClipboard();

  const handleCopy = () => {
    const textValue = typeof value === 'string' 
      ? value 
      : JSON.stringify(value, null, 2);
    copyToClipboard(textValue);
  };

  return (
    <Box className={className} mb="4">
      <Flex alignItems="center" justifyContent="space-between" mb="1">
        <Flex alignItems="center" gap="2">
          <Text fontSize="sm" fontWeight="medium" color="gray.300">
            {field.name.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </Text>
          <Button
            onClick={handleCopy}
            aria-label="Copy field value"
            title={hasCopied ? "Copied!" : "Copy value"}
            size="xs"
            variant="ghost"
            colorScheme={hasCopied ? "green" : "gray"}
            p="1"
          >
            {hasCopied ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            )}
          </Button>
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