// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Footer Component
 *
 * This component displays a fixed footer with action controls and navigation for perspectives.
 */

import { useColorModeValue } from "@/components/ui/theme/color-mode";
import {
	usePerspectiveUI,
	usePerspectivesData,
} from "@/features/perspectives/context";
import {
	Button,
	Flex,
	HStack,
	Icon,
	IconButton,
	Text,
} from "@chakra-ui/react";
import { useCallback } from "react";
import { LuChevronLeft, LuChevronRight, LuRefreshCw } from "react-icons/lu";

interface PerspectivesFooterProps {
	readonly isLoading: boolean;
	readonly isGenerated: boolean;
	readonly currentPerspectiveName: string;
	readonly totalPerspectives: number;
	readonly currentIndex: number;
	readonly onNavigate: (index: number) => void;
}

/**
 * Helper function to determine button title text
 */
const getButtonTitle = (
	activeSchemaName: string | null,
	isProcessing: boolean,
	isGenerated: boolean,
): string => {
	if (!activeSchemaName) {
		return "No perspective selected";
	}

	if (isProcessing) {
		return "Generation in progress";
	}

	return isGenerated ? "Regenerate perspective" : "Generate perspective";
};

/**
 * Footer component with action controls and navigation for generating perspectives
 */
export function PerspectivesFooter({
	isLoading,
	isGenerated,
	currentPerspectiveName,
	totalPerspectives,
	currentIndex,
	onNavigate,
}: PerspectivesFooterProps) {
	// Use data context
	const {
		availableProviders,
		generatePerspective,
		isGenerating,
		currentImage,
		generationOptions,
	} = usePerspectivesData();

	// Use UI context
	const { activeSchemaName } = usePerspectiveUI();

	// Use console.log instead of toast
	const showMessage = useCallback(
		(title: string, message: string, type: string) => {
			console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
		},
		[],
	);

	const textColor = useColorModeValue("gray.800", "gray.200");
	const mutedColor = useColorModeValue("gray.600", "gray.400");

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

	// Navigation handlers
	const handlePrevious = () => {
		if (currentIndex > 0) {
			onNavigate(currentIndex - 1);
		}
	};

	const handleNext = () => {
		if (currentIndex < totalPerspectives - 1) {
			onNavigate(currentIndex + 1);
		}
	};

	// Combine loading states
	const isProcessing = isLoading || isGenerating;

	// Check if button should be disabled
	const isGenerateDisabled =
		isProcessing || !activeSchemaName || !generationOptions.provider_name;

	// Get title for the generate button
	const buttonTitle = getButtonTitle(
		activeSchemaName,
		isProcessing,
		isGenerated,
	);

	return (
		<Flex 
			py={2}
			px={4}
			justify="space-between"
			align="center"
		>
			{/* Perspective Name and Navigation */}
			<Flex alignItems="center">

				{totalPerspectives > 1 && (
					<HStack ml={3} gap={1}>
						<Text fontSize="xs" color={mutedColor}>
							{currentIndex + 1}/{totalPerspectives}
						</Text>

						<IconButton
							aria-label="Previous perspective"
							size="xs"
							variant="ghost"
							disabled={isProcessing || currentIndex === 0}
							onClick={handlePrevious}
						>
							<LuChevronLeft />
						</IconButton>

						<IconButton
							aria-label="Next perspective"
							size="xs"
							variant="ghost"
							disabled={isProcessing || currentIndex === totalPerspectives - 1}
							onClick={handleNext}
						>
							<LuChevronRight />
						</IconButton>
					</HStack>
				)}
				<Text 
					fontSize="sm" 
					fontWeight="medium" 
					color={textColor}
					maxWidth="150px"
					overflow="hidden"
					textOverflow="ellipsis"
					whiteSpace="nowrap"
					title={currentPerspectiveName}
				>
					{currentPerspectiveName}
				</Text>
				
			</Flex>
			
			{/* Generate/Regenerate Button */}
			<Flex alignItems="center">
				{isGenerating && (
					<Flex alignItems="center" mr={3}>
						<Icon
							as={LuRefreshCw}
							color={mutedColor}
							animation="spin 1s linear infinite"
							mr={1}
						/>
						<Text fontSize="xs" color={mutedColor}>
							Processing...
						</Text>
					</Flex>
				)}
				
				<Button
					size="sm"
					colorScheme={isGenerated ? "gray" : "blue"}
					variant={isGenerated ? "outline" : "solid"}
					onClick={handleGenerate}
					disabled={isGenerateDisabled}
					title={buttonTitle}
				>
					{isGenerated && <Icon as={LuRefreshCw} mr={2} />}
					{isGenerated ? "Regenerate" : "Generate"}
				</Button>
			</Flex>
		</Flex>
	);
}
