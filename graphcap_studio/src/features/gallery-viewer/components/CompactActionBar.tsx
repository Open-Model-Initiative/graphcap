// SPDX-License-Identifier: Apache-2.0
import { useDatasetContext } from "@/features/datasets/context/DatasetContext";
import {
	ButtonGroup,
	Flex,
	Text,
} from "@chakra-ui/react";
import {
	AddToDatasetAction,
	DeleteAction,
	DownloadAction,
	EditAction,
} from "./actions";

interface CompactActionBarProps {
	readonly currentIndex: number;
	readonly className?: string;
}

/**
 * A compact action bar for image operations using icons
 *
 * @param currentIndex - Current image index
 * @param className - Additional CSS classes
 */
export function CompactActionBar({
	currentIndex,
	className = "",
}: CompactActionBarProps) {
	const {
		selectedDataset,
		selectedImage,
		allDatasets,
	} = useDatasetContext();


	// Derive total images from context
	const totalImages = selectedDataset?.images?.length ?? 0;

	// If no image is selected, show minimal info
	if (!selectedImage) {
		return (
			<Flex
				h="8"
				px="2"
				py="0.5"
				justify="flex-start"
				alignItems="center"
				bg="blackAlpha.700"
				className={className}
			>
				<Text fontSize="xs" color="gray.400">
					{totalImages > 0
						? `${totalImages} images in dataset`
						: "No images selected"}
				</Text>
			</Flex>
		);
	}

	return (
			<Flex
				h="8"
				px="2"
				py="0.5"
				justify="space-between"
				alignItems="center"
				bg="blackAlpha.700"
				className={className}
			>
				{/* Left side - Image info */}
				<Flex alignItems="center" gap="1">
					<Text fontSize="xs" color="gray.300" truncate maxW="200px">
						<Text as="span" fontWeight="medium">
							{selectedImage.name}
						</Text>
						<Text as="span" mx="1" color="gray.500">
							•
						</Text>
						<Text as="span" color="gray.400">
							{currentIndex + 1}/{totalImages}
						</Text>
					</Text>
				</Flex>

				{/* Right side - Actions */}
				<ButtonGroup variant="outline" size="sm" gap="0.5" attached>
					{/* Edit button */} 
					<EditAction selectedImage={selectedImage} />

					{/* Add to dataset button - Logic moved inside */}
					{allDatasets && selectedDataset && (
						<AddToDatasetAction
							selectedImage={selectedImage}
							allDatasets={allDatasets}
							currentDatasetName={selectedDataset.name}
						/>
					)}
					<DownloadAction selectedImage={selectedImage} />

					<DeleteAction selectedImage={selectedImage} />
				</ButtonGroup>
			</Flex>

	);
}
