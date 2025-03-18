// SPDX-License-Identifier: Apache-2.0
/**
 * OLD Generation Option Form Component - DEPRECATED
 *
 * This is the old implementation kept for reference.
 * Please use the new components in the 'components' directory instead.
 */

import { Button } from "@/components/ui";
import { Slider } from "@/components/ui/slider";
import { useColorModeValue } from "@/components/ui/theme/color-mode";
import type { CaptionOptions } from "@/features/perspectives/types";
import { Box, HStack, Input, VStack } from "@chakra-ui/react";
import React, {
	useCallback,
	useState,
	useEffect,
	type ChangeEvent,
} from "react";

// Default options for caption generation
export const DEFAULT_OPTIONS: CaptionOptions = {
	temperature: 0.7,
	max_tokens: 4096,
	top_p: 0.95,
	repetition_penalty: 1.1,
};

// Only include numeric options in config
type NumericOptionKey =
	| "temperature"
	| "max_tokens"
	| "top_p"
	| "repetition_penalty";

// Configuration for option min/max values and steps
const OPTION_CONFIGS: Record<
	NumericOptionKey,
	{ min: number; max: number; step: number; precision: number }
> = {
	temperature: { min: 0, max: 1, step: 0.1, precision: 1 },
	max_tokens: { min: 1, max: 8192, step: 1, precision: 0 },
	top_p: { min: 0, max: 1, step: 0.05, precision: 2 },
	repetition_penalty: { min: 1, max: 2, step: 0.1, precision: 1 },
};

interface GenerationOptionFormProps {
	readonly options: CaptionOptions;
	readonly onChange: (options: CaptionOptions) => void;
	readonly onClose: () => void;
	readonly isGenerating?: boolean;
}

/**
 * Form component for configuring generation options
 */
export function GenerationOptionForm({
	options,
	onChange,
	onClose,
	isGenerating = false,
}: GenerationOptionFormProps) {
	// Local state for form values to avoid excessive rerenders
	const [localOptions, setLocalOptions] = useState<CaptionOptions>(options);

	// Debounce timer ref
	const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

	// Color values for theming
	const borderColor = useColorModeValue("gray.200", "gray.600");
	const bgColor = useColorModeValue("white", "gray.700");
	const labelColor = useColorModeValue("gray.700", "gray.300");
	const inputBgColor = useColorModeValue("white", "gray.800");

	// Update parent component with debounced values
	const debouncedUpdateOptions = useCallback(
		(newOptions: CaptionOptions) => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}

			debounceTimerRef.current = setTimeout(() => {
				onChange(newOptions);
			}, 300); // 300ms debounce
		},
		[onChange],
	);

	// Handle slider value changes
	const handleSliderChange =
		(name: NumericOptionKey) => (details: { value: number[] }) => {
			const value = details.value[0];
			const newOptions = { ...localOptions, [name]: value };
			setLocalOptions(newOptions);
			debouncedUpdateOptions(newOptions);
		};

	// Handle direct input changes
	const handleInputChange =
		(name: NumericOptionKey) => (e: ChangeEvent<HTMLInputElement>) => {
			const valueAsNumber = Number.parseFloat(e.target.value);
			if (isNaN(valueAsNumber)) return;

			const config = OPTION_CONFIGS[name];
			// Ensure value is within bounds
			const boundedValue = Math.max(
				config.min,
				Math.min(config.max, valueAsNumber),
			);
			const newOptions = { ...localOptions, [name]: boundedValue };
			setLocalOptions(newOptions);
			debouncedUpdateOptions(newOptions);
		};

	// Handle reset to defaults
	const handleResetDefaults = () => {
		setLocalOptions(DEFAULT_OPTIONS);
		onChange(DEFAULT_OPTIONS);
	};

	// Clean up debounce timer on unmount
	useEffect(() => {
		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
		};
	}, []);

	// Sync local state with props when options change externally
	useEffect(() => {
		setLocalOptions(options);
	}, [options]);

	// Helper to get slider value array format
	const getSliderValue = (key: NumericOptionKey): number[] => {
		const value =
			typeof localOptions[key] === "number"
				? localOptions[key]
				: DEFAULT_OPTIONS[key];
		return [value as number];
	};

	// Function to render a slider with number input
	const renderOptionControl = (name: NumericOptionKey, label: string) => {
		const config = OPTION_CONFIGS[name];
		const value = localOptions[name] ?? DEFAULT_OPTIONS[name];

		return (
			<Box w="full">
				<Box as="label" display="block" fontSize="xs" mb={1} color={labelColor}>
					{label}
				</Box>
				<HStack>
					<Box flex="1">
						<Slider
							aria-label={[label]}
							value={getSliderValue(name)}
							onValueChange={handleSliderChange(name)}
							min={config.min}
							max={config.max}
							step={config.step}
							disabled={isGenerating}
						/>
					</Box>
					<Input
						type="number"
						min={config.min}
						max={config.max}
						step={config.step}
						value={value}
						onChange={handleInputChange(name)}
						size="xs"
						width={name === "max_tokens" ? "70px" : "60px"}
						disabled={isGenerating}
						textAlign="right"
						bg={inputBgColor}
						borderColor={borderColor}
					/>
				</HStack>
			</Box>
		);
	};

	return (
		<Box
			position="absolute"
			right="0"
			top="full"
			mt={2}
			w="72"
			bg={bgColor}
			rounded="md"
			shadow="lg"
			zIndex={50}
			p={4}
			borderWidth="1px"
			borderColor={borderColor}
		>
			<HStack justify="space-between" mb={3}>
				<Box as="h4" fontSize="sm" fontWeight="medium" color={labelColor}>
					Generation Options
				</Box>
				<Button
					variant="ghost"
					size="sm"
					onClick={onClose}
					disabled={isGenerating}
					aria-label="Close"
				>
					✕
				</Button>
			</HStack>

			<VStack gap={4}>
				{renderOptionControl("temperature", "Temperature")}
				{renderOptionControl("max_tokens", "Max Tokens")}
				{renderOptionControl("top_p", "Top P")}
				{renderOptionControl("repetition_penalty", "Repetition Penalty")}

				<Button
					variant="outline"
					size="sm"
					onClick={handleResetDefaults}
					disabled={isGenerating}
					width="full"
				>
					Reset to Defaults
				</Button>
			</VStack>
		</Box>
	);
}
