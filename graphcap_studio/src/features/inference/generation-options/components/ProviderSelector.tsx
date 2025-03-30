// SPDX-License-Identifier: Apache-2.0
/**
 * Provider Selector Component
 *
 * A component for selecting an inference provider.
 */

import { ProviderSelector as CommonProviderSelector, type ProviderOption } from "@/components/common_inference/ProviderSelector";

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
	// Convert providers to ProviderOption format
	const providerOptions: ProviderOption[] = providers.map((provider) => ({
		label: provider.name,
		value: provider.name,
		id: provider.id,
	}));

	return (
		<CommonProviderSelector
			options={providerOptions}
			value={selectedProvider}
			onChange={onChange}
			isDisabled={isDisabled}
			maxWidth={maxWidth}
			minWidth={minWidth}
			width={width}
			size={size}
			placeholder={placeholder}
			className={className}
		/>
	);
}
