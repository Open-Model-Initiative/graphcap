// SPDX-License-Identifier: Apache-2.0
/**
 * Generation Option Form Component
 * 
 * This component displays a form for configuring generation options.
 */

import React from 'react';
import { Box, VStack, HStack } from '@chakra-ui/react';
import { Button } from '@/components/ui';
import { Slider } from '@/components/ui/slider';
import { CaptionOptions } from '@/features/perspectives/types';

// Default options for caption generation
export const DEFAULT_OPTIONS: CaptionOptions = {
  temperature: 0.7,
  max_tokens: 4096,
  top_p: 0.95,
  repetition_penalty: 1.1
};

interface GenerationOptionFormProps {
  options: CaptionOptions;
  onChange: (options: CaptionOptions) => void;
  onClose: () => void;
  isGenerating?: boolean;
}

/**
 * Form component for configuring generation options
 */
export function GenerationOptionForm({
  options,
  onChange,
  onClose,
  isGenerating = false,
}: GenerationOptionFormProps) {
  const handleOptionChange = (name: keyof CaptionOptions) => (details: { value: number[] }) => {
    onChange({
      ...options,
      [name]: details.value[0]
    });
  };

  const handleResetDefaults = () => {
    onChange(DEFAULT_OPTIONS);
  };
  
  const getSliderValue = (key: keyof CaptionOptions): number[] => {
    const defaultValue = DEFAULT_OPTIONS[key];
    const value = typeof options[key] === 'number' ? options[key] : defaultValue;
    return [value as number];
  };
  
  return (
    <Box
      position="absolute"
      right="0"
      top="full"
      mt={2}
      w="64"
      bg="bg.panel"
      rounded="l2"
      shadow="lg"
      zIndex={50}
      p={4}
      borderWidth="1px"
      borderColor="border.default"
    >
      <HStack justify="space-between" mb={3}>
        <Box as="h4" textStyle="sm" fontWeight="medium" color="fg.default">
          Generation Options
        </Box>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={isGenerating}
          aria-label="Close"
        >
          ✕
        </Button>
      </HStack>
      
      <VStack gap={4}>
        <Box w="full">
          <Box as="label" display="block" fontSize="xs" mb={1}>
            Temperature
          </Box>
          <Slider
            aria-label={['Temperature']}
            value={getSliderValue('temperature')}
            onValueChange={handleOptionChange('temperature')}
            min={0}
            max={1}
            step={0.1}
            disabled={isGenerating}
          />
        </Box>
        
        <Box w="full">
          <Box as="label" display="block" fontSize="xs" mb={1}>
            Max Tokens
          </Box>
          <Slider
            aria-label={['Max Tokens']}
            value={getSliderValue('max_tokens')}
            onValueChange={handleOptionChange('max_tokens')}
            min={1}
            max={8192}
            step={1}
            disabled={isGenerating}
          />
        </Box>
        
        <Box w="full">
          <Box as="label" display="block" fontSize="xs" mb={1}>
            Top P
          </Box>
          <Slider
            aria-label={['Top P']}
            value={getSliderValue('top_p')}
            onValueChange={handleOptionChange('top_p')}
            min={0}
            max={1}
            step={0.05}
            disabled={isGenerating}
          />
        </Box>
        
        <Box w="full">
          <Box as="label" display="block" fontSize="xs" mb={1}>
            Repetition Penalty
          </Box>
          <Slider
            aria-label={['Repetition Penalty']}
            value={getSliderValue('repetition_penalty')}
            onValueChange={handleOptionChange('repetition_penalty')}
            min={1}
            max={2}
            step={0.1}
            disabled={isGenerating}
          />
        </Box>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetDefaults}
          disabled={isGenerating}
          className="w-full"
        >
          Reset to Defaults
        </Button>
      </VStack>
    </Box>
  );
} 