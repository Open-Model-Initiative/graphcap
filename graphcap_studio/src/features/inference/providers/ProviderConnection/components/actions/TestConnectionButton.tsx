// SPDX-License-Identifier: Apache-2.0
import { Button } from "@chakra-ui/react";
import { useProviderFormContext } from "../../../context/ProviderFormContext";

/**
 * Button component for testing provider connection
 */
export function TestConnectionButton() {
  const { isTestingConnection, handleTestConnection, selectedProvider } = useProviderFormContext();

  return (
    <Button
      colorScheme="teal"
      variant="outline"
      onClick={handleTestConnection}
      disabled={isTestingConnection || !selectedProvider}
      mr={2}
    >
      {isTestingConnection ? 'Testing...' : 'Test Connection'}
    </Button>
  );
} 