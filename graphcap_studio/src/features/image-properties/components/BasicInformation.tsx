import { Field } from "@/components/ui/field";
import {
	SelectContent,
	SelectItem,
	SelectRoot,
	SelectTrigger,
} from "@/components/ui/select";
import { useColorModeValue } from "@/components/ui/theme/color-mode";
// SPDX-License-Identifier: Apache-2.0
import type { SelectValueChangeDetails } from "@chakra-ui/react";
import {
	Box,
	Button,
	Tag as ChakraTag,
	Flex,
	Heading,
	Input,
	Text,
	Textarea,
	createListCollection,
} from "@chakra-ui/react";
import { useImagePropertiesContext } from "../context/ImagePropertiesContext";

/**
 * Component for displaying and editing basic image information
 *
 * Uses the ImagePropertiesContext to manage state and actions.
 */
export function BasicInformation() {
	// Get state and actions from context
	const {
		properties,
		isEditing,
		newTag,
		setNewTag,
		handleAddTag,
		handleRemoveTag,
		handlePropertyChange,
		handleSave,
		toggleEditing,
	} = useImagePropertiesContext();

	// Early return if properties are not loaded (context handles loading state)
	if (!properties) {
		return null;
	}

	const bgColor = useColorModeValue("gray.50", "gray.800");
	const borderColor = useColorModeValue("gray.200", "gray.700");
	const labelColor = useColorModeValue("gray.600", "gray.400");
	const textColor = useColorModeValue("gray.800", "gray.200");

	const ratingItems = [
		{ label: "Not rated", value: "0" },
		{ label: "★", value: "1" },
		{ label: "★★", value: "2" },
		{ label: "★★★", value: "3" },
		{ label: "★★★★", value: "4" },
		{ label: "★★★★★", value: "5" },
	];

	const ratingCollection = createListCollection({
		items: ratingItems,
	});

	// Use context action for property change
	const handleRatingChange = (
		details: SelectValueChangeDetails<(typeof ratingItems)[0]>,
	) => {
		// Convert string value back to number for the context handler
		const ratingValue = Number.parseInt(details.value[0], 10);
		handlePropertyChange("rating", Number.isNaN(ratingValue) ? 0 : ratingValue);
	};

	return (
		<Box
			borderRadius="lg"
			bg={bgColor}
			p={4}
			shadow="sm"
			borderWidth="1px"
			borderColor={borderColor}
		>
			<Flex mb={2} alignItems="center" justifyContent="space-between">
				<Heading size="sm" color={textColor}>
					Basic Information
				</Heading>
				<Button
					variant="ghost"
					size="sm"
					colorScheme="blue"
					onClick={toggleEditing}
				>
					{isEditing ? "Cancel" : "Edit"}
				</Button>
			</Flex>

			{isEditing ? (
				<Box>
					<Field label="Title">
						<Input
							value={properties.title}
							onChange={(e) => handlePropertyChange("title", e.target.value)}
							size="sm"
						/>
					</Field>

					<Field label="Description" mt={3}>
						<Textarea
							value={properties.description}
							onChange={(e) =>
								handlePropertyChange("description", e.target.value)
							}
							size="sm"
							rows={3}
						/>
					</Field>

					<Field label="Rating" mt={3}>
						<SelectRoot
							value={[properties.rating.toString()]}
							onValueChange={handleRatingChange}
							collection={ratingCollection}
						>
							<SelectTrigger>
								{properties.rating
									? "★".repeat(properties.rating)
									: "Not rated"}
							</SelectTrigger>
							<SelectContent>
								{ratingItems.map((item) => (
									<SelectItem key={item.value} item={item}>
										{item.label}
									</SelectItem>
								))}
							</SelectContent>
						</SelectRoot>
					</Field>

					<Field label="Tags" mt={3}>
						<Flex>
							<Input
								value={newTag}
								onChange={(e) => setNewTag(e.target.value)}
								placeholder="Add a tag"
								size="sm"
								onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
								borderEndRadius={0}
							/>
							<Button
								onClick={handleAddTag}
								size="sm"
								colorScheme="blue"
								borderStartRadius={0}
							>
								Add
							</Button>
						</Flex>
						<Flex mt={2} gap={2} flexWrap="wrap">
							{properties.tags.map((tag: string) => (
								<ChakraTag.Root
									key={tag}
									size="sm"
									variant="subtle"
									colorScheme="blue"
								>
									<ChakraTag.Label>{tag}</ChakraTag.Label>
									<ChakraTag.EndElement>
										<ChakraTag.CloseTrigger
											onClick={() => handleRemoveTag(tag)}
										/>
									</ChakraTag.EndElement>
								</ChakraTag.Root>
							))}
						</Flex>
					</Field>

					<Button
						onClick={handleSave}
						colorScheme="blue"
						width="full"
						mt={4}
						size="sm"
					>
						Save Changes
					</Button>
				</Box>
			) : (
				<Box>
					<Box mb={2}>
						<Text fontSize="sm" fontWeight="medium" color={labelColor}>
							Title:
						</Text>
						<Text fontSize="sm" color={textColor}>
							{properties.title || "No title"}
						</Text>
					</Box>
					<Box mb={2}>
						<Text fontSize="sm" fontWeight="medium" color={labelColor}>
							Description:
						</Text>
						<Text fontSize="sm" color={textColor}>
							{properties.description || "No description"}
						</Text>
					</Box>
					<Box mb={2}>
						<Text fontSize="sm" fontWeight="medium" color={labelColor}>
							Rating:
						</Text>
						<Text fontSize="sm" color={textColor}>
							{properties.rating ? "★".repeat(properties.rating) : "Not rated"}
						</Text>
					</Box>
					<Box>
						<Text fontSize="sm" fontWeight="medium" color={labelColor}>
							Tags:
						</Text>
						<Flex mt={1} gap={1} flexWrap="wrap">
							{properties.tags.length > 0 ? (
								properties.tags.map((tag: string) => (
									<ChakraTag.Root
										key={tag}
										size="sm"
										variant="subtle"
										colorScheme="blue"
									>
										<ChakraTag.Label>{tag}</ChakraTag.Label>
									</ChakraTag.Root>
								))
							) : (
								<Text fontSize="sm" color="gray.500">
									No tags
								</Text>
							)}
						</Flex>
					</Box>
				</Box>
			)}
		</Box>
	);
}
