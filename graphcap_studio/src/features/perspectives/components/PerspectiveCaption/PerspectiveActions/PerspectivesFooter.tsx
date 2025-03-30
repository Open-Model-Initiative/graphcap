// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Footer Component
 *
 * This component displays a fixed footer with action controls for perspectives.
 */

import { useColorModeValue } from "@/components/ui/theme/color-mode";
import {
	usePerspectiveUI,
	usePerspectivesData,
} from "@/features/perspectives/context";
import {
	Box,
	Button,
	Flex,
	Icon,
	Text,
	chakra,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo } from "react";
import { LuRefreshCw } from "react-icons/lu";

/**
 * Helper function to determine button title text
 */
const getButtonTitle = (
	selectedProvider: string | undefined,
	activeSchemaName: string | null,
	isProcessing: boolean,
	isGenerated: boolean,
): string => {
	if (!selectedProvider) {
		return "Please select a provider";
	}

	if (!activeSchemaName) {
		return "No perspective selected";
	}

	if (isProcessing) {
		return "Generation in progress";
	}

	return isGenerated ? "Regenerate perspective" : "Generate perspective";
};

/**
 * Footer component with action controls for generating perspectives
 * Uses contexts instead of props to reduce prop drilling
 */
export function PerspectivesFooter() {
	// Use data context
	const {
		availableProviders,
		fetchProviders,
		generatePerspective,
		isGenerating,
		currentImage,
		generationOptions,
	} = usePerspectivesData();

	// Use UI context
	const { activeSchemaName, isLoading, isGenerated } = usePerspectiveUI();

	// Use console.log instead of toast
	const showMessage = useCallback(
		(title: string, message: string, type: string) => {
			console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
		},
		[],
	);

	const bgColor = useColorModeValue("white", "gray.800");
	const borderColor = useColorModeValue("gray.200", "gray.700");
	const infoTextColor = useColorModeValue("gray.600", "gray.400");

	// Log information for debugging
	console.log("GenerationOptions:", generationOptions);
	console.log("Available providers:", availableProviders);
	
	// Get provider information safely
	const { providerName, modelName } = useMemo(() => {
		return {
			providerName: generationOptions.provider_name || "Select Provider",
			modelName: generationOptions.model_name || "Select Model"
		};
	}, [generationOptions.provider_name, generationOptions.model_name]);

	// Fetch providers on component mount
	useEffect(() => {
		fetchProviders().catch((error) => {
			console.error("Failed to fetch providers:", error);
		});
	}, [fetchProviders]);

	// Validation checks for generate button
	const validateGeneration = useCallback(() => {
		if (!activeSchemaName) {
			showMessage(
				"No perspective selected",
				"Please select a perspective to generate",
				"error",
			);
			return false;
		}

		if (!generationOptions.provider_name) {
			showMessage(
				"No provider selected",
				"Please select an inference provider",
				"error",
			);
			return false;
		}

		if (!currentImage) {
			showMessage(
				"No image selected",
				"Please select an image to generate perspective",
				"error",
			);
			return false;
		}

		return true;
	}, [activeSchemaName, generationOptions.provider_name, currentImage, showMessage]);

	// Handle generate button click
	const handleGenerate = useCallback(async () => {
		console.log("Generate button clicked");
		console.log("Active schema:", activeSchemaName);
		console.log("Generation options:", generationOptions);

		if (!validateGeneration()) {
			return;
		}

		try {
			console.log("Calling generatePerspective...");
			// Find the provider object from the available providers using provider_name
			const providerObject = availableProviders.find(p => p.name === generationOptions.provider_name);
			
			if (!providerObject) {
				throw new Error(`Provider "${generationOptions.provider_name}" not found in available providers`);
			}
			
			await generatePerspective(
				activeSchemaName as string,
				currentImage?.path as string,
				providerObject,
				generationOptions
			);
			
			showMessage(
				"Generation started",
				`Generating ${activeSchemaName} perspective`,
				"info",
			);
		} catch (error) {
			console.error("Error generating perspective:", error);
			showMessage(
				"Generation failed",
				error instanceof Error ? error.message : "Unknown error",
				"error",
			);
		}
	}, [
		activeSchemaName,
		availableProviders,
		generatePerspective,
		generationOptions,
		showMessage,
		currentImage,
		validateGeneration,
	]);

	// Combine loading states
	const isProcessing = isLoading || isGenerating;

	// Check if button should be disabled
	const isGenerateDisabled =
		isProcessing || !activeSchemaName || !generationOptions.provider_name;

	// Get title for the generate button
	const buttonTitle = getButtonTitle(
		generationOptions.provider_name,
		activeSchemaName,
		isProcessing,
		isGenerated,
	);

	return (
		<Box
			position="sticky"
			bottom={0}
			left={0}
			right={0}
			py={2}
			px={4}
			bg={bgColor}
			borderTopWidth="1px"
			borderColor={borderColor}
			zIndex={10}
		>
			<Flex justifyContent="space-between" alignItems="center">
				{/* Provider and Model Info */}
				<Text 
					fontSize="sm" 
					color={infoTextColor}
					title="Current provider and model from global settings"
				>
					Using: <chakra.span fontWeight="bold">{providerName}</chakra.span> / <chakra.span fontStyle="italic">{modelName}</chakra.span>
				</Text>
				
				{/* Generate/Regenerate Button */}
				<Button
					size="sm"
					colorScheme={isGenerated ? "gray" : "blue"}
					variant={isGenerated ? "outline" : "solid"}
					onClick={handleGenerate}
					disabled={isGenerateDisabled}
					title={buttonTitle}
				>
					{isGenerating && (
						<Icon
							as={LuRefreshCw}
							mr={2}
							animation="spin 1s linear infinite"
						/>
					)}
					{isGenerated && !isGenerating && <Icon as={LuRefreshCw} mr={2} />}
					{isGenerated ? "Regenerate" : "Generate"}
				</Button>
			</Flex>
		</Box>
	);
}
