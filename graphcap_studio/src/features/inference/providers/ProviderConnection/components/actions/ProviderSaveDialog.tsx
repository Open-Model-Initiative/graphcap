import type {
  Provider
} from "@/types/provider-config-types";
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
import {
  useCreateProvider,
  useUpdateProvider,
} from "../../../../services/providers";
import { useProviderFormContext } from "../../../context/ProviderFormContext";


/**
 * Unified component that combines the save button and save dialog functionality
 */
export function SaveButton() {
	const {
		isSubmitting: isContextSubmitting,
		mode,
		provider: selectedProvider,
		error: contextSaveError,
		handleSubmit,
	} = useProviderFormContext();

	// Local state for dialog visibility and save state
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [saveComplete, setSaveComplete] = useState(false);
	const [savingProvider, setSavingProvider] = useState<Provider | null>(null);
	const [saveError, setSaveError] = useState<string | undefined>(
		contextSaveError?.message,
	);

	// Get provider service functions
	const { isPending: isCreatingProvider } =
		useCreateProvider();
	const { mutateAsync: updateProviderAsync, isPending: isUpdatingProvider } =
		useUpdateProvider();

	// Determine if form is submitting
	const isSubmitting =
		isContextSubmitting || isSaving || isCreatingProvider || isUpdatingProvider;

	// Determine the button text based on form state
	let buttonText = "Save";
	if (isSubmitting) {
		buttonText = "Saving...";
	} else if (mode === "create") {
		buttonText = "Create";
	}

	// Function to close the dialog
	const closeDialog = () => {
		setIsDialogOpen(false);
		setSaveComplete(false);
		setSavingProvider(null);
		setSaveError(undefined);
	};

	// Handle form submission errors

	// Save the provider using the appropriate service function

	// Custom submit handler that shows the dialog and processes the form
	const handleFormSubmit = async (e: React.FormEvent) => {
		try {
			setIsSaving(true);
			setIsDialogOpen(true);
			setSaveError(undefined);
			
			// Try to save the provider using the context handleSubmit
			await handleSubmit(e as React.BaseSyntheticEvent);
			
			// If we get here without errors, it means the form was submitted successfully
			setSaveComplete(true);
			
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
				<Box
					p={4}
					bg="blue.50"
					color="blue.900"
					borderRadius="md"
					display="flex"
					alignItems="center"
					justifyContent="center"
					flexDirection="column"
					gap={4}
				>
					<Spinner size="md" />
					<Text>Saving provider configuration to server...</Text>
					<Text fontSize="sm" color="blue.700">
						Please wait while we process your request
					</Text>
				</Box>
			);
		}

		if (saveComplete && displayProvider) {
			return (
				<VStack alignItems="stretch" gap={4}>
					<Box p={4} bg="gray.50" borderRadius="md">
						<VStack alignItems="stretch" gap={3}>
							<Text>
								<strong>Name:</strong> {displayProvider.name}
							</Text>
							<Text>
								<strong>Kind:</strong> {displayProvider.kind}
							</Text>
							<Text>
								<strong>Environment:</strong> {displayProvider.environment}
							</Text>
							<Text>
								<strong>Base URL:</strong> {displayProvider.baseUrl}
							</Text>
							{displayProvider.fetchModels && (
								<Text>
									<strong>Default Model:</strong>{" "}
									{displayProvider.defaultModel ?? "Not set"}
								</Text>
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

							<Dialog.Body>{renderDialogBody()}</Dialog.Body>

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
