// SPDX-License-Identifier: Apache-2.0
/**
 * RawDataSection Component
 * 
 * Displays raw data for a perspective in a pre-formatted block.
 */
import { Box, Heading } from '@chakra-ui/react';
import { useColorModeValue } from '@/components/ui/theme/color-mode';

interface RawDataSectionProps {
  readonly data: Record<string, any>;
}

export function RawDataSection({ data }: RawDataSectionProps) {
  const labelColor = useColorModeValue('blue.600', 'blue.300');
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box>
      <Heading size="xs" mb={2} color={labelColor}>Raw Data</Heading>
      <Box 
        as="pre" 
        fontSize="xs" 
        p={2} 
        bg={bgColor} 
        borderRadius="md" 
        border="1px" 
        borderColor={borderColor}
        overflowX="auto"
        whiteSpace="pre-wrap"
      >
        {JSON.stringify(data, null, 2)}
      </Box>
    </Box>
  );
} 