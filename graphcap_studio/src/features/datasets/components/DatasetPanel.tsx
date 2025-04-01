// SPDX-License-Identifier: Apache-2.0

import { Box, Heading, Spinner, Text, VStack } from "@chakra-ui/react";
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
		allDatasets,
		selectedDataset,
		selectedSubfolder,
		isLoadingList,
		datasetError,
	} = useDatasetContext();
	const { navigateToDataset } = useDatasetNavigation();

	return (
		<Box p={4} h="100%">
			<VStack gap={4} align="stretch">
				<Heading size="md">Datasets</Heading>

				<CreateDatasetModal />

				{isLoadingList && (
					<Box textAlign="center" py={4}>
						<Spinner size="md" />
						<Text mt={2}>Loading datasets...</Text>
					</Box>
				)}

				{datasetError && (
					<Text color="red.500">Error loading datasets: {datasetError.message}</Text>
				)}

				{!isLoadingList && !datasetError && allDatasets.length === 0 && (
					<Box textAlign="center" py={4}>
						<Text mb={4}>No datasets available</Text>
						<Text fontSize="sm" color="gray.500">
							Use the button above to create one.
						</Text>
					</Box>
				)}

				{!isLoadingList && !datasetError && allDatasets.length > 0 && (
					<DatasetTree
						datasets={allDatasets}
						selectedDataset={selectedDataset?.name ?? null}
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
