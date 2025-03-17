// SPDX-License-Identifier: Apache-2.0
/**
 * Global Context Field Component
 * 
 * This component renders a textarea for the global context option.
 */

import { ChangeEvent } from 'react';
import { Box, Textarea } from '@chakra-ui/react';
import { useColorModeValue } from '@/components/ui/theme/color-mode';
import { useGenerationOptions } from '../../context';

/**
 * Global context control field component
 */
export function GlobalContextField() {
  const { options, updateOption, isGenerating } = useGenerationOptions();
  
  // Color values for theming
  const labelColor = useColorModeValue('gray.700', 'gray.300');
  const inputBgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    updateOption('global_context', e.target.value);
  };
  
  return (
    <Box w="full">
      <Box as="label" display="block" fontSize="xs" mb={1} color={labelColor}>
        Global Context
      </Box>
      <Textarea
        value={options.global_context}
        onChange={handleChange}
        placeholder="Enter global context for generation..."
        size="sm"
        minH="100px"
        disabled={isGenerating}
        bg={inputBgColor}
        borderColor={borderColor}
        resize="vertical"
      />
    </Box>
  );
} 