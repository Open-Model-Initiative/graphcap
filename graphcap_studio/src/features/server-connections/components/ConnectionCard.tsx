// SPDX-License-Identifier: Apache-2.0
import { memo } from 'react';
import { ConnectionCardProps } from '@/features/server-connections/types';
import {
  Box,
  Stack,
  Heading,
  Flex,
} from '@chakra-ui/react';
import { useColorModeValue } from '@/components/ui/color-mode';

/**
 * ConnectionCard component
 * 
 * A card layout for displaying a server connection with its controls
 */
export const ConnectionCard = memo(function ConnectionCard({
  title,
  urlInput,
  actions,
  status
}: ConnectionCardProps) {
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.900', 'gray.100');

  return (
    <Box 
      bg={bgColor} 
      borderColor={borderColor} 
      borderWidth="1px"
      borderRadius="lg"
      p={4}
      shadow="sm"
      _hover={{ shadow: 'md' }}
      transition="all 0.2s"
    >
      <Heading size="sm" mb={3} color={textColor}>
        {title}
      </Heading>
      
      <Stack gap={4}>
        {/* URL Input */}
        <Box w="full">
          {urlInput}
        </Box>
        
        {/* Controls and Status */}
        <Flex justify="space-between" align="center" gap={4}>
          <Box>
            {actions}
          </Box>
          <Box>
            {status}
          </Box>
        </Flex>
      </Stack>
    </Box>
  );
}); 