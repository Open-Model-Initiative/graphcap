// SPDX-License-Identifier: Apache-2.0
import { toast } from "@/utils/toast"; // Use the project's toast utility
import {
    Alert,
    AlertDescription, // Keep for displaying errors
    Button,
    CloseButton,
    Dialog, // Use Dialog components
    Icon,
    Portal,
    Text,
} from "@chakra-ui/react";
import { useCallback, useRef, useState } from "react";
import { LuTrash2 } from "react-icons/lu"; // Keep icon

type DeleteImageDialogProps = {
	readonly isOpen: boolean;
	readonly imageName: string | undefined; 
	readonly datasetName: string | undefined; 
	readonly onClose: () => void;
	readonly onConfirmDelete: (
		datasetName: string,
		imageName: string,
	) => Promise<void>;
	readonly isDeleting: boolean; 
};

/**
 * A modal dialog for confirming image deletion, mirroring DeleteDatasetModal structure.
 */
export function DeleteImageDialog({
	isOpen,
	imageName,
	datasetName,
	onClose,
	onConfirmDelete,
	isDeleting,
}: DeleteImageDialogProps) {
	const [error, setError] = useState<string | null>(null);

	// Ref for the button that should receive initial focus
	const cancelRef = useRef<HTMLButtonElement>(null);

	/**
	 * Resets error state and calls the onClose prop.
	 */
	const handleCloseAndReset = useCallback(() => {
		setError(null);
		onClose();
	}, [onClose]);

	/**
	 * Validates inputs and calls the onConfirmDelete prop.
	 * Handles success/error feedback *within* the dialog component.
	 */
	const handleConfirm = async () => {
		if (!imageName || !datasetName) {
			setError("Image or Dataset name is missing.");
			return;
		}
		setError(null); 

		try {
			await onConfirmDelete(datasetName, imageName);
			handleCloseAndReset(); 
		} catch (err) {
			console.error("Error during image deletion confirmation:", err);
			const message =
				err instanceof Error ? err.message : "Failed to delete image";
			setError(message); 
			toast.error({
				title: "Deletion Failed",
				description: message,
			});
		}
	};

	const handleOpenChange = useCallback((details: { open: boolean }) => {
		if (!details.open) {
			handleCloseAndReset();
		}
	}, [handleCloseAndReset]);


	return (
		<Dialog.Root
			open={isOpen}
			onOpenChange={handleOpenChange}
			initialFocusEl={() => cancelRef.current}
			placement="center"
		>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content>
						<Dialog.Header>
							<Dialog.Title>Delete Image</Dialog.Title>
							<Dialog.CloseTrigger asChild>
								<CloseButton size="sm" disabled={isDeleting} />
							</Dialog.CloseTrigger>
						</Dialog.Header>
						<Dialog.Body pb={6}>
							<Text mb={4}> {/* Added margin bottom */}
								Are you sure you want to delete the image{" "}
								<Text as="span" fontWeight="semibold">
									{imageName ?? "this image"}
								</Text>{" "}
								from dataset{" "}
								<Text as="span" fontWeight="semibold">
									{datasetName ?? "this dataset"}
								</Text>
								? This action cannot be undone.
							</Text>

							{error && (
								<Alert.Root status="error">
									<AlertDescription color="red.500">{error}</AlertDescription>
								</Alert.Root>
							)}
						</Dialog.Body>

						<Dialog.Footer>
							{/* Use Dialog.CloseTrigger for the Cancel button */}
							<Dialog.CloseTrigger asChild>
								<Button ref={cancelRef} mr={3} variant="ghost" disabled={isDeleting}>
									Cancel
								</Button>
							</Dialog.CloseTrigger>
							<Button
								aria-label="Confirm delete image"
								bg="red.900" 
								color="white"
								_hover={{ bg: "red.800" }} 
								onClick={handleConfirm}
								loading={isDeleting} 
								disabled={isDeleting} 
							>
								Delete Image
								<Icon as={LuTrash2} ml={2}/> 
							</Button>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
} 