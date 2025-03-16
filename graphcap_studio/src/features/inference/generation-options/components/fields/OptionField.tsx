// SPDX-License-Identifier: Apache-2.0
/**
 * Option Field Base Component
 * 
 * This component provides a base layout for all option fields.
 */

import  { ChangeEvent } from 'react';
import { Box, HStack, Input } from '@chakra-ui/react';
import { Slider } from '@/components/ui/slider';
import { useColorModeValue } from '@/components/ui/theme/color-mode';
import { OPTION_CONFIGS } from '../../schema';

export type OptionFieldKey = keyof typeof OPTION_CONFIGS;

interface OptionFieldProps<K extends OptionFieldKey> {
  readonly label: string;
  readonly name: K;
  readonly value: number;
  readonly onChange: (value: number) => void;
  readonly disabled?: boolean;
}

/**
 * Base component for option fields with slider and input
 */
export function OptionField<K extends OptionFieldKey>({
  label,
  name,
  value,
  onChange,
  disabled = false,
}: OptionFieldProps<K>) {
  // Get configuration for this option
  const config = OPTION_CONFIGS[name];
  
  // Color values for theming
  const labelColor = useColorModeValue('gray.700', 'gray.300');
  const inputBgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Handle slider value changes
  const handleSliderChange = (details: { value: number[] }) => {
    onChange(details.value[0]);
  };
  
  // Handle direct input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const valueAsNumber = parseFloat(e.target.value);
    if (isNaN(valueAsNumber)) return;
    
    // Ensure value is within bounds
    const boundedValue = Math.max(config.min, Math.min(config.max, valueAsNumber));
    onChange(boundedValue);
  };
  
  return (
    <Box w="full">
      <Box as="label" display="block" fontSize="xs" mb={1} color={labelColor}>
        {label}
      </Box>
      <HStack>
        <Box flex="1">
          <Slider
            aria-label={[label]}
            value={[value]}
            onValueChange={handleSliderChange}
            min={config.min}
            max={config.max}
            step={config.step}
            disabled={disabled}
          />
        </Box>
        <Input
          type="number"
          min={config.min}
          max={config.max}
          step={config.step}
          value={value}
          onChange={handleInputChange}
          size="xs"
          width={name === 'max_tokens' ? "70px" : "60px"}
          disabled={disabled}
          textAlign="right"
          bg={inputBgColor}
          borderColor={borderColor}
        />
      </HStack>
    </Box>
  );
} 