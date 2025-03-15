// SPDX-License-Identifier: Apache-2.0
/**
 * Node Field Component
 * 
 * Component for rendering node fields.
 */

import React from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  Badge, 
  Grid, 
  GridItem 
} from '@chakra-ui/react';
import { BaseField } from './BaseField';
import { NodeFieldProps } from './types';

export const NodeField: React.FC<NodeFieldProps> = ({ field, value, className }) => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const { id, label, type, ...rest } = value;

  return (
    <BaseField field={field} value={value} className={className}>
      <Box bg="gray.800" borderRadius="lg" p="3" borderWidth="1px" borderColor="gray.700">
        <Flex alignItems="center" justifyContent="space-between" mb="2">
          <Text fontSize="sm" fontWeight="medium" color="gray.200">{label}</Text>
          {type && (
            <Badge bg="gray.700" color="gray.400" borderRadius="full" px="2" py="0.5" fontSize="xs">
              {type}
            </Badge>
          )}
        </Flex>
        <Text fontSize="xs" color="gray.400">ID: {id}</Text>
        {Object.entries(rest).length > 0 && (
          <Box mt="2" pt="2" borderTopWidth="1px" borderColor="gray.700">
            <Grid templateColumns="repeat(2, 1fr)" gap="2">
              {Object.entries(rest).map(([key, val]) => (
                <GridItem key={key}>
                  <Text fontSize="xs">
                    <Text as="span" color="gray.400">{key}: </Text>
                    <Text as="span" color="gray.300">
                      {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                    </Text>
                  </Text>
                </GridItem>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </BaseField>
  );
}; 