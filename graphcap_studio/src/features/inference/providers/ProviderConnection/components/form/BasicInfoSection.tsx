import { useColorModeValue } from "@/components/ui/theme/color-mode";
// SPDX-License-Identifier: Apache-2.0
import {
	Box,
	Field,
	Grid,
	GridItem,
	Input,
	Text,
	VStack,
} from "@chakra-ui/react";
import { Controller } from "react-hook-form";
import { useProviderFormContext } from "../../../context/ProviderFormContext";
import { EnvironmentSelect } from "./EnvironmentSelect";

/**
 * Component for displaying and editing basic provider information
 */
export function BasicInfoSection() {
	const { control, errors, watch, mode } = useProviderFormContext();
	const isEditing = mode === "edit" || mode === "create";
	const labelColor = useColorModeValue("gray.600", "gray.300");
	const textColor = useColorModeValue("gray.700", "gray.200");

	// Watch form values for read-only display
	const name = watch("name");
	const kind = watch("kind");
	const environment = watch("environment");

	if (!isEditing) {
		return (
			<VStack gap={4} align="stretch" mt={4}>
				<Box>
					<Text fontSize="sm" color={labelColor}>
						Name
					</Text>
					<Text color={textColor}>{name}</Text>
				</Box>

				<Grid templateColumns="repeat(2, 1fr)" gap={4}>
					<GridItem>
						<Text fontSize="sm" color={labelColor}>
							Kind
						</Text>
						<Text color={textColor}>{kind}</Text>
					</GridItem>
					<GridItem>
						<Text fontSize="sm" color={labelColor}>
							Environment
						</Text>
						<Text color={textColor}>{environment}</Text>
					</GridItem>
				</Grid>
			</VStack>
		);
	}

	return (
		<VStack gap={4} align="stretch" mt={4}>
			<Controller
				name="name"
				control={control}
				render={({ field }) => (
					<Field.Root invalid={!!errors.name}>
						<Field.Label color={labelColor}>Name</Field.Label>
						<Input {...field} id="name" />
						<Field.ErrorText>{errors.name?.message}</Field.ErrorText>
					</Field.Root>
				)}
			/>

			<Grid templateColumns="repeat(2, 1fr)" gap={4}>
				<GridItem>
					<Controller
						name="kind"
						control={control}
						render={({ field }) => (
							<Field.Root invalid={!!errors.kind}>
								<Field.Label color={labelColor}>Kind</Field.Label>
								<Input {...field} id="kind" />
								<Field.ErrorText>{errors.kind?.message}</Field.ErrorText>
							</Field.Root>
						)}
					/>
				</GridItem>

				<GridItem>
					<EnvironmentSelect />
				</GridItem>
			</Grid>
		</VStack>
	);
}
