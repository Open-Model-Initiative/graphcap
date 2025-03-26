// SPDX-License-Identifier: Apache-2.0
import { Box, Button, Flex, Spinner, Text } from "@chakra-ui/react";
import type { Provider, ProviderCreate, ProviderUpdate } from "../../../types";
import { ProviderFormActions } from "../../ProviderFormActions";
import { ProviderFormTabs } from "../../ProviderFormTabs";
import { ProviderConnectionErrorDialog } from "../ProviderConnectionErrorDialog";
import { ProviderConnectionSuccessDialog } from "../ProviderConnectionSuccessDialog";

interface ProviderFormViewProps {
	mode: 'view' | 'edit' | 'create';
	isSubmitting: boolean;
	saveSuccess: boolean;
	isTestingConnection: boolean;
	selectedProvider: Provider | null;
	formError: unknown;
	connectionError: Record<string, unknown> | string | null;
	connectionDetails: Record<string, unknown> | null;
	dialogs: {
		error: boolean;
		success: boolean;
		formError: boolean;
	};
	onSubmit: (data: ProviderCreate | ProviderUpdate) => Promise<void>;
	handleSubmit: (handler: (data: ProviderCreate | ProviderUpdate) => Promise<void>) => (e: React.FormEvent) => void;
	handleTestConnection: () => Promise<void>;
	setMode: (mode: 'view' | 'edit' | 'create') => void;
	closeDialog: (dialog: 'error' | 'success' | 'formError') => void;
}

/**
 * Presentational component for the provider form
 */
export function ProviderFormView({
	mode,
	isSubmitting,
	saveSuccess,
	isTestingConnection,
	selectedProvider,
	formError,
	connectionError,
	connectionDetails,
	dialogs,
	onSubmit,
	handleSubmit,
	handleTestConnection,
	setMode,
	closeDialog,
}: ProviderFormViewProps) {
	const isEditing = mode === "edit";
	const isCreating = mode === "create";

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Box p={4}>
				<ProviderFormTabs />

				{/* Loading/Success Message */}
				<Box mt={4}>
					{isSubmitting && (
						<Box
							p={2}
							bg="blue.50"
							color="blue.800"
							borderRadius="md"
							display="flex"
							alignItems="center"
							justifyContent="center"
							gap={2}
						>
							<Spinner size="sm" />
							<Text>Saving changes...</Text>
						</Box>
					)}

					{!isSubmitting && saveSuccess && (
						<Box
							p={2}
							bg="green.100"
							color="green.800"
							borderRadius="md"
							display="flex"
							alignItems="center"
							justifyContent="center"
						>
							<Text>Provider saved successfully!</Text>
						</Box>
					)}
				</Box>

				{/* Actions */}
				<Flex justify="flex-end" mt={4} gap={2}>
					{isEditing || isCreating ? (
						<ProviderFormActions />
					) : (
						<>
							<Button
								colorScheme="teal"
								variant="outline"
								onClick={handleTestConnection}
								disabled={isTestingConnection || !selectedProvider}
								mr={2}
							>
								{isTestingConnection ? "Testing..." : "Test Connection"}
							</Button>
							<Button colorScheme="blue" onClick={() => setMode("edit")}>
								Edit Provider
							</Button>
						</>
					)}
				</Flex>

				{/* Form Error Dialog */}
				<ProviderConnectionErrorDialog
					isOpen={dialogs.formError}
					onClose={() => closeDialog("formError")}
					error={formError}
					providerName={selectedProvider?.name || "Provider"}
				/>

				{/* Connection Error Dialog */}
				<ProviderConnectionErrorDialog
					isOpen={dialogs.error}
					onClose={() => closeDialog("error")}
					error={connectionError}
					providerName={selectedProvider?.name || "Provider"}
				/>

				{/* Success Dialog */}
				<ProviderConnectionSuccessDialog
					isOpen={dialogs.success}
					onClose={() => closeDialog("success")}
					providerName={selectedProvider?.name || "Provider"}
					connectionDetails={connectionDetails}
				/>
			</Box>
		</form>
	);
}
