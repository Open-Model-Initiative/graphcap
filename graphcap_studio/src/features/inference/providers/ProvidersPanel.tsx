import { useColorMode } from "@/components/ui/theme/color-mode";
import { Box, Center, Flex, Text } from "@chakra-ui/react";
// SPDX-License-Identifier: Apache-2.0
import { useMemo } from "react";
import { useProviders } from "../services/providers";
import { ProviderConnection } from "./ProviderConnection";
import {
	InferenceProviderProvider,
} from "./context";

/**
 * Panel content that requires context
 */
function PanelContent() {

	return (
		<Flex direction="column" h="full">
			{/* Content */}
			<Box flex="1" overflow="auto">
				<ProviderConnection />
			</Box>
		</Flex>
	);
}

/**
 * Providers Panel Component
 *
 * This component displays provider configurations in a panel.
 * It acts as a container for the provider connection form.
 */
export function ProvidersPanel() {
	const {
		data: providersData = [],
		isLoading,
		isError,
		error,
	} = useProviders();

	// Set the initial selected provider to the first one in the list
	const initialSelectedProvider = useMemo(() => {
		return providersData.length > 0 ? providersData[0] : null;
	}, [providersData]);

	const { colorMode } = useColorMode();
	const textColor = colorMode === "light" ? "gray.600" : "gray.300";

	// Loading state
	if (isLoading) {
		return (
			<Center p={4}>
				<Text color={textColor}>Loading providers...</Text>
			</Center>
		);
	}

	// Error state
	if (isError) {
		return (
			<Center p={4}>
				<Text color="red.500">Error loading providers: {error?.message}</Text>
			</Center>
		);
	}

	return (
		<InferenceProviderProvider
			providers={providersData}
			selectedProvider={initialSelectedProvider}
			isCreating={false}
			onCancel={() => {}}
		>
			<PanelContent />
		</InferenceProviderProvider>
	);
}
