// SPDX-License-Identifier: Apache-2.0
import { memo } from 'react';
import { CONNECTION_STATUS } from '@/features/server-connections/constants';
import { ConnectionActionButtonProps } from '@/features/server-connections/types';
import { Button } from '@chakra-ui/react';

/**
 * ConnectionActionButton component
 * 
 * Displays the appropriate action button based on connection status
 * Uses Chakra UI Button with appropriate variants and color schemes
 */
export const ConnectionActionButton = memo(function ConnectionActionButton({
  status,
  serverName,
  onConnect,
  onDisconnect
}: ConnectionActionButtonProps) {
  if (status === CONNECTION_STATUS.DISCONNECTED) {
    return (
      <Button
        onClick={onConnect}
        size="sm"
        variant="solid"
        colorScheme="green"
        width="100px"
        aria-label={`Connect to ${serverName}`}
      >
        Connect
      </Button>
    );
  }
  
  if (status === CONNECTION_STATUS.CONNECTED) {
    return (
      <Button
        onClick={onDisconnect}
        size="sm"
        variant="solid"
        colorScheme="red"
        width="100px"
        aria-label={`Disconnect from ${serverName}`}
      >
        Disconnect
      </Button>
    );
  }
  
  // For testing or error states, show a disabled button
  return (
    <Button
      size="sm"
      disabled
      variant="outline"
      width="100px"
      colorScheme="gray"
      aria-label={`Connection action unavailable for ${serverName}`}
    >
      {status === CONNECTION_STATUS.TESTING ? 'Testing...' : 'Error'}
    </Button>
  );
}); 