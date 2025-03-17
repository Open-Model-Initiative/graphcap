// SPDX-License-Identifier: Apache-2.0
/**
 * OptionsSection Component
 * 
 * Displays generation options for a perspective.
 */
import { Box, Text, Stack, Heading } from '@chakra-ui/react';
import { useColorModeValue } from '@/components/ui/theme/color-mode';
import { CaptionOptions } from '@/features/perspectives/types';

interface OptionsSectionProps {
  readonly options: CaptionOptions | null;
}

export function OptionsSection({ options }: OptionsSectionProps) {
  const labelColor = useColorModeValue('blue.600', 'blue.300');
  const valueColor = useColorModeValue('gray.800', 'gray.200');
  const errorColor = useColorModeValue('red.500', 'red.300');
  const errorBgColor = useColorModeValue('red.50', 'red.900');
  const warningBgColor = useColorModeValue('yellow.50', 'yellow.900');
  const warningColor = useColorModeValue('yellow.700', 'yellow.200');
  const warningBorderColor = useColorModeValue('yellow.500', 'yellow.300');
  
  const renderOptionsContent = () => {
    if (!options) {
      return (
        <Box p={2} bg={errorBgColor} borderRadius="md" borderLeft="4px solid" borderLeftColor={errorColor}>
          <Text fontSize="xs" color={errorColor} fontWeight="bold">
            ERROR: GENERATION OPTIONS ARE MISSING
          </Text>
          <Text fontSize="xs" color={errorColor}>
            All perspectives must include generation options!
          </Text>
        </Box>
      );
    }
    
    if (Object.keys(options).length === 0) {
      return (
        <Box p={2} bg={warningBgColor} borderRadius="md" borderLeft="4px solid" borderLeftColor={warningBorderColor}>
          <Text fontSize="xs" color={warningColor} fontWeight="bold">
            NOTE: Options object is present but empty
          </Text>
          <Text fontSize="xs" color={warningColor}>
            Options are saved correctly but no values were provided.
          </Text>
        </Box>
      );
    }
    
    return (
      <Stack direction="column" gap={1}>
        {Object.entries(options).map(([key, value]) => (
          <OptionItem
            key={key}
            optionKey={key}
            optionValue={value}
            labelColor={labelColor}
            valueColor={valueColor}
          />
        ))}
      </Stack>
    );
  };
  
  return (
    <Box>
      <Heading size="xs" mb={2} color={labelColor}>Generation Options</Heading>
      {renderOptionsContent()}
    </Box>
  );
}

interface OptionItemProps {
  readonly optionKey: string;
  readonly optionValue: any;
  readonly labelColor: string;
  readonly valueColor: string;
}

function OptionItem({ optionKey, optionValue, labelColor, valueColor }: OptionItemProps) {
  const formattedValue = Array.isArray(optionValue) 
    ? optionValue.join(', ') 
    : String(optionValue);

  return (
    <Box display="flex" justifyContent="space-between">
      <Text fontSize="xs" color={labelColor}>{optionKey}:</Text>
      <Text fontSize="xs" color={valueColor}>{formattedValue}</Text>
    </Box>
  );
} 