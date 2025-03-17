// SPDX-License-Identifier: Apache-2.0
/**
 * Generation Options Popover
 * 
 * This component displays a popover with generation options form.
 */

import React from 'react';
import { Popover, Portal, Box, HStack, Flex } from '@chakra-ui/react';
import { Button } from '@/components/ui';
import { useColorModeValue } from '@/components/ui/theme/color-mode';
import {
  TemperatureField,
  MaxTokensField,
  TopPField,
  RepetitionPenaltyField,
  GlobalContextField,
  ResizeResolutionField
} from './fields';
import { useGenerationOptions } from '../context';

interface GenerationOptionsPopoverProps {
  readonly children: React.ReactNode;
}

/**
 * Popover component for generation options
 */
export function GenerationOptionsPopover({ children }: GenerationOptionsPopoverProps) {
  const {
    isPopoverOpen,
    closePopover,
    resetOptions,
    isGenerating
  } = useGenerationOptions();
  
  // Colors for theming
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerColor = useColorModeValue('gray.800', 'white');
  
  return (
    <Popover.Root open={isPopoverOpen} onOpenChange={(e) => e.open ? null : closePopover()}>
      <Popover.Trigger asChild>
        {children}
      </Popover.Trigger>
      
      <Portal>
        <Popover.Positioner>
          <Popover.Content
            bg={bgColor}
            borderColor={borderColor}
            shadow="lg"
            w="120"
            zIndex={50}
          >
            <Popover.Header
              fontWeight="medium"
              borderBottomWidth="1px"
              color={headerColor}
              fontSize="sm"
              p={3}
            >
              Generation Options
              <Popover.CloseTrigger asChild>
                <Box
                  position="absolute"
                  top="3"
                  right="3"
                  cursor="pointer"
                  fontSize="sm"
                  aria-label="Close"
                  opacity={isGenerating ? 0.5 : 1}
                  pointerEvents={isGenerating ? "none" : "auto"}
                >
                  ✕
                </Box>
              </Popover.CloseTrigger>
            </Popover.Header>
            
            <Popover.Body p={4}>
              <Flex gap={4}>
                <Box flex="1">
                  <Flex direction="column" gap={4}>
                    <TemperatureField />
                    <TopPField />
                    <ResizeResolutionField />
                  </Flex>
                </Box>
                <Box flex="1">
                  <Flex direction="column" gap={4}>
                    <MaxTokensField />
                    <RepetitionPenaltyField />
                    <GlobalContextField />
                  </Flex>
                </Box>
              </Flex>
            </Popover.Body>
            
            <Popover.Footer p={3} borderTopWidth="1px">
              <HStack gap={3} justify="flex-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={resetOptions}
                  disabled={isGenerating}
                >
                  Reset to Defaults
                </Button>
                <Button
                  size="sm"
                  onClick={closePopover}
                  disabled={isGenerating}
                >
                  Close
                </Button>
              </HStack>
            </Popover.Footer>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
} 