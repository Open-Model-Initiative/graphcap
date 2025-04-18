// SPDX-License-Identifier: Apache-2.0
import { Box, Flex, Heading } from "@chakra-ui/react";
import { useProviderFormContext } from "../../context/ProviderFormContext";
import { LoadingMessage } from "./LoadingMessage";
import { ProviderActions } from "./ProviderActions";
import { ProviderConnectionErrorDialog } from "./ProviderConnectionErrorDialog";
import { ProviderConnectionSuccessDialog } from "./ProviderConnectionSuccessDialog";
import { ProviderFormTabs } from "./ProviderFormTabs";
import { AddProviderButton } from "./actions/AddProviderButton";
import { RemoveProviderButton } from "./actions/RemoveProviderButton";
import { ProviderFormSelect } from "./form/ProviderFormSelect";

/**
 * Presentational component for the provider form
 */
export function ProviderFormView() {
	const {
		handleSubmit,
		isSubmitting,
		dialog,
		closeDialog,
		error,
		connectionDetails,
		provider,
	} = useProviderFormContext();
	
	return (
		<form onSubmit={handleSubmit}>
			<Box p={4}>
				{/* Provider Selection Section */}
				<Box mb={4}>
					<Heading as="h3" size="md" mb={2}>Provider Configuration</Heading>
					<Flex gap={4} alignItems="center">
						<Box flex="1">
							<ProviderFormSelect className="w-full" />
						</Box>
						<Flex gap={2}>
							<RemoveProviderButton />
							<AddProviderButton />
						</Flex>
					</Flex>
				</Box>
				
				{/* Provider Form Tabs */}
				<ProviderFormTabs />
				
				<LoadingMessage 
					isSubmitting={isSubmitting}
					saveSuccess={dialog === "success"}
				/>

				<ProviderActions />

				{/* Form Error Dialog */}
				<ProviderConnectionErrorDialog
					isOpen={dialog === "formError"}
					onClose={() => closeDialog()}
					error={error}
					providerName={provider?.name ?? "Provider"}
				/>

				{/* Connection Error Dialog */}
				<ProviderConnectionErrorDialog
					isOpen={dialog === "error"}
					onClose={() => closeDialog()}
					error={error}
					providerName={provider?.name ?? "Provider"}
				/>

				{/* Success Dialog */}
				<ProviderConnectionSuccessDialog
					isOpen={dialog === "success"}
					onClose={() => closeDialog()}
					providerName={provider?.name ?? "Provider"}
					connectionDetails={connectionDetails}
				/>
			</Box>
		</form>
	);
}
