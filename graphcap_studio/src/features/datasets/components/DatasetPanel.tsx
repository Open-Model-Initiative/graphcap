// SPDX-License-Identifier: Apache-2.0

import { Box, Heading, Spinner, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { useDatasetContext } from "../context/DatasetContext";
import { CreateDatasetModal } from "./CreateDatasetModal";
import { DatasetTree } from "./DatasetTree";
import { useDatasetNavigation } from "./dataset-tree/hooks/useDatasetNavigation";

/**
 * Dataset panel component for the left action panel
 * Displays available datasets and allows for dataset management
 */
export function DatasetPanel() {
	const {
		datasets,
		currentDataset,
		selectedSubfolder,
		isLoadingDatasets,
	} = useDatasetContext();
	const [error] = useState<Error | null>(null);
	const { navigateToDataset } = useDatasetNavigation();

	return (
		<Box p={4} h="100%">
			<VStack gap={4} align="stretch">
				<Heading size="md">Datasets</Heading>

				<CreateDatasetModal />

				{isLoadingDatasets && (
					<Box textAlign="center" py={4}>
						<Spinner size="md" />
						<Text mt={2}>Loading datasets...</Text>
					</Box>
				)}

				{error && (
					<Text color="red.500">Error loading datasets: {error.message}</Text>
				)}

				{!isLoadingDatasets && !error && datasets.length === 0 && (
					<Box textAlign="center" py={4}>
						<Text mb={4}>No datasets available</Text>
						<Text fontSize="sm" color="gray.500">
							Use the button above to create one.
						</Text>
					</Box>
				)}

				{!isLoadingDatasets && !error && datasets.length > 0 && (
					<DatasetTree
						datasets={datasets}
						selectedDataset={currentDataset}
						selectedSubfolder={selectedSubfolder}
						onSelectNode={(datasetId, _subfolder) => {
							navigateToDataset({ id: datasetId, name: datasetId, iconType: 'dataset' });
						}}
					/>
				)}
			</VStack>
		</Box>
	);
}
