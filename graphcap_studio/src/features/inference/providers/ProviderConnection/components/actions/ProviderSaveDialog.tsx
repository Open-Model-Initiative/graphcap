import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Portal,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
// SPDX-License-Identifier: Apache-2.0
import { useEffect, useState } from "react";
import { useCreateProvider, useUpdateProvider } from "../../../../services/providers";
import { useProviderFormContext } from "../../../context/ProviderFormContext";
import type { Provider, ProviderCreate, ProviderUpdate } from "../../../types";

// Define error type with message property
interface ErrorWithMessage {
  message: string;
  [key: string]: unknown;
}

/**
 * Unified component that combines the save button and save dialog functionality
 */
export function SaveButton() {
  const { 
    isSubmitting: isContextSubmitting, 
    isCreating, 
    handleSubmit, 
    selectedProvider,
    saveError: contextSaveError
  } = useProviderFormContext();
  
  // API mutation hooks
  const createProvider = useCreateProvider();
  const updateProvider = useUpdateProvider();
  
  // Local state for dialog visibility and save state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveComplete, setSaveComplete] = useState(false);
  const [savingProvider, setSavingProvider] = useState<Provider | null>(null);
  const [saveError, setSaveError] = useState<string | undefined>(contextSaveError);

  // Determine if form is submitting
  const isSubmitting = isContextSubmitting || isSaving;

  // Determine the button text based on form state
  const buttonText = isSubmitting 
    ? "Saving..." 
    : isCreating 
      ? "Create" 
      : "Save";

  // Function to close the dialog
  const closeDialog = () => {
    setIsDialogOpen(false);
    setSaveComplete(false);
    setSavingProvider(null);
    setSaveError(undefined);
  };

  // Custom submit handler that shows the dialog and directly calls API
  const handleFormSubmit = async (e: React.FormEvent) => {
    try {
      setIsSaving(true);
      setIsDialogOpen(true);
      setSaveError(undefined);
      
      // Use the form's handleSubmit to get validated data
      await handleSubmit(async (data: ProviderCreate | ProviderUpdate) => {
        try {
          console.log("Provider form submitted:", data);
          
          // Determine if we're creating or updating based on presence of id
          let result: Provider;
          if ('id' in data && data.id) {
            // Update existing provider
            const id = data.id as number;
            console.log(`Updating provider with id ${id}`);
            result = await updateProvider.mutateAsync({ id, data });
            console.log("Provider updated successfully:", result);
          } else {
            // Create new provider
            console.log("Creating new provider");
            result = await createProvider.mutateAsync(data as ProviderCreate);
            console.log("Provider created successfully:", result);
          }
          
          // Success - store the provider details and mark as complete
          setSavingProvider(result);
          setSaveComplete(true);
        } catch (error) {
          console.error("Error saving provider:", error);
          if (error instanceof Error) {
            setSaveError(error.message);
          } else if (typeof error === 'object' && error !== null && 'message' in error) {
            const errorWithMsg = error as ErrorWithMessage;
            setSaveError(errorWithMsg.message);
          } else {
            setSaveError("An unknown error occurred");
          }
        }
      })(e);
    } catch (error) {
      console.error("Form submission error:", error);
      if (error instanceof Error) {
        setSaveError(error.message);
      } else {
        setSaveError("Form validation failed");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Get the current provider to display
  const displayProvider = savingProvider || selectedProvider;

  return (
    <>
      <Button
        type="button"
        onClick={handleFormSubmit}
        disabled={isSubmitting}
        loading={isSubmitting}
        colorScheme="blue"
        bg="blue.500"
        size="md"
        px={5}
        fontWeight="medium"
        boxShadow="sm"
        _hover={{
          bg: "blue.600",
          transform: "translateY(-1px)",
          boxShadow: "md",
        }}
        _active={{
          transform: "translateY(0)",
          boxShadow: "sm",
          opacity: 0.9,
        }}
        _disabled={{
          opacity: 0.6,
          cursor: "not-allowed",
          _hover: { transform: "none" },
        }}
        transition="all 0.2s ease-in-out"
      >
        {buttonText}
      </Button>

      {/* Provider Save Dialog */}
      <Dialog.Root 
        open={isDialogOpen} 
        onOpenChange={(e) => !isSaving && setIsDialogOpen(e.open)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>
                  {saveError ? "Error Saving Provider" : isSaving ? "Saving Provider..." : saveComplete ? "Provider Saved" : "Processing..."}
                </Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <CloseButton 
                    size="sm" 
                    disabled={isSaving} 
                    onClick={closeDialog}
                  />
                </Dialog.CloseTrigger>
              </Dialog.Header>
              
              <Dialog.Body>
                {saveError ? (
                  <Box p={4} bg="red.50" color="red.900" borderRadius="md">
                    <Text>{saveError || "An unknown error occurred"}</Text>
                  </Box>
                ) : isSaving ? (
                  <Box p={4} bg="blue.50" color="blue.900" borderRadius="md" display="flex" alignItems="center" justifyContent="center" flexDirection="column" gap={4}>
                    <Spinner size="md" />
                    <Text>Saving provider configuration to server...</Text>
                    <Text fontSize="sm" color="blue.700">Please wait while we process your request</Text>
                  </Box>
                ) : saveComplete && displayProvider ? (
                  <VStack alignItems="stretch" gap={4}>
                    <Box p={4} bg="gray.50" borderRadius="md">
                      <VStack alignItems="stretch" gap={3}>
                        <Text><strong>Name:</strong> {displayProvider.name}</Text>
                        <Text><strong>Kind:</strong> {displayProvider.kind}</Text>
                        <Text><strong>Environment:</strong> {displayProvider.environment}</Text>
                        <Text><strong>Base URL:</strong> {displayProvider.baseUrl}</Text>
                        {displayProvider.fetchModels && (
                          <Text><strong>Default Model:</strong> {displayProvider.defaultModel || "Not set"}</Text>
                        )}
                      </VStack>
                    </Box>
                  </VStack>
                ) : (
                  <Box p={4} bg="blue.50" color="blue.900" borderRadius="md">
                    <Text>Initializing save process...</Text>
                  </Box>
                )}
              </Dialog.Body>

              <Dialog.Footer>
                <Button 
                  colorScheme={saveError ? "red" : "blue"} 
                  onClick={closeDialog}
                  disabled={isSaving}
                >
                  {saveError ? "Close" : "Done"}
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
} 