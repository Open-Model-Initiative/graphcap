// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Component
 * 
 * This component displays and manages image perspectives from GraphCap.
 */

import React, { useCallback, useMemo, useEffect } from 'react';
import { 
  usePerspectivesData, 
  usePerspectiveUI
} from './context';
import { EmptyPerspectives } from './components/EmptyPerspectives';
import { Image } from '@/services/images';
import { useServerConnectionsContext } from '@/context';
import { SERVER_IDS } from '@/features/server-connections/constants';
import { Box, Flex } from '@chakra-ui/react';
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
  
  // Get data from perspectives data context
  const {
    isServerConnected,
    generatePerspective,
    selectedProviderId,
    schemas,
    perspectivesError: dataError,
    setCurrentImage,
    currentImage
  } = usePerspectivesData();
  
  // Get server connection status
  const { connections, handleConnect } = useServerConnectionsContext();
  const graphcapServer = connections.find(conn => conn.id === SERVER_IDS.GRAPHCAP_SERVER);
  
  // Get UI state from perspectives UI context
  const {
    activeSchemaName,
    setActiveSchemaName
  } = usePerspectiveUI();
  
  // Effect to update current image in context when image prop changes
  useEffect(() => {
    if (image && (!currentImage || image.path !== currentImage.path)) {
      setCurrentImage(image);
    }
  }, [image, currentImage, setCurrentImage]);
  
  // Effect to set the first schema as active if none is selected
  useEffect(() => {
    if (!activeSchemaName && schemas && Object.keys(schemas).length > 0) {
      setActiveSchemaName(Object.keys(schemas)[0]);
    }
  }, [activeSchemaName, schemas, setActiveSchemaName]);

  const handleOptionsChange = useCallback((newOptions: CaptionOptions) => {
    setOptions(newOptions);
  }, []);
  
  // Options control button - memoized to avoid recreating on every render
  const optionsControl = useMemo(() => ({
    isOpen: showOptions,
    onToggle: () => setShowOptions(!showOptions),
    buttonRef: optionsButtonRef,
    options
  }), [showOptions, options]);

  // Demonstrate using the new unified context for generating a perspective
  const handleGeneratePerspective = useCallback((schemaName: string) => {
    if (image) {
      // Use the new unified generatePerspective method
      generatePerspective(
        schemaName,
        image.path,
        selectedProviderId,
        options
      ).catch(error => {
        console.error(`Error generating perspective "${schemaName}":`, error);
      });
    }
  }, [image, generatePerspective, selectedProviderId, options]);

  // Show error state if there's an error or server is not connected
  if (!isServerConnected) {
    return (
      <Flex direction="column" height="100%" overflow="hidden">
        <PerspectivesErrorState type="connection" />
      </Flex>
    );
  }
  
  if (dataError) {
    return (
      <Flex direction="column" height="100%" overflow="hidden">
        <PerspectivesErrorState 
          type="general"
          error={dataError} 
        />
      </Flex>
    );
  }

  // Show error state if no image is selected
  if (!image) {
    return (
      <Flex direction="column" height="100%" overflow="hidden">
        <PerspectivesErrorState 
          type="general"
          error="No image selected. Please select an image to view perspectives." 
        />
      </Flex>
    );
  }

  // Show empty state if no schemas are available
  if (!schemas || Object.keys(schemas).length === 0) {
    return (
      <Flex direction="column" height="100%" overflow="hidden">
        <EmptyPerspectives />
      </Flex>
    );
  }

  // Additional safeguard to ensure we have activeSchemaName and it refers to a valid schema
  if (!activeSchemaName || !schemas[activeSchemaName]) {
    return (
      <Flex direction="column" height="100%" overflow="hidden" justifyContent="center" alignItems="center">
        <EmptyPerspectives />
      </Flex>
    );
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

