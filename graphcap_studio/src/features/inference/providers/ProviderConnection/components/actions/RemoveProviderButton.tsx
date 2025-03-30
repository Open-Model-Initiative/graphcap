import { denormalizeProviderId } from "@/types/provider-config-types";
// SPDX-License-Identifier: Apache-2.0
import {
    Button,
    CloseButton,
    Dialog,
    Portal,
    Text,
    useDisclosure
} from "@chakra-ui/react";
import { useRef } from "react";
import { useDeleteProvider } from "../../../../services/providers";
import { useProviderFormContext } from "../../../context/ProviderFormContext";

/**
 * Button to remove a provider with confirmation dialog
 */
export function RemoveProviderButton() {
  const { provider, setProvider } = useProviderFormContext();
  const { open, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const deleteProvider = useDeleteProvider();

  // Only show the button if we don't have a provider or the provider doesn't have an ID
  if (!provider?.id) {
    return null;
  }

  const handleRemoveProvider = async () => {
    try {
      // Ensure we have a provider ID
      const providerId = typeof provider.id === 'string' 
        ? denormalizeProviderId(provider.id) 
        : provider.id;

      await deleteProvider.mutateAsync(providerId);
      
      setProvider(null);
      
      onClose();
      
      console.log(`Provider "${provider.name}" successfully removed`);
    } catch (error) {
      console.error("Failed to delete provider:", error);
    }
  };

  return (
    <>
      <Button
        bg="red.900"
        variant="outline"
        size="sm"
        onClick={onOpen}
        data-testid="remove-provider-button"
      >
        Remove
      </Button>

      <Dialog.Root
        open={open}
        onOpenChange={() => !deleteProvider.isPending && onClose()}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Remove Provider</Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <CloseButton
                    size="sm"
                    disabled={deleteProvider.isPending}
                  />
                </Dialog.CloseTrigger>
              </Dialog.Header>

              <Dialog.Body>
                <Text>
                  Are you sure you want to remove the provider "{provider.name}"? 
                  This action cannot be undone.
                </Text>
              </Dialog.Body>

              <Dialog.Footer>
                <Button 
                  ref={cancelRef} 
                  onClick={onClose}
                  disabled={deleteProvider.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  colorScheme="red" 
                  onClick={handleRemoveProvider} 
                  ml={3}
                  loading={deleteProvider.isPending}
                  loadingText="Removing..."
                >
                  Remove
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
} 