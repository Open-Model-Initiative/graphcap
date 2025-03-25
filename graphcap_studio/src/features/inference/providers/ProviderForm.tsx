import { Box, Button, Flex } from "@chakra-ui/react";
// SPDX-License-Identifier: Apache-2.0
import { memo, useState } from "react";
import { useTestProviderConnection } from "../services/providers";
import { FormFields } from "./FormFields";
import { ProviderConnectionErrorDialog } from "./components/ProviderConnectionErrorDialog";
import { ProviderConnectionSuccessDialog } from "./components/ProviderConnectionSuccessDialog";
import { useInferenceProviderContext } from "./context";
import { toServerConfig } from "./types";

// Extended Error interface with cause property
interface ErrorWithCause extends Error {
	cause?: unknown;
}

// Add this interface below the ErrorWithCause interface
interface ErrorWithResponse {
	response?: {
		data?: unknown;
	};
	error?: string;
	message?: string;
}

/**
 * Component for provider form that displays fields in either view or edit mode
 */
function ProviderForm() {
	const { handleSubmit, isSubmitting, onSubmit, onCancel, mode, setMode, selectedProvider } =
		useInferenceProviderContext();
	const [isTestingConnection, setIsTestingConnection] = useState(false);
	const [connectionError, setConnectionError] = useState<Record<string, unknown> | string | null>(null);
	const [connectionDetails, setConnectionDetails] = useState<Record<string, unknown> | null>(null);
	const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
	const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

	const testConnection = useTestProviderConnection();

	const isEditing = mode === "edit";
	const isCreating = mode === "create";
	const isViewMode = mode === "view";

	const handleTestConnection = async () => {
		if (!selectedProvider) return;

		setIsTestingConnection(true);
		setConnectionError(null);

		try {
			const config = toServerConfig(selectedProvider);
			
			const result = await testConnection.mutateAsync({
				providerName: selectedProvider.name,
				config,
			});

			setConnectionDetails(result);
			setIsSuccessDialogOpen(true);
		} catch (error) {
			console.error("Connection test failed:", error);
			
			// Create a user-friendly error object that can be displayed directly
			let errorObj: Record<string, unknown> = {
				title: "Connection failed",
				timestamp: new Date().toISOString()
			};
			
			// Extract error information based on type
			if (error instanceof Error) {
				// Extract useful properties from Error objects
				errorObj.message = error.message;
				errorObj.name = error.name;
				
				// Special case for [object Object] errors
				if (error.message?.includes('[object Object]')) {
					errorObj.message = "Invalid provider configuration";
					errorObj.details = "The server rejected the request due to invalid parameters.";
					errorObj.suggestions = [
						"Check API key and endpoint URL",
						"Verify the provider is correctly configured",
						"Check server logs for more details"
					];
				}
				
				// Check for cause object with additional details
				const errorWithCause = error as ErrorWithCause;
				if (errorWithCause.cause && typeof errorWithCause.cause === 'object') {
					errorObj.errorDetails = errorWithCause.cause;
				}
			} else if (typeof error === 'object' && error !== null) {
				// For direct object errors, merge with our error object
				errorObj = {
					...errorObj,
					...error as Record<string, unknown>
				};
			} else {
				// For primitive errors
				errorObj.message = String(error);
			}
			
			// Set the formatted error object
			setConnectionError(errorObj);
			setIsErrorDialogOpen(true);
		} finally {
			setIsTestingConnection(false);
		}
	};

	return (
		<Box as="form" onSubmit={handleSubmit(onSubmit)} p={4}>
			<FormFields />

			{/* Actions */}
			<Flex justify="flex-end" mt={4} gap={2}>
				{isEditing || isCreating ? (
					<>
						<Button variant="outline" onClick={onCancel}>
							Cancel
						</Button>
						<Button
							colorScheme="blue"
							type="submit"
							loading={isSubmitting}
							loadingText="Saving..."
						>
							{isCreating ? "Create Provider" : "Save Changes"}
						</Button>
					</>
				) : (
					<>
						<Button
							colorScheme="teal"
							variant="outline"
							onClick={handleTestConnection}
							loading={isTestingConnection}
							loadingText="Testing..."
							mr={2}
							disabled={!selectedProvider}
						>
							Test Connection
						</Button>
						<Button colorScheme="blue" onClick={() => setMode("edit")}>
							Edit Provider
						</Button>
					</>
				)}
			</Flex>

			{/* Error Dialog */}
			<ProviderConnectionErrorDialog 
				isOpen={isErrorDialogOpen}
				onClose={() => setIsErrorDialogOpen(false)}
				error={connectionError}
				providerName={selectedProvider?.name || "Provider"}
			/>

			{/* Success Dialog */}
			<ProviderConnectionSuccessDialog
				isOpen={isSuccessDialogOpen}
				onClose={() => setIsSuccessDialogOpen(false)}
				providerName={selectedProvider?.name || "Provider"}
				connectionDetails={connectionDetails}
			/>
		</Box>
	);
}

export default memo(ProviderForm);
