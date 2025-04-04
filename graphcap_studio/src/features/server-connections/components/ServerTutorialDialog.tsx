// SPDX-License-Identifier: Apache-2.0
import {
	Box,
	Button,
	Dialog,
	Heading,
	Icon,
	Portal,
	Text,
	Code,
} from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { FiInfo } from "react-icons/fi";

export interface ServerTutorialInfo {
	title: string;
	description: string;
	setupSteps: string[];
	configExample?: Record<string, unknown>;
	additionalInfo?: string;
}

interface ServerTutorialDialogProps {
	readonly isOpen: boolean;
	readonly onClose: () => void;
	readonly serverInfo: ServerTutorialInfo;
}

export function ServerTutorialDialog({
	isOpen,
	onClose,
	serverInfo,
}: ServerTutorialDialogProps) {
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

	return (
		<Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content maxW="800px" ref={dialogContentRef}>
						<Dialog.Header>
							<Dialog.Title>{serverInfo.title}</Dialog.Title>
							<Dialog.CloseTrigger asChild>
								<Button variant="ghost" size="sm" aria-label="Close" />
							</Dialog.CloseTrigger>
						</Dialog.Header>

						<Dialog.Body>
							<Box display="flex" flexDirection="column" gap={4}>
								<Box display="flex" alignItems="flex-start" gap={3}>
									<Icon as={FiInfo} boxSize={6} color="blue.500" mt={1} />
									<Text>{serverInfo.description}</Text>
								</Box>

								<Box>
									<Heading as="h4" size="sm" mb={2}>
										Setup Steps
									</Heading>
									<Box as="ol" pl={0}>
										{serverInfo.setupSteps.map((step, index) => (
											<Box 
												as="li" 
												key={index} 
												display="flex" 
												gap={2}
												mb={2}
											>
												<Text fontWeight="bold" minW="24px">
													{index + 1}.
												</Text>
												<Text>{step}</Text>
											</Box>
										))}
									</Box>
								</Box>

								{serverInfo.configExample && (
									<Box>
										<Heading as="h4" size="sm" mb={2}>
											Configuration Example
										</Heading>
										<Code
											p={3}
											borderRadius="md"
											w="full"
											overflowX="auto"
											display="block"
											whiteSpace="pre-wrap"
											fontSize="sm"
										>
											{JSON.stringify(serverInfo.configExample, null, 2)}
										</Code>
									</Box>
								)}

								{serverInfo.additionalInfo && (
									<Box>
										<Heading as="h4" size="sm" mb={2}>
											Additional Information
										</Heading>
										<Text>{serverInfo.additionalInfo}</Text>
									</Box>
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