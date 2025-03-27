// SPDX-License-Identifier: Apache-2.0
/**
 * Global Context Field Component
 *
 * This component renders a textarea for the global context option.
 */

import { useColorModeValue } from "@/components/ui/theme/color-mode";
import { Box, Textarea } from "@chakra-ui/react";
import { type ChangeEvent, useCallback, useEffect, useState } from "react";
import { useGenerationOptions } from "../../context";

/**
 * Global context control field component
 */
export function GlobalContextField() {
	const { options, updateOption, isGenerating } = useGenerationOptions();
	const [localValue, setLocalValue] = useState(options.global_context);

	// Color values for theming
	const labelColor = useColorModeValue("gray.700", "gray.300");
	const inputBgColor = useColorModeValue("white", "gray.800");
	const borderColor = useColorModeValue("gray.200", "gray.600");

	// Sync local state with context when options change externally
	useEffect(() => {
		setLocalValue(options.global_context);
	}, [options.global_context]);

	// Debounced update function
	const debouncedUpdate = useCallback(
		debounce((value: string) => {
			updateOption("global_context", value);
		}, 500),
		// updateOption is from context and won't change during component's lifecycle
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);

	const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		const newValue = e.target.value;
		setLocalValue(newValue);
		debouncedUpdate(newValue);
	};

	return (
		<Box w="full">
			<Box as="label" display="block" fontSize="xs" mb={1} color={labelColor}>
				Global Context
			</Box>
			<Textarea
				value={localValue}
				onChange={handleChange}
				placeholder="Enter global context for generation..."
				size="sm"
				minH="120px"
				disabled={isGenerating}
				bg={inputBgColor}
				borderColor={borderColor}
				resize="vertical"
				w="full"
			/>
		</Box>
	);
}

// Debounce utility function
function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
	func: T,
	wait: number,
): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout | null = null;

	// Using arrow function to avoid "this function expression can be turned into an arrow function" lint error
	return (...args: Parameters<T>) => {
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}
