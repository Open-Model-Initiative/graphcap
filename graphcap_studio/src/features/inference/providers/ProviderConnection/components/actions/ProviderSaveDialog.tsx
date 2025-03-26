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
import { useState } from "react";
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
    mode, 
    handleSubmit, 
    selectedProvider,
    saveError: contextSaveError
  } = useProviderFormContext();
  
  // Local state for dialog visibility and save state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveComplete, setSaveComplete] = useState(false);
  const [savingProvider, setSavingProvider] = useState<Provider | null>(null);
  const [saveError, setSaveError] = useState<string | undefined>(contextSaveError);

  // Get provider service functions
  const { mutateAsync: createProviderAsync, isPending: isCreatingProvider } = useCreateProvider();
  const { mutateAsync: updateProviderAsync, isPending: isUpdatingProvider } = useUpdateProvider();

  // Determine if form is submitting
  const isSubmitting = isContextSubmitting || isSaving || isCreatingProvider || isUpdatingProvider;

  // Determine the button text based on form state
  let buttonText = "Save";
  if (isSubmitting) {
    buttonText = "Saving...";
  } else if (isCreating) {
    buttonText = "Create";
  }

  // Function to close the dialog
  const closeDialog = () => {
    setIsDialogOpen(false);
    setSaveComplete(false);
    setSavingProvider(null);
    setSaveError(undefined);
  };

  // Helper function to normalize rate limits
  const normalizeRateLimits = (data: ProviderCreate | ProviderUpdate) => {
    if (!data.rateLimits) return;
    
    if (Array.isArray(data.rateLimits) || typeof data.rateLimits !== 'object') {
      const currentRateLimits = data.rateLimits as unknown;
      const requestsPerMinute = typeof currentRateLimits === 'object' && currentRateLimits !== null 
        ? (currentRateLimits as Record<string, unknown>).requestsPerMinute as number ?? 0 
        : 0;
      const tokensPerMinute = typeof currentRateLimits === 'object' && currentRateLimits !== null 
        ? (currentRateLimits as Record<string, unknown>).tokensPerMinute as number ?? 0 
        : 0;
        
      data.rateLimits = { requestsPerMinute, tokensPerMinute };
    }
  };

  // Handle form submission errors
  const handleSaveError = (error: unknown) => {
    console.error("Error saving provider:", error);
    if (error instanceof Error) {
      setSaveError(error.message);
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      const errorWithMsg = error as ErrorWithMessage;
      setSaveError(errorWithMsg.message);
    } else {
      setSaveError("An unknown error occurred");
    }
  };

  // Save the provider using the appropriate service function
  const saveProvider = async (data: ProviderCreate | ProviderUpdate): Promise<Provider> => {
    // Make sure API key is included in update requests
    if (!data.apiKey && selectedProvider?.apiKey && mode === 'edit') {
      console.log("Including existing API key in update");
      data.apiKey = selectedProvider.apiKey;
    }
    
    // Log the full data we're sending (redact the actual API key)
    console.log("Sending to server:", {
      ...data,
      apiKey: data.apiKey ? "[PRESENT]" : "[MISSING]",
      mode
    });
    
    try {
      // Edit mode with selected provider
      if (mode === "edit" && selectedProvider?.id) {
        console.log(`Updating provider with id ${selectedProvider.id}`);
        const result = await updateProviderAsync({ 
          id: selectedProvider.id, 
          data: data as ProviderUpdate 
        });
        console.log("Provider updated successfully:", result);
        return result;
      } 
      
      // Create mode
      if (mode === "create") {
        console.log("Creating new provider");
        const result = await createProviderAsync(data as ProviderCreate);
        console.log("Provider created successfully:", result);
        return result;
      }
      
      // Fallback path - has ID in data
      if ('id' in data && data.id) {
        const id = data.id as number;
        console.log(`Updating provider with id ${id}`);
        const result = await updateProviderAsync({ id, data });
        console.log("Provider updated successfully:", result);
        return result;
      } 
      
      // Default create path
      console.log("Creating new provider (fallback path)");
      const result = await createProviderAsync(data as ProviderCreate);
      console.log("Provider created successfully:", result);
      return result;
    } catch (error) {
      handleSaveError(error);
      throw error;
    }
  };

  // Custom submit handler that shows the dialog and processes the form
  const handleFormSubmit = async (e: React.FormEvent) => {
    try {
      setIsSaving(true);
      setIsDialogOpen(true);
      setSaveError(undefined);
      
      // Process the form submission through the form's handleSubmit
      const formHandler = handleSubmit(async (data: ProviderCreate | ProviderUpdate) => {
        try {
          console.log("Provider form submitted:", data);
          
          // Normalize rateLimits - ensure it's an object, not an array
          normalizeRateLimits(data);
          
          // Save the provider
          const result = await saveProvider(data);
          
          // Success - store the provider details and mark as complete
          setSavingProvider(result);
          setSaveComplete(true);
        } catch (error) {
          handleSaveError(error);
        }
      });
      
      // Execute the form handler
      formHandler(e);
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

  // Determine dialog title
  let dialogTitle = "Processing...";
  if (saveError) {
    dialogTitle = "Error Saving Provider";
  } else if (isSaving) {
    dialogTitle = "Saving Provider...";
  } else if (saveComplete) {
    dialogTitle = "Provider Saved";
  }

  // Render dialog body content based on state
  const renderDialogBody = () => {
    if (saveError) {
      return (
        <Box p={4} bg="red.50" color="red.900" borderRadius="md">
          <Text>{saveError || "An unknown error occurred"}</Text>
        </Box>
      );
    }
    
    if (isSaving) {
      return (
        <Box p={4} bg="blue.50" color="blue.900" borderRadius="md" display="flex" alignItems="center" justifyContent="center" flexDirection="column" gap={4}>
          <Spinner size="md" />
          <Text>Saving provider configuration to server...</Text>
          <Text fontSize="sm" color="blue.700">Please wait while we process your request</Text>
        </Box>
      );
    }
    
    if (saveComplete && displayProvider) {
      return (
        <VStack alignItems="stretch" gap={4}>
          <Box p={4} bg="gray.50" borderRadius="md">
            <VStack alignItems="stretch" gap={3}>
              <Text><strong>Name:</strong> {displayProvider.name}</Text>
              <Text><strong>Kind:</strong> {displayProvider.kind}</Text>
              <Text><strong>Environment:</strong> {displayProvider.environment}</Text>
              <Text><strong>Base URL:</strong> {displayProvider.baseUrl}</Text>
              {displayProvider.fetchModels && (
                <Text><strong>Default Model:</strong> {displayProvider.defaultModel ?? "Not set"}</Text>
              )}
            </VStack>
          </Box>
        </VStack>
      );
    }
    
    return (
      <Box p={4} bg="blue.50" color="blue.900" borderRadius="md">
        <Text>Initializing save process...</Text>
      </Box>
    );
  };

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
                <Dialog.Title>{dialogTitle}</Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <CloseButton 
                    size="sm" 
                    disabled={isSaving} 
                    onClick={closeDialog}
                  />
                </Dialog.CloseTrigger>
              </Dialog.Header>
              
              <Dialog.Body>
                {renderDialogBody()}
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