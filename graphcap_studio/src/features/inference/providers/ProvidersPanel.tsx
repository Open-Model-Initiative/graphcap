import { useColorMode } from "@/components/ui/theme/color-mode";
import { Box, Button, Center, Flex, Text, VStack } from "@chakra-ui/react";
// SPDX-License-Identifier: Apache-2.0
import { useCallback, useMemo, useState } from "react";
import type { ProviderCreate, ProviderUpdate } from "../providers/types";
import { useProviders } from "../services/providers";
import ProviderForm from "./ProviderConnection/ProviderForm";
import { ProviderSelect } from "./ProviderConnection/form";
import {
	InferenceProviderProvider,
	useInferenceProviderContext,
} from "./context";

/**
 * Panel content that requires context
 */
function PanelContent() {
	const { setMode, providers } =
		useInferenceProviderContext();

	const { colorMode } = useColorMode();
	const textColor = colorMode === "light" ? "gray.600" : "gray.300";
	const borderColor = colorMode === "light" ? "gray.200" : "gray.700";

	// No providers state
	if (providers.length === 0) {
		return (
			<VStack p={4} gap={4}>
				<Text color={textColor}>No providers configured</Text>
				<Button
					colorScheme="blue"
					onClick={() => {
						/* TODO: Handle new provider creation */
					}}
				>
					Add Provider
				</Button>
			</VStack>
		);
	}

	return (
		<Flex direction="column" h="full">
			{/* Header */}
			<Flex
				p={3}
				borderBottom="1px"
				borderColor={borderColor}
				justify="space-between"
				align="center"
				gap={4}
			>
				{/* Provider Selection Dropdown */}
				<Box flex="1">
					<ProviderSelect className="w-full" aria-label="Select Provider" />
				</Box>
				<Button size="sm" colorScheme="blue" onClick={() => setMode("create")}>
					Add Provider
				</Button>
			</Flex>

			{/* Content */}
			<Box flex="1" overflow="auto">
				<ProviderForm />
			</Box>
		</Flex>
	);
}

/**
 * Providers Panel Component
 *
 * This component displays a list of providers and allows viewing and editing
 * provider configurations.
 */
export function ProvidersPanel() {
	const {
		data: providersData = [],
		isLoading,
		isError,
		error,
		refetch
	} = useProviders();

	// State to track form submission
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Set the initial selected provider to the first one in the list
	const initialSelectedProvider = useMemo(() => {
		return providersData.length > 0 ? providersData[0] : null;
	}, [providersData]);

	const { colorMode } = useColorMode();
	const textColor = colorMode === "light" ? "gray.600" : "gray.300";

	// Handle form submission
	const handleSubmit = useCallback(async (data: ProviderCreate | ProviderUpdate) => {
		try {
			console.log("Provider form submitted:", data);
			setIsSubmitting(true);
			
			// Simulate a delay for demonstration purposes
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			// Refetch providers to get updated data
			await refetch();
			console.log("Provider updated successfully:", data);
		} catch (error) {
			console.error("Error updating provider:", error);
		} finally {
			setIsSubmitting(false);
		}
	}, [refetch]);

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
			onSubmit={handleSubmit}
			onCancel={() => {}}
			isSubmitting={isSubmitting}
		>
			<PanelContent />
		</InferenceProviderProvider>
	);
}
