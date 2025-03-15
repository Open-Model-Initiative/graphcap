// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Component
 * 
 * This component displays and manages image perspectives from GraphCap.
 */

import React from 'react';
import { usePerspectivesData, usePerspectiveUI } from './context';
import { EmptyPerspectives } from './components/EmptyPerspectives';
import { PerspectiveHeader } from './components/PerspectiveHeader';
import { PerspectiveCardTabbed } from './components/PerspectiveCardTabbed';
import { Image } from '@/services/images';
import { useImagePerspectives } from '@/features/perspectives/hooks';
import { useServerConnectionsContext } from '@/context';
import { SERVER_IDS } from '@/features/server-connections/constants';
import { Box, Button, Center, Stack, Text, Icon, Heading } from '@chakra-ui/react';
import { useColorModeValue } from '@/components/ui/theme/color-mode';
import { LuServerOff, LuTriangleAlert, LuRefreshCw } from 'react-icons/lu';

interface PerspectivesProps {
  image: Image | null;
}

/**
 * Component for displaying and managing image perspectives from GraphCap
 */
export function Perspectives({ image }: PerspectivesProps) {
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
  const isLoading = dataLoading;
  const error = dataError || imageError;

  // Handle loading state
  if (isLoading && isServerConnected) {
    return (
      <Stack direction="column" gap={4}>
        <PerspectiveHeader isLoading={true} />
        <EmptyPerspectives />
      </Stack>
    );
  }

  // Handle server connection error
  if (!isServerConnected) {
    return (
      <Box p={4} bg={useColorModeValue('gray.50', 'gray.800')} borderRadius="lg">
        <Center flexDirection="column" color={useColorModeValue('gray.600', 'gray.400')} textAlign="center">
          <Icon as={LuServerOff} boxSize={12} color={useColorModeValue('yellow.500', 'yellow.400')} mb={2} />
          <Heading as="h3" size="sm" fontWeight="medium" mt={2}>Server Connection Required</Heading>
          <Text mt={1} fontSize="sm">GraphCap Server connection not established</Text>
          <Button 
            mt={3}
            colorScheme="blue"
            size="sm"
            onClick={() => handleConnect(SERVER_IDS.GRAPHCAP_SERVER)}
          >
            Connect to Server
          </Button>
        </Center>
      </Box>
    );
  }

  // Handle other errors
  if (error) {
    return (
      <Box p={4} bg={useColorModeValue('gray.50', 'gray.800')} borderRadius="lg">
        <Center flexDirection="column" color={useColorModeValue('gray.600', 'gray.400')} textAlign="center">
          <Icon as={LuTriangleAlert} boxSize={12} color={useColorModeValue('red.500', 'red.400')} mb={2} />
          <Heading as="h3" size="sm" fontWeight="medium" mt={2}>Error Loading Perspectives</Heading>
          <Text mt={1} fontSize="sm">{error instanceof Error ? error.message : String(error)}</Text>
          <Button 
            mt={3}
            colorScheme="blue"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Center>
      </Box>
    );
  }

  // Handle empty schemas
  if (Object.keys(schemas).length === 0) {
    return (
      <Stack direction="column" gap={4}>
        <PerspectiveHeader isLoading={false} />
        <EmptyPerspectives />
      </Stack>
    );
  }
  
  // Debug captions data
  console.log("Captions data:", captions);
  console.log("Perspectives:", Object.keys(schemas).map(key => {
    return {
      key,
      hasData: !!captions?.perspectives[key],
      content: captions?.perspectives[key]?.content
    };
  }));

  return (
    <Stack direction="column" gap={4}>
      <PerspectiveHeader isLoading={false} />
      <Stack direction="column" gap={6}>
        {Object.entries(schemas).map(([key, schema]) => (
          <PerspectiveCardTabbed
            key={key}
            schema={schema}
            data={captions?.perspectives[key]?.content || null}
            isActive={activeSchemaName === key}
            isGenerated={!!captions?.perspectives[key]}
            onGenerate={() => generatePerspective(key, selectedProviderId)}
            onSetActive={() => setActiveSchemaName(key)}
            providers={availableProviders}
            isGenerating={generatedPerspectives.includes(key) && imageLoading}
            selectedProviderId={selectedProviderId}
            onProviderChange={(providerId) => setSelectedProviderId(providerId)}
          />
        ))}
      </Stack>
    </Stack>
  );
}

