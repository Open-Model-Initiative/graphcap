// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Component
 * 
 * This component displays and manages image perspectives from GraphCap.
 */

import React, { useCallback, useMemo } from 'react';
import { usePerspectivesData, usePerspectiveUI } from './context';
import { EmptyPerspectives } from './components/EmptyPerspectives';
import { Image } from '@/services/images';
import { useImagePerspectives } from '@/features/perspectives/hooks';
import { useServerConnectionsContext } from '@/context';
import { SERVER_IDS } from '@/features/server-connections/constants';
import { Box, Flex, Icon, Button } from '@chakra-ui/react';
import { LuSettings } from 'react-icons/lu';
import { GenerationOptionForm, DEFAULT_OPTIONS } from './components/PerspectiveActions/GenerationOptionForm';
import { CaptionOptions } from './types';
import { PerspectivesPager } from './components/PerspectiveNavigation/PerspectivesPager';
import { PerspectivesErrorState } from './components/PerspectivesErrorState';

interface PerspectivesProps {
  image: Image | null;
}

/**
 * Component for displaying and managing image perspectives from GraphCap
 */
export function Perspectives({ image }: PerspectivesProps) {
  // Local state for generation options
  const [showOptions, setShowOptions] = React.useState(false);
  const [options, setOptions] = React.useState<CaptionOptions>(DEFAULT_OPTIONS);
  const optionsButtonRef = React.useRef<HTMLButtonElement>(null);
  
  // Get server connection status
  const { connections, handleConnect } = useServerConnectionsContext();
  const graphcapServer = connections.find(conn => conn.id === SERVER_IDS.GRAPHCAP_SERVER);
  
  // Get data from the perspectives data context
  const {
    perspectives,
    schemas,
    isLoading: dataLoading,
    isServerConnected,
    error: dataError
  } = usePerspectivesData();

  // Get UI state from the perspectives UI context
  const {
    activeSchemaName,
    setActiveSchemaName,
    selectedProviderId,
    setSelectedProviderId
  } = usePerspectiveUI();

  // Get image-specific perspective data
  const {
    captions,
    isLoading: imageLoading,
    error: imageError,
    generatePerspective,
    availableProviders,
    generatedPerspectives,
  } = useImagePerspectives(image);

  // Combined loading and error states
  const isLoading = dataLoading || imageLoading;
  const error = dataError || imageError;

  // Handler for updating options with memoization to avoid recreating the function
  const handleOptionsChange = useCallback((newOptions: CaptionOptions) => {
    setOptions(newOptions);
  }, []);

  // Handler for generating perspective with options - memoized to avoid recreating on every render
  const handleGeneratePerspective = useCallback((schemaKey: string) => {
    generatePerspective(schemaKey, selectedProviderId, options);
    // Close options menu after generation
    setShowOptions(false);
  }, [generatePerspective, selectedProviderId, options]);

  // Handler for provider change
  const handleProviderChange = useCallback((providerId: number | undefined) => {
    setSelectedProviderId(providerId);
  }, [setSelectedProviderId]);
  
  // Options control button - memoized to avoid recreating on every render
  const optionsControl = useMemo(() => ({
    isOpen: showOptions,
    onToggle: () => setShowOptions(!showOptions),
    buttonRef: optionsButtonRef
  }), [showOptions]);

  // Show error state if there's an error or server is not connected
  if (!isServerConnected) {
    return (
      <Flex direction="column" height="100%" overflow="hidden">
        <PerspectivesErrorState type="connection" />
      </Flex>
    );
  }
  
  if (error) {
    return (
      <Flex direction="column" height="100%" overflow="hidden">
        <PerspectivesErrorState 
          type="general"
          error={error} 
        />
      </Flex>
    );
  }

  // Show empty state if no image is selected or no schemas are available
  if (!image || !schemas || Object.keys(schemas).length === 0) {
    return (
      <Flex direction="column" height="100%" overflow="hidden">
        <EmptyPerspectives />
      </Flex>
    );
  }

  // Set the first schema as active if none is selected
  if (!activeSchemaName && Object.keys(schemas).length > 0) {
    setActiveSchemaName(Object.keys(schemas)[0]);
    return null; // Return null to avoid rendering with undefined activeSchemaName
  }

  return (
    <Flex 
      direction="column" 
      height="100%" 
      overflow="hidden" 
      position="relative"
      p={0}
    >
      {/* Main Content */}
      <PerspectivesPager
        schemas={schemas}
        activeSchemaName={activeSchemaName || ''}
        selectedProviderId={selectedProviderId}
        captions={captions}
        generatedPerspectives={generatedPerspectives}
        availableProviders={availableProviders}
        isLoading={isLoading}
        onGenerate={handleGeneratePerspective}
        onSetActiveSchema={setActiveSchemaName}
        onProviderChange={handleProviderChange}
        optionsControl={optionsControl}
      />
      
      {/* Generation Options Dialog */}
      {showOptions && (
        <Box
          position="absolute"
          top={optionsButtonRef.current ? optionsButtonRef.current.offsetHeight + 10 : 10}
          right={4}
          zIndex={20}
          width="300px"
          boxShadow="lg"
          borderRadius="md"
        >
          <GenerationOptionForm
            options={options}
            onChange={handleOptionsChange}
            onClose={() => setShowOptions(false)}
          />
        </Box>
      )}
    </Flex>
  );
}

