// SPDX-License-Identifier: Apache-2.0
import { memo, useMemo } from 'react';
import { useServerConnectionsContext } from '../../context/ServerConnectionsContext';
import { ServerConnectionsPanelProps } from '../../types';
import { ServerConnectionItem } from './ServerConnectionItem';
import { CONNECTION_STATUS } from '../../constants';
import {
  Box,
  Button,
  Heading,
  Stack,
  Flex,
  Spinner,
} from '@chakra-ui/react';
import { useColorModeValue } from '@/components/ui/color-mode';

/**
 * Server Connections Panel component
 * 
 * This component displays server connection statuses and controls
 * for the Media Server and GraphCap Server.
 */
export const ServerConnectionsPanel = memo(function ServerConnectionsPanel({ 
  className = '' 
}: ServerConnectionsPanelProps) {
  const { connections, autoConnect, isAutoConnecting } = useServerConnectionsContext();
  const textColor = useColorModeValue('gray.900', 'gray.100');
  
  // Check if there are any disconnected servers that can be connected
  const hasDisconnectedServers = useMemo(() => {
    return connections.some(conn => 
      conn.url && 
      conn.url.trim() !== '' && 
      conn.status !== CONNECTION_STATUS.CONNECTED && 
      conn.status !== CONNECTION_STATUS.TESTING
    );
  }, [connections]);
  
  return (
    <Box w="full" maxW="xs" overflowX="auto" className={className} px={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="sm" color={textColor}>
          Server Connections
        </Heading>
        {hasDisconnectedServers && (
          <Button
            onClick={() => autoConnect()}
            size="xs"
            colorScheme="blue"
            disabled={isAutoConnecting}
            title="Connect to all servers that are not already connected"
          >
            {isAutoConnecting && <Spinner size="xs" mr={2} />}
            {isAutoConnecting ? 'Connecting...' : 'Connect All'}
          </Button>
        )}
      </Flex>
      <Stack gap={4}>
        {connections.map(connection => (
          <ServerConnectionItem
            key={connection.id}
            connectionId={connection.id}
          />
        ))}
      </Stack>
    </Box>
  );
}); 