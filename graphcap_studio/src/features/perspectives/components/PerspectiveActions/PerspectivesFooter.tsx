// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Footer Component
 * 
 * This component displays a fixed footer with action controls for perspectives.
 */

import { useCallback, useEffect } from 'react';
import { Box, Flex, Button, Icon, HStack } from '@chakra-ui/react';
import { LuSettings, LuRefreshCw } from 'react-icons/lu';
import { useColorModeValue } from '@/components/ui/theme/color-mode';
import { 
  usePerspectivesData,
  usePerspectiveUI
} from '@/features/perspectives/context';
import { 
  GenerationOptionsProvider, 
  GenerationOptionsButton,
} from '@/features/inference/generation-options';
import { DEFAULT_OPTIONS } from '@/features/inference/generation-options/schema';
import { CaptionOptions } from '@/features/perspectives/types';

/**
 * Helper function to determine button title text
 */
const getButtonTitle = (
  selectedProviderId: number | undefined,
  activeSchemaName: string | null,
  isProcessing: boolean, 
  isGenerated: boolean
): string => {
  if (!selectedProviderId) {
    return "Please select a provider";
  }
  
  if (!activeSchemaName) {
    return "No perspective selected";
  }
  
  if (isProcessing) {
    return "Generation in progress";
  }
  
  return isGenerated ? "Regenerate perspective" : "Generate perspective";
};

/**
 * Footer component with action controls for generating perspectives
 * Uses contexts instead of props to reduce prop drilling
 */
export function PerspectivesFooter() {
  // Use data context
  const { 
    selectedProviderId, 
    availableProviders, 
    handleProviderChange, 
    fetchProviders,
    generatePerspective,
    isGenerating,
    currentImage,
    captionOptions,
    setCaptionOptions
  } = usePerspectivesData();
  
  // Use UI context
  const { 
    activeSchemaName, 
    isLoading,
    isGenerated
  } = usePerspectiveUI();
  
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
  
  // Validation checks for generate button
  const validateGeneration = useCallback(() => {
    if (!activeSchemaName) {
      showMessage(
        "No perspective selected",
        "Please select a perspective to generate",
        "error"
      );  
      return false;
    }
    
    if (!selectedProviderId) {
      showMessage(
        "No provider selected",
        "Please select an inference provider",
        "error"
      );
      return false;
    }
    
    if (!currentImage) {
      showMessage(
        "No image selected",
        "Please select an image to generate perspective",
        "error"
      );
      return false;
    }
    
    return true;
  }, [activeSchemaName, selectedProviderId, currentImage, showMessage]);
  
  // Handle generate button click
  const handleGenerate = useCallback(async () => {
    console.log("Generate button clicked");
    console.log("Active schema:", activeSchemaName);
    console.log("Selected provider ID:", selectedProviderId);
    
    // Ensure we have valid options by applying defaults if needed
    const effectiveOptions = Object.keys(captionOptions).length === 0 
      ? DEFAULT_OPTIONS 
      : captionOptions;
      
    console.log("Using caption options:", effectiveOptions);
    
    if (!validateGeneration()) {
      return;
    }
    
    try {
      console.log("Calling generatePerspective...");
      await generatePerspective(
        activeSchemaName!,
        currentImage!.path,
        selectedProviderId,
        effectiveOptions
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
  }, [activeSchemaName, selectedProviderId, generatePerspective, captionOptions, showMessage, currentImage, validateGeneration]);
  
  // Combine loading states
  const isProcessing = isLoading || isGenerating;
  
  // Check if button should be disabled
  const isGenerateDisabled = isProcessing || !activeSchemaName || !selectedProviderId;
  
  // Get title for the generate button
  const buttonTitle = getButtonTitle(selectedProviderId, activeSchemaName, isProcessing, isGenerated);
  
  // Handle options change
  const handleOptionsChange = useCallback((newOptions: CaptionOptions) => {
    setCaptionOptions(newOptions);
  }, [setCaptionOptions]);
  
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
              value={selectedProviderId?.toString() ?? ''}
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
          {/* Options Button with Popover */}
          <GenerationOptionsProvider 
            initialOptions={captionOptions} 
            onOptionsChange={handleOptionsChange}
            initialGenerating={isProcessing}
          >
            <GenerationOptionsButton
              label={
                <HStack gap={2}>
                  <Icon as={LuSettings} />
                  <Box>Options</Box>
                </HStack>
              }
              size="sm"
              variant="ghost"
            />
          </GenerationOptionsProvider>
          
          {/* Generate/Regenerate Button */}
          <Button
            size="sm"
            colorScheme={isGenerated ? "gray" : "blue"}
            variant={isGenerated ? "outline" : "solid"}
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            title={buttonTitle}
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