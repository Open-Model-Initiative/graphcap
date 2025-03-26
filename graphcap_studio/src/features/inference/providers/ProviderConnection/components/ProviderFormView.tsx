// SPDX-License-Identifier: Apache-2.0
import { Box } from "@chakra-ui/react";
import { useProviderFormContext } from "../../context/ProviderFormContext";
import { LoadingMessage } from "./LoadingMessage";
import { ProviderActions } from "./ProviderActions";
import { ProviderConnectionErrorDialog } from "./ProviderConnectionErrorDialog";
import { ProviderConnectionSuccessDialog } from "./ProviderConnectionSuccessDialog";
import { ProviderFormTabs } from "./ProviderFormTabs";

/**
 * Presentational component for the provider form
 */
export function ProviderFormView() {
	const {
		onSubmit,
		handleSubmit,
		isSubmitting,
		saveSuccess,
		dialogs,
		closeDialog,
		formError,
		connectionError,
		connectionDetails,
		selectedProvider
	} = useProviderFormContext();

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Box p={4}>
				<ProviderFormTabs />
				
				<LoadingMessage 
					isSubmitting={isSubmitting}
					saveSuccess={saveSuccess}
				/>

				<ProviderActions />

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
