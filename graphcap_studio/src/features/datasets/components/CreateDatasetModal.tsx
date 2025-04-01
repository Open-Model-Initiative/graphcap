import { toast } from "@/utils/toast";
// SPDX-License-Identifier: Apache-2.0
import {
	Button,
	CloseButton,
	Dialog,
	Field,
	Input,
	Portal,
} from "@chakra-ui/react";
import { useCallback, useRef, useState } from "react";
import { useDatasets } from "../hooks/useDatasets";

/**
 * A self-contained modal dialog for creating a new dataset.
 * Renders its own trigger button and manages its open/closed state.
 */
export function CreateDatasetModal() {
	const [isOpen, setIsOpen] = useState(false); // State to control dialog visibility
	const [datasetName, setDatasetName] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isCreating, setIsCreating] = useState(false);

	const { handleCreateDataset } = useDatasets();
	const inputRef = useRef<HTMLInputElement>(null);

	/**
	 * Resets component state (input, error, loading).
	 * Called when the dialog closes.
	 */
	const handleCloseAndReset = useCallback(() => {
		setDatasetName("");
		setError(null);
		setIsCreating(false);
	}, []);

	/**
	 * Validates the dataset name and calls the create dataset handler.
	 */
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!datasetName.trim()) {
			setError("Dataset name is required");
			return;
		}
		if (!/^[a-zA-Z0-9_-]+$/.test(datasetName)) {
			setError(
				"Dataset name can only contain letters, numbers, underscores, and hyphens",
			);
			return;
		}

		setError(null);
		setIsCreating(true);

		try {
			await handleCreateDataset(datasetName);
			setIsOpen(false); // Explicitly close on success
		} catch (error) {
			console.error("Error creating dataset:", error);
			if (error instanceof Error && error.message.includes("409")) {
				toast.info({ title: `Dataset \"${datasetName}\" already exists. Switching to it.` });
				setIsOpen(false); // Explicitly close if dataset already exists
			} else {
				setError(
					error instanceof Error ? error.message : "Failed to create dataset",
				);
				// Don't close on other errors, show the message
			}
		} finally {
			setIsCreating(false);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setDatasetName(e.target.value);
		if (error) {
			setError(null);
		}
	};

	return (
		<Dialog.Root
			open={isOpen} // Control open state
			onOpenChange={(details) => { 
				setIsOpen(details.open); // Update state on change
				if (!details.open) handleCloseAndReset(); // Reset state when closing
			}}
			initialFocusEl={() => inputRef.current}
			placement="center"
		>
			{/* Add the trigger button here */}
			<Dialog.Trigger asChild>
				<Button 
					colorScheme="blue"
					size="sm"
					onClick={() => setIsOpen(true)} // Explicitly open on click
				>
					Create Dataset
				</Button>
			</Dialog.Trigger>

			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content as="form" onSubmit={handleSubmit}>
						<Dialog.Header>
							<Dialog.Title>Create New Dataset</Dialog.Title>
							<Dialog.CloseTrigger asChild>
								<CloseButton size="sm" disabled={isCreating} />
							</Dialog.CloseTrigger>
						</Dialog.Header>
						<Dialog.Body pb={6}>
							<Field.Root id="datasetName" required invalid={!!error}>
								<Field.Label>Dataset Name</Field.Label>
								<Input
									ref={inputRef}
									value={datasetName}
									onChange={handleInputChange}
									placeholder="Enter dataset name"
									disabled={isCreating}
								/>
								{!error ? (
									<Field.HelperText>
										Use only letters, numbers, underscores, and hyphens
									</Field.HelperText>
								) : (
									<Field.ErrorText>{error}</Field.ErrorText>
								)}
							</Field.Root>
						</Dialog.Body>

						<Dialog.Footer>
							<Dialog.CloseTrigger asChild>
								<Button mr={3} variant="ghost" disabled={isCreating}>
									Cancel
								</Button>
							</Dialog.CloseTrigger>
							<Button 
								type="submit"
								colorScheme="blue"
								loading={isCreating}
								loadingText="Creating..."
								disabled={isCreating}
							>
								Create Dataset
							</Button>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
}
