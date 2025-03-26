// SPDX-License-Identifier: Apache-2.0
import { Button, Flex } from "@chakra-ui/react";
import { useInferenceProviderContext } from "../../context";

interface ProviderConnectionActionsProps {
  readonly isTestingConnection: boolean;
  readonly onTest: () => Promise<void>;
  readonly disabled?: boolean;
  readonly showEditButton?: boolean;
}

/**
 * Component for rendering provider connection test actions
 */
export function ProviderConnectionActions({
  isTestingConnection,
  onTest,
  disabled,
  showEditButton = true
}: ProviderConnectionActionsProps) {
  const { setMode } = useInferenceProviderContext();

  return (
    <Flex gap={2}>
      <Button
        colorScheme="teal"
        variant="outline"
        onClick={onTest}
        disabled={disabled || isTestingConnection}
        mr={2}
      >
        {isTestingConnection ? 'Testing...' : 'Test Connection'}
      </Button>
      {showEditButton && (
        <Button colorScheme="blue" onClick={() => setMode("edit")}>
          Edit Provider
        </Button>
      )}
    </Flex>
  );
} 