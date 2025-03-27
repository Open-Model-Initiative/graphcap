// SPDX-License-Identifier: Apache-2.0
/**
 * Generation Options Dialog
 *
 * This component displays a dialog with generation options form.
 */

import { Button } from "@/components/ui";
import { useColorModeValue } from "@/components/ui/theme/color-mode";
import { Box, CloseButton, Dialog, Fieldset, Flex, HStack, Portal } from "@chakra-ui/react";
import type React from "react";
import { useGenerationOptions } from "../context";
import {
	GlobalContextField,
	MaxTokensField,
	ModelSelectorField,
	RepetitionPenaltyField,
	ResizeResolutionField,
	TemperatureField,
	TopPField,
} from "./fields";

interface GenerationOptionsDialogProps {
	readonly children: React.ReactNode;
}

/**
 * Dialog component for generation options
 */
export function GenerationOptionsDialog({
	children,
}: GenerationOptionsDialogProps) {
	const { isDialogOpen, closeDialog, resetOptions, isGenerating } =
		useGenerationOptions();

	// Colors for theming
	const bgColor = useColorModeValue("white", "gray.700");
	const borderColor = useColorModeValue("gray.200", "gray.600");
	const headerColor = useColorModeValue("gray.800", "white");

	return (
		<Dialog.Root 
			open={isDialogOpen}
			onOpenChange={(e) => (e.open ? null : closeDialog())}
			size="lg"
		>
			<Dialog.Trigger asChild>{children}</Dialog.Trigger>

			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content
						bg={bgColor}
						borderColor={borderColor}
						shadow="lg"
						w={{ base: "320px", md: "900px", lg: "1200px" }}
						maxW="98vw"
						zIndex={50}
					>
						<Dialog.Header
							fontWeight="medium"
							borderBottomWidth="1px"
							color={headerColor}
							fontSize="sm"
							p={2}
						>
							<Dialog.Title>Generation Options</Dialog.Title>
							<Dialog.CloseTrigger asChild>
								<CloseButton 
									size="sm"
									position="absolute"
									top="2"
									right="2"
									aria-label="Close"
									disabled={isGenerating}
								/>
							</Dialog.CloseTrigger>
						</Dialog.Header>

						<Dialog.Body p={3}>
							<Flex direction="column" gap={2}>
								<Flex gap={4}>
									{/* First column: Model selection */}
									<Box flex="1">
										<Fieldset.Root size="sm" colorPalette="blue">
											<Fieldset.Legend>Provider & Model</Fieldset.Legend>
											<Fieldset.Content pt={1}>
												<ModelSelectorField />
											</Fieldset.Content>
										</Fieldset.Root>
									</Box>
									
									{/* Second column: Generation Parameters */}
									<Box flex="2">
										<Fieldset.Root size="sm" colorPalette="purple">
											<Fieldset.Legend>Generation Parameters</Fieldset.Legend>
											<Fieldset.Content py={1}>
												<Flex direction="column" gap={3}>
													<Box flex="1">
														<TemperatureField />
													</Box>
													<Box flex="1">
														<TopPField />
													</Box>
													<Box flex="1">
														<RepetitionPenaltyField />
													</Box>
													<Box flex="1">
														<MaxTokensField />
													</Box>
												</Flex>
											</Fieldset.Content>
										</Fieldset.Root>
									</Box>
									
									{/* Third column: Image Processing */}
									<Box flex="1">
										<Fieldset.Root size="sm" colorPalette="teal">
											<Fieldset.Legend>Image Processing</Fieldset.Legend>
											<Fieldset.Content py={1}>
												<ResizeResolutionField />
											</Fieldset.Content>
										</Fieldset.Root>
									</Box>
								</Flex>
								
								{/* Global Context Field (spans full width on second row) */}
								<Fieldset.Root size="sm" colorPalette="gray">
									<Fieldset.Legend>Context Settings</Fieldset.Legend>
									<Fieldset.Content py={1}>
										<GlobalContextField />
									</Fieldset.Content>
								</Fieldset.Root>
							</Flex>
						</Dialog.Body>

						<Dialog.Footer p={2} borderTopWidth="1px">
							<HStack gap={2} justify="flex-end">
								<Dialog.ActionTrigger asChild>
									<Button
										size="sm"
										variant="outline"
										onClick={resetOptions}
										disabled={isGenerating}
									>
										Reset to Defaults
									</Button>
								</Dialog.ActionTrigger>
								<Dialog.ActionTrigger asChild>
									<Button
										size="sm"
										onClick={closeDialog}
										disabled={isGenerating}
									>
										Close
									</Button>
								</Dialog.ActionTrigger>
							</HStack>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
} 