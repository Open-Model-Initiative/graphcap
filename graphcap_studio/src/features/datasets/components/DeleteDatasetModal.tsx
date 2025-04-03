import { SERVER_IDS } from "@/features/server-connections/constants";
import { useServerConnections } from "@/features/server-connections/useServerConnections";
import { useDeleteDataset } from "@/services/dataset";
import { toast } from "@/utils/toast";
// SPDX-License-Identifier: Apache-2.0
import {
	AlertDescription,
	Button,
	CloseButton,
	Dialog,
	Icon,
	Portal,
	Text,
} from "@chakra-ui/react";
import { useCallback, useRef, useState } from "react";
import { LuTrash2 } from "react-icons/lu";

type DeleteDatasetModalProps = {
	readonly isOpen: boolean;
	readonly datasetName: string;
	readonly onClose: () => void;
	readonly onDatasetDeleted: () => void;
};

/**
 * A modal dialog for confirming dataset deletion, using Chakra UI Dialog primitives.
 */
export function DeleteDatasetModal({
	isOpen,
	datasetName,
	onClose,
	onDatasetDeleted,
}: DeleteDatasetModalProps) {
	const [error, setError] = useState<string | null>(null);
	
	const { connections } = useServerConnections();
	const mediaServerConnection = connections.find(
		(conn) => conn.id === SERVER_IDS.MEDIA_SERVER,
	);
	const mediaServerUrl = mediaServerConnection?.url ?? "";

	const deleteDatasetMutation = useDeleteDataset(mediaServerUrl);
	const isDeleting = deleteDatasetMutation.isPending;

	// Ref for the button that should receive initial focus (the Cancel button is safer)
	const cancelRef = useRef<HTMLButtonElement>(null);

	/**
	 * Resets error state and calls the onClose prop.
	 */
	const handleCloseAndReset = useCallback(() => {
		setError(null);
		onClose();
	}, [onClose]);

	/**
	 * Calls the delete mutation and handles success/error states.
	 */
	const handleConfirmDelete = async () => {
		setError(null);
		try {
			await deleteDatasetMutation.mutateAsync(datasetName);
			toast.success({ title: `Dataset "${datasetName}" deleted successfully` });
			onDatasetDeleted();
			handleCloseAndReset(); // Close and reset on success
		} catch (err) {
			console.error("Error deleting dataset:", err);
			setError(err instanceof Error ? err.message : "Failed to delete dataset");
		}
	};

	return (
		<Dialog.Root
			open={isOpen}
			// Use onOpenChange to handle closing and state reset
			onOpenChange={(e) => { if (!e.open) handleCloseAndReset(); }}
			initialFocusEl={() => cancelRef.current}
			placement="center"
		>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content>
						<Dialog.Header>
							<Dialog.Title>Delete Dataset</Dialog.Title>
							<Dialog.CloseTrigger asChild>
								<CloseButton size="sm" disabled={isDeleting} />
							</Dialog.CloseTrigger>
						</Dialog.Header>
						<Dialog.Body pb={6}>
							<Text mb={6}>
								Are you sure you want to delete the dataset{" "}
								<Text as="span" fontWeight="semibold">
									{datasetName}
								</Text>
								? This action cannot be undone and all images in this dataset
								will be permanently deleted.
							</Text>

							{error && (
									<AlertDescription>{error}</AlertDescription>
							)}
						</Dialog.Body>

						<Dialog.Footer>
							<Dialog.CloseTrigger asChild>
								<Button ref={cancelRef} mr={3} variant="ghost" disabled={isDeleting}>
									Cancel
								</Button>
							</Dialog.CloseTrigger>
							<Button
								aria-label="Confirm delete dataset"
								bg="red.900"
								color="white"
								onClick={handleConfirmDelete}
								loading={isDeleting}
								disabled={isDeleting}
							>
								Delete Dataset
								<Icon as={LuTrash2} />
							</Button>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
}
