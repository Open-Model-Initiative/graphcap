// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Footer Component
 * 
 * This component displays a fixed footer with action controls for perspectives.
 */

import React from 'react';
import { Box, Flex, Button, Icon, HStack } from '@chakra-ui/react';
import { LuSettings, LuRefreshCw } from 'react-icons/lu';
import { useColorModeValue } from '@/components/ui/theme/color-mode';
import { Provider } from '@/features/perspectives/types';

interface PerspectivesFooterProps {
  isLoading: boolean;
  isGenerated: boolean;
  availableProviders: Provider[];
  selectedProviderId?: number;
  onGenerate: () => void;
  onProviderChange: (providerId: number | undefined) => void;
  optionsControl: {
    isOpen: boolean;
    onToggle: () => void;
    buttonRef: React.RefObject<HTMLButtonElement | null>;
  };
}

/**
 * Footer component with action controls for generating perspectives
 */
export function PerspectivesFooter({
  isLoading,
  isGenerated,
  availableProviders,
  selectedProviderId,
  onGenerate,
  onProviderChange,
  optionsControl
}: PerspectivesFooterProps) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onProviderChange(value ? Number(value) : undefined);
  };
  
  return (
    <Box
      position="sticky"
      bottom={0}
      left={0}
      right={0}
      py={2}
      px={4}
      bg={bgColor}
      borderTopWidth="1px"
      borderColor={borderColor}
      zIndex={10}
    >
      <Flex justifyContent="space-between" alignItems="center">
        {/* Provider Selection */}
        {availableProviders.length > 0 && (
          <select
            style={{
              fontSize: '0.875rem',
              maxWidth: '180px',
              padding: '0.25rem',
              borderRadius: '0.375rem',
              border: '1px solid',
              borderColor: borderColor,
              backgroundColor: bgColor,
              opacity: isLoading ? 0.6 : 1
            }}
            value={selectedProviderId?.toString() || ''}
            onChange={handleProviderChange}
            disabled={isLoading}
          >
            <option value="">Select provider</option>
            {availableProviders.map(provider => (
              <option key={provider.id} value={provider.id.toString()}>
                {provider.name}
              </option>
            ))}
          </select>
        )}
        
        <HStack gap={2}>
          {/* Options Button */}
          <Button
            ref={optionsControl.buttonRef}
            size="sm"
            variant="ghost"
            onClick={optionsControl.onToggle}
            aria-label="Generation options"
            disabled={isLoading}
          >
            <Icon as={LuSettings} mr={2} />
            Options
          </Button>
          
          {/* Generate/Regenerate Button */}
          <Button
            size="sm"
            colorScheme={isGenerated ? "gray" : "blue"}
            variant={isGenerated ? "outline" : "solid"}
            onClick={onGenerate}
            disabled={isLoading}
          >
            {isGenerated && <Icon as={LuRefreshCw} mr={2} />}
            {isGenerated ? 'Regenerate' : 'Generate'}
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
} 