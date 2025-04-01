import type { Dataset } from "@/types";
// SPDX-License-Identifier: Apache-2.0
import type { ReactNode } from "react";
import { DatasetProvider } from "../context/DatasetContext";
import { useDatasets } from "../hooks/useDatasets";

type DatasetInitializerProps = {
	readonly children: ReactNode;
};

/**
 * A component that initializes the DatasetContext with data from the API
 *
 * This component fetches dataset data and initializes the DatasetProvider
 * with the fetched data. It shows a loading indicator while data is being fetched.
 *
 * @param children - The child components to render
 */
export function DatasetInitializer({ children }: DatasetInitializerProps) {
	// Fetch datasets data
	const {
		datasetsData,
		selectedDataset,
		selectedSubfolder,
		handleAddToDataset,
		isLoading,
	} = useDatasets();

	// Extract datasets array from datasetsData if available
	const datasets = datasetsData?.datasets || [];

	// Determine the current dataset name
	let currentDataset = "";
	if (typeof selectedDataset === "string") {
		currentDataset = selectedDataset;
	} else if (
		selectedDataset &&
		typeof selectedDataset === "object" &&
		"name" in selectedDataset
	) {
		currentDataset = (selectedDataset as Dataset).name;
	}

	// Show loading indicator while data is being fetched
	if (isLoading) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				Loading datasets...
			</div>
		);
	}

	return (
		<DatasetProvider
			initialDatasets={datasets}
			initialCurrentDataset={currentDataset}
			initialSelectedSubfolder={selectedSubfolder}
			onAddToDataset={handleAddToDataset}
		>
			{children}
		</DatasetProvider>
	);
}
