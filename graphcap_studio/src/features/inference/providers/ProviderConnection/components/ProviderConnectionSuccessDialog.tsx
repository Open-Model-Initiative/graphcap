// SPDX-License-Identifier: Apache-2.0
import { 
  Button, 
  Dialog, 
  Icon,
  Portal,
  Text,
  VStack
} from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { LuCheck } from "react-icons/lu";

/**
 * Dialog component that displays a success message when a provider
 * connection test is successful
 */
interface ConnectionDetails {
  models?: unknown[];
  [key: string]: unknown;
}

type ProviderConnectionSuccessDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  providerName: string;
  connectionDetails?: ConnectionDetails | null;
};

export function ProviderConnectionSuccessDialog({ 
  isOpen, 
  onClose, 
  providerName,
  connectionDetails
}: ProviderConnectionSuccessDialogProps) {
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
  
  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content ref={dialogContentRef}>
            <Dialog.Header>
              <Dialog.Title>Connection Successful</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <Button variant="ghost" size="sm" aria-label="Close" />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            
            <Dialog.Body>
              <VStack gap={4} align="center">
                <Icon as={LuCheck} boxSize={8} color="green.500" p={2} bg="green.50" borderRadius="full" />
                <Text fontWeight="medium">Successfully connected to {providerName}!</Text>
                {connectionDetails?.models && (
                  <Text fontSize="sm" color="gray.600">
                    Connection verified with {connectionDetails.models.length} available models.
                  </Text>
                )}
              </VStack>
            </Dialog.Body>
            
            <Dialog.Footer>
              <Button colorScheme="green" onClick={onClose}>Close</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
} 