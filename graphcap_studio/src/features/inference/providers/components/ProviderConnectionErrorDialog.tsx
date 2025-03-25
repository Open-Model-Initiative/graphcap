// SPDX-License-Identifier: Apache-2.0
import {
  Box,
  Button,
  Code,
  Dialog,
  Icon,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { LuTriangleAlert } from "react-icons/lu";

/**
 * Dialog component that displays detailed error information when a provider
 * connection test fails
 */
type ErrorDetails = Record<string, unknown> | string | null;

type ProviderConnectionErrorDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  error: ErrorDetails;
  providerName: string;
};

export function ProviderConnectionErrorDialog({
  isOpen,
  onClose,
  error,
  providerName,
}: ProviderConnectionErrorDialogProps) {
  // Create a reference to the dialog content
  const dialogContentRef = useRef<HTMLDivElement>(null);

  // Prevent clicks inside the dialog from triggering outside click handlers
  useEffect(() => {
    function handleDialogClick(e: MouseEvent) {
      // Stop event propagation for all clicks inside the dialog
      e.stopPropagation();
    }

    const dialogElement = dialogContentRef.current;
    if (dialogElement) {
      dialogElement.addEventListener("click", handleDialogClick);

      return () => {
        dialogElement.removeEventListener("click", handleDialogClick);
      };
    }
  }, []); // No dependencies needed as we're just setting up the event listener

  // Format error details - simplified direct approach
  let formattedErrorDetails = "Unknown error occurred";

  if (error) {
    if (typeof error === "object") {
      try {
        formattedErrorDetails = JSON.stringify(error, null, 2);
      } catch (e) {
        formattedErrorDetails = `Error could not be serialized: ${String(e)}`;
      }
    } else {
      formattedErrorDetails = String(error);
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="600px" ref={dialogContentRef}>
            <Dialog.Header>
              <Dialog.Title>Connection Error: {providerName}</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <Button variant="ghost" size="sm" aria-label="Close" />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body>
              <VStack align="stretch" gap={4}>
                <Box display="flex" alignItems="center" gap={3}>
                  <Icon as={LuTriangleAlert} boxSize={6} color="red.500" />
                  <Text fontWeight="medium">
                    Failed to connect to the provider. Please check your
                    configuration.
                  </Text>
                </Box>

                <Box>
                  <Text fontWeight="medium" mb={2}>
                    Error Details:
                  </Text>
                  <Code
                    p={3}
                    borderRadius="md"
                    w="full"
                    overflowX="auto"
                    display="block"
                    whiteSpace="pre-wrap"
                  >
                    {formattedErrorDetails}
                  </Code>
                </Box>

                <Box>
                  <Text fontWeight="medium" mb={2}>
                    Troubleshooting Tips:
                  </Text>
                  <VStack align="stretch" gap={2} pl={4}>
                    <Text>• Verify API key and endpoint URL are correct</Text>
                    <Text>• Check network connectivity to the provider</Text>
                    <Text>
                      • Ensure your account has access to the requested models
                    </Text>
                  </VStack>
                </Box>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer>
              <Button colorScheme="blue" onClick={onClose}>
                Close
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
