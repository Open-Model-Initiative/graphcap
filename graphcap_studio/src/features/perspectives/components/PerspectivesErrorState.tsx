// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Error State Component
 * 
 * This component displays different error states for the perspectives feature.
 */

import React from 'react';
import { Box, Center, Heading, Text, Button, Icon } from '@chakra-ui/react';
import { useColorModeValue } from '@/components/ui/theme/color-mode';
import { LuServerOff, LuTriangleAlert, LuRefreshCw } from 'react-icons/lu';
import { useServerConnectionsContext } from '@/context';
import { SERVER_IDS } from '@/features/server-connections/constants';

type ErrorStateType = 'connection' | 'general' | 'empty';

interface PerspectivesErrorStateProps {
  type: ErrorStateType;
  error?: Error | string;
  onReconnect?: () => void;
  onRetry?: () => void;
}

/**
 * Component for displaying different error states in the perspectives feature
 */
export function PerspectivesErrorState({
  type,
  error,
  onReconnect,
  onRetry
}: PerspectivesErrorStateProps) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const { handleConnect } = useServerConnectionsContext();
  
  // Handle connection error
  if (type === 'connection') {
    return (
      <Center height="100%" p={8} bg={bgColor}>
        <Box textAlign="center" maxWidth="500px">
          <Icon as={LuServerOff} boxSize={12} color="red.500" mb={4} />
          <Heading as="h3" size="md" mb={2}>
            Server Connection Error
          </Heading>
          <Text mb={6}>
            Unable to connect to the GraphCap server. Please check your connection settings
            and try again.
          </Text>
          <Button
            colorScheme="blue"
            onClick={() => onReconnect ? onReconnect() : handleConnect(SERVER_IDS.GRAPHCAP_SERVER)}
          >
            <Icon as={LuRefreshCw} mr={2} />
            Reconnect to Server
          </Button>
        </Box>
      </Center>
    );
  }
  
  // Handle general error
  if (type === 'general') {
    const errorMessage = error instanceof Error ? error.message : 
                         typeof error === 'string' ? error : 
                         'An unknown error occurred';
    
    return (
      <Center height="100%" p={8} bg={bgColor}>
        <Box textAlign="center" maxWidth="500px">
          <Icon as={LuTriangleAlert} boxSize={12} color="red.500" mb={4} />
          <Heading as="h3" size="md" mb={2}>
            Error Loading Perspectives
          </Heading>
          <Text mb={2}>
            Something went wrong while loading perspectives.
          </Text>
          <Text fontSize="sm" color="red.500" mb={6}>
            {errorMessage}
          </Text>
          <Button
            colorScheme="blue"
            onClick={() => onRetry ? onRetry() : window.location.reload()}
          >
            <Icon as={LuRefreshCw} mr={2} />
            Retry
          </Button>
        </Box>
      </Center>
    );
  }
  
  // Handle empty state (fallback)
  return (
    <Center height="100%" p={8} bg={bgColor}>
      <Box textAlign="center" maxWidth="500px">
        <Heading as="h3" size="md" mb={2}>
          No Perspectives Available
        </Heading>
        <Text mb={4}>
          There are no perspectives available for this image.
        </Text>
      </Box>
    </Center>
  );
} 