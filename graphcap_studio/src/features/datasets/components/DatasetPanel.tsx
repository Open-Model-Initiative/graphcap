// SPDX-License-Identifier: Apache-2.0

import { Box, Heading, Spinner, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { useDatasetContext } from "../context/DatasetContext";
import { DatasetTree } from "./DatasetTree";

/**
 * Dataset panel component for the left action panel
 * Displays available datasets and allows for dataset management
 */
export function DatasetPanel() {
	const {
		datasets,
		currentDataset,
		selectedSubfolder,
		setCurrentDataset,
		setSelectedSubfolder,
	} = useDatasetContext();
	const [isLoading] = useState(false);
	const [error] = useState<Error | null>(null);

	const handleSelectNode = (datasetName: string, subfolder?: string) => {
		setCurrentDataset(datasetName);
		setSelectedSubfolder(subfolder ?? null);
	};

	return (
		<Box p={4} h="100%">
			<VStack gap={4} align="stretch">
				<Heading size="md">Datasets</Heading>

				{isLoading && (
					<Box textAlign="center" py={4}>
						<Spinner size="md" />
						<Text mt={2}>Loading datasets...</Text>
					</Box>
				)}

				{error && (
					<Text color="red.500">Error loading datasets: {error.message}</Text>
				)}

				{!isLoading && !error && datasets.length === 0 && (
					<Box textAlign="center" py={4}>
						<Text mb={4}>No datasets available</Text>
						<Text fontSize="sm" color="gray.500">
							Create a new dataset to get started
						</Text>
					</Box>
				)}

				{!isLoading && !error && datasets.length > 0 && (
					<DatasetTree
						datasets={datasets}
						selectedDataset={currentDataset}
						selectedSubfolder={selectedSubfolder}
						onSelectNode={handleSelectNode}
					/>
				)}
			</VStack>
		</Box>
	);
}
