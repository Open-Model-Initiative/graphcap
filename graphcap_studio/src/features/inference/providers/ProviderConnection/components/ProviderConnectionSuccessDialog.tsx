import type { ConnectionDetails as ContextConnectionDetails } from "@/types/provider-config-types";
// SPDX-License-Identifier: Apache-2.0
import {
	Button,
	Dialog,
	Icon,
	Portal,
	Separator,
	Text,
	VStack,
} from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { LuCheck, LuCircleAlert } from "react-icons/lu";
import { type ConnectionStep, ConnectionSteps } from "./ConnectionSteps";

/**
 * Dialog component that displays connection test results
 */
interface ConnectionDetails {
	result: {
		provider: string;
		details: {
			method?: string;
			models_count?: number;
			chat_completion_test?: "success";
			test_model?: string;
		};
		diagnostics: {
			connection_steps: ConnectionStep[];
			warnings: Array<{
				warning_type: string;
				message: string;
			}>;
		};
	} | boolean;
}

type ProviderConnectionSuccessDialogProps = {
	readonly isOpen: boolean;
	readonly onClose: () => void;
	readonly providerName: string;
	readonly connectionDetails: ConnectionDetails | ContextConnectionDetails | null;
};

const STEP_LABELS: Record<string, string> = {
	initialize_client: "Initialize Client",
	list_models: "List Available Models",
	test_chat_completion: "Test Chat Completion",
};

export function ProviderConnectionSuccessDialog({
	isOpen,
	onClose,
	providerName,
	connectionDetails,
}: ProviderConnectionSuccessDialogProps) {

	// Create a reference to the dialog content
	const dialogContentRef = useRef<HTMLDivElement>(null);

	// Prevent clicks inside the dialog from triggering outside click handlers
	useEffect(() => {
		function handleDialogClick(e: MouseEvent) {
			// Stop event propagation for all clicks inside the dialog
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
  
	// Return early if connectionDetails is null
	if (!connectionDetails) {
		return null;
	}

	const { result } = connectionDetails;
	const steps = result.diagnostics.connection_steps;
	const warnings = result.diagnostics.warnings;
	const details = result.details;

	// Check if any required steps were skipped or failed
	const hasSkippedSteps = steps.some((step) => step.status === "skipped");
	const hasFailedSteps = steps.some((step) => step.status === "failed");
	const allStepsSuccessful = steps.every((step) => step.status === "success");

	// Determine the overall status
	const getStatusInfo = () => {
		if (hasFailedSteps) {
			return {
				title: "Connection Failed",
				icon: LuCircleAlert,
				color: "red.500",
				message: "Connection test failed. Please check the details below.",
			};
		}
		if (hasSkippedSteps) {
			return {
				title: "Connection Partial",
				icon: LuCircleAlert,
				color: "yellow.500",
				message:
					"Connected with limited functionality. Some tests were skipped.",
			};
		}
		return {
			title: "Connection Successful",
			icon: LuCheck,
			color: "green.500",
			message: `Successfully connected to ${providerName}!`,
		};
	};

	const status = getStatusInfo();

	return (
		<Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content ref={dialogContentRef}>
						<Dialog.Header>
							<Dialog.Title>{status.title}</Dialog.Title>
							<Dialog.CloseTrigger asChild>
								<Button variant="ghost" size="sm" aria-label="Close" />
							</Dialog.CloseTrigger>
						</Dialog.Header>

						<Dialog.Body>
							<VStack gap={4} align="stretch">
								<VStack align="center">
									<Icon
										as={status.icon}
										boxSize={8}
										color={status.color}
										p={2}
										bg={`${status.color}10`}
										borderRadius="full"
									/>
									<Text fontWeight="medium">{status.message}</Text>
								</VStack>

								<Separator />
								<ConnectionSteps steps={steps} stepLabels={STEP_LABELS} />

								{warnings.length > 0 && (
									<>
										<Separator />
										<VStack align="stretch" gap={2}>
											<Text fontWeight="medium" color="yellow.600">
												Warnings:
											</Text>
											{warnings.map((warning) => (
												<Text
													key={`${warning.warning_type}-${warning.message}`}
													fontSize="sm"
													color="yellow.600"
												>
													{warning.message}
												</Text>
											))}
										</VStack>
									</>
								)}

								{details.models_count && (
									<Text fontSize="sm" color="gray.600">
										Found {details.models_count} available models
									</Text>
								)}

								{details.test_model && (
									<Text fontSize="sm" color="gray.600">
										Successfully tested chat completion with model:{" "}
										{details.test_model}
									</Text>
								)}
							</VStack>
						</Dialog.Body>

						<Dialog.Footer>
							<Button
								colorScheme={
									allStepsSuccessful
										? "green"
										: hasFailedSteps
											? "red"
											: "yellow"
								}
								onClick={onClose}
							>
								Close
							</Button>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
}
