// SPDX-License-Identifier: Apache-2.0
/**
 * Provider Selector Component
 *
 * A component for selecting an inference provider.
 */

import {
	SelectContent,
	SelectItem,
	SelectRoot,
	SelectTrigger,
	SelectValueText,
} from "@/components/ui/select";
import { Box, createListCollection } from "@chakra-ui/react";

export interface Provider {
	id: number;
	name: string;
}

interface ProviderSelectorProps {
	readonly providers: Provider[];
	readonly selectedProvider: string | undefined;
	readonly onChange: (provider: string) => void;
	readonly isDisabled?: boolean;
	readonly maxWidth?: string | number;
	readonly minWidth?: string | number;
	readonly width?: string | number;
	readonly size?: "xs" | "sm" | "md" | "lg";
	readonly placeholder?: string;
	readonly className?: string;
}

export function ProviderSelector({
	providers,
	selectedProvider,
	onChange,
	isDisabled = false,
	maxWidth = undefined,
	minWidth = undefined,
	width = undefined,
	size = "sm",
	placeholder = "Select provider",
	className,
}: ProviderSelectorProps) {
	// Convert providers to the format expected by SelectRoot
	const providerItems = providers.map((provider) => ({
		label: provider.name,
		value: provider.name,
	}));

	const providerCollection = createListCollection({
		items: providerItems,
	});

	// Convert selectedProvider to string array format required by SelectRoot
	const value = selectedProvider ? [selectedProvider] : [];

	const handleValueChange = (details: any) => {
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

	return (
		<Box {...boxProps}>
			<SelectRoot
				collection={providerCollection}
				value={value}
				onValueChange={handleValueChange}
				disabled={isDisabled}
				positioning={{ placement: "top", flip: false }}
				size={size}
			>
				<SelectTrigger>
					<SelectValueText placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					{providerItems.map((item) => (
						<SelectItem key={item.value} item={item}>
							{item.label}
						</SelectItem>
					))}
				</SelectContent>
			</SelectRoot>
		</Box>
	);
}
