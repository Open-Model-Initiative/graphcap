import { useDeleteDataset } from "@/services/dataset";
import { toast } from "@/utils/toast";
// SPDX-License-Identifier: Apache-2.0
import { useState } from "react";

type DeleteDatasetModalProps = {
	readonly isOpen: boolean;
	readonly datasetName: string;
	readonly onClose: () => void;
	readonly onDatasetDeleted: () => void;
};

/**
 * A modal component for confirming dataset deletion
 */
export function DeleteDatasetModal({
	isOpen,
	datasetName,
	onClose,
	onDatasetDeleted,
}: DeleteDatasetModalProps) {
	const [error, setError] = useState<string | null>(null);

	// Use the dataset deletion mutation
	const deleteDatasetMutation = useDeleteDataset();
	const isDeleting = deleteDatasetMutation.isPending;

	if (!isOpen) return null;

	const handleConfirmDelete = async () => {
		setError(null);

		try {
			await deleteDatasetMutation.mutateAsync(datasetName);
			toast.success({ title: `Dataset "${datasetName}" deleted successfully` });
			onDatasetDeleted();
			onClose();
		} catch (error) {
			console.error("Error deleting dataset:", error);
			setError(
				error instanceof Error ? error.message : "Failed to delete dataset",
			);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div className="w-full max-w-md rounded-lg bg-gray-800 p-6 shadow-xl">
				<h2 className="mb-4 text-xl font-semibold text-white">
					Delete Dataset
				</h2>

				<p className="mb-6 text-gray-300">
					Are you sure you want to delete the dataset{" "}
					<span className="font-semibold text-white">{datasetName}</span>? This
					action cannot be undone and all images in this dataset will be
					permanently deleted.
				</p>

				{error && <p className="mb-4 text-sm text-red-400">{error}</p>}

				<div className="flex justify-end space-x-2">
					<button
						type="button"
						className="rounded-md bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-600"
						onClick={onClose}
						disabled={isDeleting}
					>
						Cancel
					</button>
					<button
						type="button"
						className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500 disabled:opacity-50"
						onClick={handleConfirmDelete}
						disabled={isDeleting}
					>
						{isDeleting ? "Deleting..." : "Delete Dataset"}
					</button>
				</div>
			</div>
		</div>
	);
}
