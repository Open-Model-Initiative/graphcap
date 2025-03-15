// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Footer Component
 * 
 * This component displays a fixed footer with action controls for perspectives.
 */

import React, { useCallback, useEffect } from 'react';
import { Box, Flex, Button, Icon, HStack } from '@chakra-ui/react';
import { LuSettings, LuRefreshCw } from 'react-icons/lu';
import { useColorModeValue } from '@/components/ui/theme/color-mode';
import { 
  usePerspectivesData,
  usePerspectiveUI
} from '@/features/perspectives/context';

interface PerspectivesFooterProps {
  isLoading: boolean;
  isGenerated: boolean;
  optionsControl: {
    isOpen: boolean;
    onToggle: () => void;
    buttonRef: React.RefObject<HTMLButtonElement | null>;
  };
  captionOptions?: any; // Caption generation options
}

/**
 * Footer component with action controls for generating perspectives
 */
export function PerspectivesFooter({
  isLoading,
  isGenerated,
  optionsControl,
  captionOptions
}: PerspectivesFooterProps) {
  // Use data context
  const { 
    selectedProviderId, 
    availableProviders, 
    handleProviderChange, 
    fetchProviders,
    generatePerspective,
    isGenerating,
    currentImage
  } = usePerspectivesData();
  
  // Use UI context
  const { activeSchemaName } = usePerspectiveUI();
  
  // Use console.log instead of toast
  const showMessage = useCallback((title: string, message: string, type: string) => {
    console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
  }, []);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Fetch providers on component mount
  useEffect(() => {
    fetchProviders().catch(error => {
      console.error("Failed to fetch providers:", error);
    });
  }, [fetchProviders]);
  
  // Handle generate button click
  const handleGenerate = useCallback(async () => {
    console.log("Generate button clicked");
    console.log("Active schema:", activeSchemaName);
    console.log("Selected provider ID:", selectedProviderId);
    console.log("Caption options:", captionOptions);
    
    if (!activeSchemaName) {
      showMessage(
        "No perspective selected",
        "Please select a perspective to generate",
        "error"
      );  
      return;
    }
    
    if (!selectedProviderId) {
      showMessage(
        "No provider selected",
        "Please select an inference provider",
        "error"
      );
      return;
    }
    
    if (!currentImage) {
      showMessage(
        "No image selected",
        "Please select an image to generate perspective",
        "error"
      );
      return;
    }
    
    try {
      console.log("Calling generatePerspective...");
      await generatePerspective(
        activeSchemaName,
        currentImage.path,
        selectedProviderId,
        captionOptions
      );
      showMessage(
        "Generation started",
        `Generating ${activeSchemaName} perspective`,
        "info"
      );
    } catch (error) {
      console.error("Error generating perspective:", error);
      showMessage(
        "Generation failed",
        error instanceof Error ? error.message : "Unknown error",
        "error"
      );
    }
  }, [activeSchemaName, selectedProviderId, generatePerspective, captionOptions, showMessage, currentImage]);
  
  // Combine loading states
  const isProcessing = isLoading || isGenerating;
  
  // Check if button should be disabled
  const isGenerateDisabled = isProcessing || !activeSchemaName || !selectedProviderId;
  
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
        {availableProviders.length > 0 ? (
          <Box maxWidth="180px">
            <select
              style={{
                fontSize: '0.875rem',
                width: '100%',
                padding: '0.5rem',
                borderRadius: '0.375rem',
                border: '1px solid',
                borderColor: 'inherit',
                backgroundColor: 'inherit',
                opacity: isProcessing ? 0.6 : 1
              }}
              value={selectedProviderId?.toString() || ''}
              onChange={handleProviderChange}
              disabled={isProcessing}
            >
              <option value="">Select provider</option>
              {availableProviders.map(provider => (
                <option key={provider.id} value={provider.id.toString()}>
                  {provider.name}
                </option>
              ))}
            </select>
          </Box>
        ) : (
          <Box flex="1" />
        )}
        
        <HStack gap={2}>
          {/* Options Button */}
          <Button
            ref={optionsControl.buttonRef}
            size="sm"
            variant="ghost"
            onClick={optionsControl.onToggle}
            aria-label="Generation options"
            disabled={isProcessing}
          >
            <Icon as={LuSettings} mr={2} />
            Options
          </Button>
          
          {/* Generate/Regenerate Button */}
          <Button
            size="sm"
            colorScheme={isGenerated ? "gray" : "blue"}
            variant={isGenerated ? "outline" : "solid"}
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            title={
              !selectedProviderId 
                ? "Please select a provider" 
                : !activeSchemaName 
                  ? "No perspective selected" 
                  : isProcessing 
                    ? "Generation in progress" 
                    : isGenerated ? "Regenerate perspective" : "Generate perspective"
            }
          >
            {isGenerating && <Icon as={LuRefreshCw} mr={2} animation="spin 1s linear infinite"/>}
            {isGenerated && !isGenerating && <Icon as={LuRefreshCw} mr={2} />}
            {isGenerated ? 'Regenerate' : 'Generate'}
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
} 