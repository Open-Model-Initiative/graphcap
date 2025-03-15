// SPDX-License-Identifier: Apache-2.0
/**
 * Perspective Header Component
 * 
 * This component displays the header for the perspectives section.
 */

import { Box, Flex, Heading, Text, Stack } from '@chakra-ui/react';
import { LoadingSpinner } from '@/components/ui/status/LoadingSpinner';
import { useColorModeValue } from '@/components/ui/theme/color-mode';

interface PerspectiveHeaderProps {
  readonly isLoading: boolean;
}

/**
 * Header component for the perspectives section
 */
export function PerspectiveHeader({ isLoading }: PerspectiveHeaderProps) {
  const textColor = useColorModeValue('gray.800', 'gray.200');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  
  return (
    <Flex justifyContent="space-between" alignItems="center" mb={4}>
      <Heading as="h3" fontSize="md" fontWeight="medium" color={textColor}>
        Perspectives
      </Heading>
      
      {isLoading && (
        <Flex alignItems="center" gap={2}>
          <LoadingSpinner size="sm" color="primary" className="h-3 w-3" />
          <Text fontSize="xs" color={mutedColor}>
            Processing perspectives...
          </Text>
        </Flex>
      )}
    </Flex>
  );
} 