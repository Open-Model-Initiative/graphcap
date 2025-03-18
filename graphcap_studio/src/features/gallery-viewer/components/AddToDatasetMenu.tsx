import { AddButton } from "@/components/ui/buttons";
import { Dataset, Image } from "@/services/images";
import {
	Box,
	Button,
	Flex,
	Popover,
	Portal,
	Stack,
	Text,
} from "@chakra-ui/react";
// SPDX-License-Identifier: Apache-2.0
import { useEffect, useState } from "react";

interface AddToDatasetMenuProps {
	readonly image: Image;
	readonly datasets: Dataset[];
	readonly currentDataset?: string;
	readonly onAddToDataset: (imagePath: string, datasetName: string) => void;
}

/**
 * Dropdown menu for adding images to datasets
 */
export function AddToDatasetMenu({
	image,
	datasets,
	currentDataset,
	onAddToDataset,
}: AddToDatasetMenuProps) {
	const [selectedDataset, setSelectedDataset] = useState<string>("");
	const [isOpen, setIsOpen] = useState(false);

	// Reset selected dataset when datasets change
	useEffect(() => {
		if (datasets && datasets.length > 0 && !selectedDataset) {
			// Default to first dataset that's not the current one
			const defaultDataset =
				datasets.find((d: Dataset) => d.name !== currentDataset)?.name ??
				datasets[0].name;
			setSelectedDataset(defaultDataset);
		}
	}, [datasets, currentDataset, selectedDataset]);

	// Handle add to dataset button click
	const handleAddToDataset = () => {
		if (image && selectedDataset) {
			onAddToDataset(image.path, selectedDataset);
			setIsOpen(false);
		}
	};

	// Handle open state change
	const handleOpenChange = (details: { open: boolean }) => {
		setIsOpen(details.open);
	};

	return (
		<Popover.Root
			open={isOpen}
			onOpenChange={handleOpenChange}
			positioning={{ placement: "bottom-end" }}
		>
			<Popover.Trigger asChild>
				<Box>
					<AddButton size="xs" title="Add to dataset" />
				</Box>
			</Popover.Trigger>
			<Portal>
				<Popover.Positioner>
					<Popover.Content
						width="40"
						p="1"
						fontSize="xs"
						bg="gray.800"
						borderColor="gray.700"
						boxShadow="md"
					>
						<Popover.Arrow>
							<Popover.ArrowTip bg="gray.800" />
						</Popover.Arrow>
						<Box
							px="2"
							py="1"
							fontWeight="medium"
							color="gray.400"
							borderBottomWidth="0"
						>
							Add to dataset:
						</Box>
						<Box px="2" py="1">
							<Stack gap="0.5">
								{datasets
									.filter((dataset: Dataset) => dataset.name !== currentDataset)
									.map((dataset: Dataset) => (
										<Box
											key={dataset.name}
											onClick={() => setSelectedDataset(dataset.name)}
											cursor="pointer"
											p="0.5"
											borderRadius="sm"
											_hover={{ bg: "gray.700" }}
										>
											<Flex gap="2" alignItems="center">
												<Box
													w="3"
													h="3"
													borderRadius="full"
													borderWidth="1px"
													borderColor={
														selectedDataset === dataset.name
															? "blue.500"
															: "gray.500"
													}
													bg={
														selectedDataset === dataset.name
															? "blue.500"
															: "transparent"
													}
												/>
												<Text fontSize="xs" color="gray.300" truncate>
													{dataset.name}
												</Text>
											</Flex>
										</Box>
									))}
							</Stack>
						</Box>
						<Box px="2" py="1" borderTopWidth="1px" borderTopColor="gray.700">
							<Button
								w="full"
								size="xs"
								colorPalette="blue"
								onClick={handleAddToDataset}
								disabled={!selectedDataset}
							>
								Add
							</Button>
						</Box>
					</Popover.Content>
				</Popover.Positioner>
			</Portal>
		</Popover.Root>
	);
}
