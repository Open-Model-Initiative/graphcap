// SPDX-License-Identifier: Apache-2.0
import { type ProviderOption, ProviderSelector } from "@/components/common_inference/ProviderSelector";
import type { Provider } from "@/types/provider-config-types";
import { useProviders } from "../../../../services/providers";
import { useProviderFormContext } from "../../../context/ProviderFormContext";

type ProviderFormSelectProps = {
	readonly className?: string;
	readonly "aria-label"?: string;
};

/**
 * Component for selecting a provider from a dropdown within the provider form
 * Uses the form context to manage provider selection
 */
export function ProviderFormSelect({
	className,
	"aria-label": ariaLabel = "Select Provider",
}: ProviderFormSelectProps) {
	// Get provider data from context
	const { provider, setProvider } = useProviderFormContext();
	
	// Fetch providers directly
	const { data: providers = [] } = useProviders();
	
	// Convert providers to the format expected by ProviderSelector
	const providerOptions: ProviderOption[] = providers.map((p: Provider) => ({
		label: p.name,
		value: p.name,
		id: String(p.id),
	}));

	const handleProviderChange = (value: string) => {
		if (!value) return;
		
		// Find the selected provider from the providers list by name
		const selectedProvider = providers.find((p: Provider) => p.name === value);
		if (selectedProvider) {
			setProvider(selectedProvider);
		}
	};

	return (
		<ProviderSelector
			options={providerOptions}
			value={provider?.name ?? null}
			onChange={handleProviderChange}
			placeholder="Select a provider"
			className={className}
			aria-label={ariaLabel}
		/>
	);
} 