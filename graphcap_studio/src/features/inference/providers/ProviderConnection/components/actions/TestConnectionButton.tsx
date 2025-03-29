// SPDX-License-Identifier: Apache-2.0
import { Button } from "@chakra-ui/react";
import { useProviderFormContext } from "../../../context/ProviderFormContext";

/**
 * Button component for testing provider connection
 */
export function TestConnectionButton() {
  const { isSubmitting, testConnection, provider } = useProviderFormContext();

  return (
    <Button
      colorScheme="teal"
      variant="outline"
      onClick={testConnection}
      disabled={isSubmitting || !provider}
      mr={2}
    >
      {isSubmitting ? 'Testing...' : 'Test Connection'}
    </Button>
  );
} 