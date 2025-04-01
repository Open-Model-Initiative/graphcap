// SPDX-License-Identifier: Apache-2.0
import { useState } from "react";
import { useDatasetContext } from "../context/DatasetContext";
import { CreateDatasetModal } from "./CreateDatasetModal";
import { DatasetTree } from "./DatasetTree";
import { useDatasetNavigation } from "./dataset-tree/hooks/useDatasetNavigation";

type DatasetContainerProps = {
	readonly className?: string;
};

/**
 * A container component for dataset navigation and management
 */
export function DatasetContainer({ className = "" }: DatasetContainerProps) {
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const { navigateToDataset } = useDatasetNavigation();

	const {
		datasets,
		currentDataset,
		selectedSubfolder,
	} = useDatasetContext();

	return (
		<div className={`flex flex-col h-full ${className}`}>
			<div className="flex items-center justify-between p-4 border-b border-gray-700">
				<h3 className="text-lg font-semibold">Datasets</h3>
				<button
					type="button"
					onClick={() => setIsCreateModalOpen(true)}
					className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
				>
					New Dataset
				</button>
			</div>

			<div className="flex-grow overflow-auto p-2">
				<DatasetTree
					datasets={datasets}
					selectedDataset={currentDataset || null}
					selectedSubfolder={selectedSubfolder}
					onSelectNode={(datasetId, _subfolder) => {
						navigateToDataset({ id: datasetId, name: datasetId, iconType: 'dataset' });
					}}
				/>
			</div>

			<CreateDatasetModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				onDatasetCreated={(name) => {
					navigateToDataset({ id: name, name: name, iconType: 'dataset' });
					setIsCreateModalOpen(false);
				}}
			/>
		</div>
	);
}
