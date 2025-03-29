// SPDX-License-Identifier: Apache-2.0
/**
 * Model Selector Component
 *
 * A reusable component for selecting a model from a list of options.
 */

import { Box, createListCollection } from "@chakra-ui/react";
import { Field } from "../ui/field";
import {
	SelectContent,
	SelectItem,
	SelectRoot,
	SelectTrigger,
	SelectValueText,
} from "../ui/select";

export interface ModelOption {
	label: string;
	value: string;
}

export interface ModelSelectorProps {
	readonly options: ModelOption[];
	readonly value: string | null | undefined;
	readonly onChange: (value: string) => void;
	readonly isDisabled?: boolean;
	readonly maxWidth?: string | number;
	readonly minWidth?: string | number;
	readonly width?: string | number;
	readonly size?: "xs" | "sm" | "md" | "lg";
	readonly placeholder?: string;
	readonly className?: string;
	readonly showLabel?: boolean;
	readonly label?: string;
	readonly helperText?: string;
}

/**
 * A reusable component for selecting a model from a list of options.
 */
export function ModelSelector({
	options,
	value,
	onChange,
	isDisabled = false,
	maxWidth = undefined,
	minWidth = undefined,
	width = undefined,
	size = "sm",
	placeholder = "Select model",
	className,
	showLabel = false,
	label = "Model",
	helperText,
}: ModelSelectorProps) {
	// Create collection for SelectRoot
	const modelCollection = createListCollection({
		items: options,
	});

	// Convert value to string array format required by SelectRoot
	const selectValue = value ? [value] : [];

	const handleValueChange = (details: { value: string[] }) => {
		if (details.value && details.value.length > 0) {
			onChange(details.value[0]);
		} else {
			onChange("");
		}
	};

	const boxProps = {
		...(maxWidth ? { maxWidth } : {}),
		...(minWidth ? { minWidth } : {}),
		...(width ? { width } : {}),
		className,
	};

	const selector = (
		<SelectRoot
			collection={modelCollection}
			value={selectValue}
			onValueChange={handleValueChange}
			disabled={isDisabled}
			positioning={{ placement: "top", flip: false }}
			size={size}
		>
			<SelectTrigger>
				<SelectValueText placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>
				{options.map((option) => (
					<SelectItem key={option.value} item={option}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</SelectRoot>
	);

	return (
		<Box {...boxProps}>
			{showLabel ? (
				<Field id="model-selector" label={label} helperText={helperText}>
					{selector}
				</Field>
			) : (
				selector
			)}
		</Box>
	);
} 