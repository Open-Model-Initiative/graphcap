import { useColorModeValue } from "@/components/ui/theme/color-mode";
import {
	Box,
	Field,
	Grid,
	GridItem,
	Input,
	Text,
	VStack,
} from "@chakra-ui/react";
// SPDX-License-Identifier: Apache-2.0
import type { ChangeEvent } from "react";
import { Controller, useController } from "react-hook-form";
import { useProviderFormContext } from "../../../context/ProviderFormContext";

/**
 * Component for displaying and editing provider rate limits
 */
export function RateLimitsSection() {
	const { control, errors, watch, mode } = useProviderFormContext();
	const isEditing = mode === "edit" || mode === "create";
	const labelColor = useColorModeValue("gray.600", "gray.300");
	const textColor = useColorModeValue("gray.700", "gray.200");

	// Watch form values for read-only display
	const rateLimits = watch("rateLimits");

	// Ensure rateLimits object exists in the form
	useController({
		name: "rateLimits",
		control,
		defaultValue: {
			requestsPerMinute: 0,
			tokensPerMinute: 0,
		},
	});

	if (!isEditing) {
		return (
			<VStack gap={4} align="stretch" mt={4}>
				<Box>
					<Text fontSize="sm" color={labelColor} mb={1}>
						Rate Limits
					</Text>
					<Grid templateColumns="repeat(2, 1fr)" gap={4}>
						<GridItem>
							<Text fontSize="sm" color={labelColor}>
								Requests per minute
							</Text>
							<Text color={textColor}>
								{rateLimits?.requestsPerMinute ?? 0}
							</Text>
						</GridItem>
						<GridItem>
							<Text fontSize="sm" color={labelColor}>
								Tokens per minute
							</Text>
							<Text color={textColor}>{rateLimits?.tokensPerMinute ?? 0}</Text>
						</GridItem>
					</Grid>
				</Box>
			</VStack>
		);
	}

	return (
		<VStack gap={4} align="stretch" mt={4}>
			<Box>
				<Text fontSize="xs" color={labelColor} mb={1}>
					Rate Limits
				</Text>
				<Grid templateColumns="repeat(2, 1fr)" gap={4}>
					<GridItem>
						<Controller
							name="rateLimits.requestsPerMinute"
							control={control}
							defaultValue={0}
							render={({ field: { value, onChange, ...field } }) => (
								<Field.Root invalid={!!errors.rateLimits?.requestsPerMinute}>
									<Field.Label color={labelColor}>
										Requests per minute
									</Field.Label>
									<Input
										{...field}
										id="requestsPerMinute"
										type="number"
										value={value ?? 0}
										onChange={(e: ChangeEvent<HTMLInputElement>) =>
											onChange(Number.parseInt(e.target.value) || 0)
										}
										min={0}
									/>
									<Field.ErrorText>
										{errors.rateLimits?.requestsPerMinute?.message}
									</Field.ErrorText>
								</Field.Root>
							)}
						/>
					</GridItem>

					<GridItem>
						<Controller
							name="rateLimits.tokensPerMinute"
							control={control}
							defaultValue={0}
							render={({ field: { value, onChange, ...field } }) => (
								<Field.Root invalid={!!errors.rateLimits?.tokensPerMinute}>
									<Field.Label color={labelColor}>
										Tokens per minute
									</Field.Label>
									<Input
										{...field}
										id="tokensPerMinute"
										type="number"
										value={value ?? 0}
										onChange={(e: ChangeEvent<HTMLInputElement>) =>
											onChange(Number.parseInt(e.target.value) || 0)
										}
										min={0}
									/>
									<Field.ErrorText>
										{errors.rateLimits?.tokensPerMinute?.message}
									</Field.ErrorText>
								</Field.Root>
							)}
						/>
					</GridItem>
				</Grid>
			</Box>
		</VStack>
	);
}
