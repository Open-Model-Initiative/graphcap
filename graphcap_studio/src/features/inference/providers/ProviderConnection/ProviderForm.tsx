import { Box, Flex } from "@chakra-ui/react";
// SPDX-License-Identifier: Apache-2.0
import { memo } from "react";
import { useInferenceProviderContext } from "../context";
import { ProviderFormActions } from "./ProviderFormActions";
import { ProviderFormTabs } from "./ProviderFormTabs";
import { ProviderConnectionActions } from "./components/ProviderConnectionActions";
import { ProviderConnectionErrorDialog } from "./components/ProviderConnectionErrorDialog";
import { ProviderConnectionSuccessDialog } from "./components/ProviderConnectionSuccessDialog";
import { useProviderConnection } from "./hooks/useProviderConnection";

/**
 * Container component for the provider form that handles business logic and state management
 */
function ProviderForm() {
	const { selectedProvider, mode } = useInferenceProviderContext();
	const {
		isTestingConnection,
		connectionError,
		connectionDetails,
		dialogs,
		handleTestConnection,
		closeDialog
	} = useProviderConnection(selectedProvider);

	const isEditing = mode === "edit";
	const isCreating = mode === "create";
	
	return (
		<Box p={4}>
			<ProviderFormTabs />

			{/* Actions */}
			<Flex justify="flex-end" mt={4} gap={2}>
				<ProviderConnectionActions
					isTestingConnection={isTestingConnection}
					onTest={handleTestConnection}
					disabled={!selectedProvider}
					showEditButton={!isEditing && !isCreating}
				/>
				{(isEditing || isCreating) && <ProviderFormActions />}
			</Flex>

			{/* Connection Error Dialog */}
			<ProviderConnectionErrorDialog
				isOpen={dialogs.error}
				onClose={() => closeDialog('error')}
				error={connectionError}
				providerName={selectedProvider?.name || "Provider"}
			/>

			{/* Success Dialog */}
			<ProviderConnectionSuccessDialog
				isOpen={dialogs.success}
				onClose={() => closeDialog('success')}
				providerName={selectedProvider?.name || "Provider"}
				connectionDetails={connectionDetails}
			/>
		</Box>
	);
}

export default memo(ProviderForm);
