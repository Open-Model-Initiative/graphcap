// SPDX-License-Identifier: Apache-2.0
/**
 * Provider Selector Component
 *
 * A reusable component for selecting a provider from a list of options.
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

export interface ProviderOption {
	label: string;
	value: string;
	id: string;
}

export interface ProviderSelectorProps {
	readonly options: ProviderOption[];
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
 * A reusable component for selecting a provider from a list of options.
 */
export function ProviderSelector({
	options,
	value,
	onChange,
	isDisabled = false,
	maxWidth = undefined,
	minWidth = undefined,
	width = undefined,
	size = "sm",
	placeholder = "Select provider",
	className,
	showLabel = false,
	label = "Provider",
	helperText,
}: ProviderSelectorProps) {
	// Create collection for SelectRoot
	const providerCollection = createListCollection({
		items: options,
	});

	// Convert value to string array format required by SelectRoot
	// Handle both string and number values
	const stringValue = value !== null && value !== undefined ? String(value) : null;
	const selectValue = stringValue ? [stringValue] : [];

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
			collection={providerCollection}
			value={selectValue}
			onValueChange={handleValueChange}
			disabled={isDisabled}
			positioning={{ placement: "top", flip: false }}
			size={size}
			key={`provider-select-${stringValue}`}
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
				<Field id="provider-selector" label={label} helperText={helperText}>
					{selector}
				</Field>
			) : (
				selector
			)}
		</Box>
	);
} 