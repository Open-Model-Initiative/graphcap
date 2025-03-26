// SPDX-License-Identifier: Apache-2.0
import {
	Box,
	Button,
	Code,
	Dialog,
	Grid,
	GridItem,
	Icon,
	Portal,
	Text,
} from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { LuTriangleAlert } from "react-icons/lu";

type ErrorDetails = {
	message?: string;
	name?: string;
	details?: string;
	suggestions?: string[];
	requestDetails?: {
		provider: string;
		config: Record<string, unknown>;
	};
} | string | null;

type ProviderConnectionErrorDialogProps = {
	readonly isOpen: boolean;
	readonly onClose: () => void;
	readonly error: ErrorDetails;
	readonly providerName: string;
};

export function ProviderConnectionErrorDialog({
	isOpen,
	onClose,
	error,
	providerName,
}: ProviderConnectionErrorDialogProps) {
	const dialogContentRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleDialogClick(e: MouseEvent) {
			e.stopPropagation();
		}

		const dialogElement = dialogContentRef.current;
		if (dialogElement) {
			dialogElement.addEventListener("click", handleDialogClick);
			return () => {
				dialogElement.removeEventListener("click", handleDialogClick);
			};
		}
	}, []);

	const errorObj = typeof error === 'string' ? { message: error } : error;

	return (
		<Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content maxW="1000px" ref={dialogContentRef}>
						<Dialog.Header>
							<Dialog.Title>
								Error: {providerName}
							</Dialog.Title>
							<Dialog.CloseTrigger asChild>
								<Button variant="ghost" size="sm" aria-label="Close" />
							</Dialog.CloseTrigger>
						</Dialog.Header>

						<Dialog.Body>
							<Box display="flex" flexDirection="column" gap={4}>
								<Box display="flex" alignItems="center" gap={3}>
									<Icon as={LuTriangleAlert} boxSize={6} color="red.500" />
									<Text fontWeight="medium">
										{errorObj?.message || 'An unknown error occurred'}
									</Text>
								</Box>

								{errorObj && typeof errorObj === 'object' && (
									<Grid templateColumns="repeat(2, 1fr)" gap={4}>
										<GridItem>
											<Text fontWeight="medium" mb={2}>Request Details</Text>
											<Code
												p={3}
												borderRadius="md"
												w="full"
												h="full"
												overflowX="auto"
												display="block"
												whiteSpace="pre-wrap"
												fontSize="sm"
											>
												{JSON.stringify(errorObj.requestDetails || {}, null, 2)}
											</Code>
										</GridItem>
										<GridItem>
											<Text fontWeight="medium" mb={2}>Error Details</Text>
											<Code
												p={3}
												borderRadius="md"
												w="full"
												h="full"
												overflowX="auto"
												display="block"
												whiteSpace="pre-wrap"
												fontSize="sm"
											>
												{JSON.stringify({
													name: errorObj.name,
													message: errorObj.message,
													details: errorObj.details,
													suggestions: errorObj.suggestions
												}, null, 2)}
											</Code>
										</GridItem>
									</Grid>
								)}
							</Box>
						</Dialog.Body>

						<Dialog.Footer>
							<Button colorScheme="blue" onClick={onClose}>
								Close
							</Button>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
}
