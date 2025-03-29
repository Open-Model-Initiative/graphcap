// SPDX-License-Identifier: Apache-2.0
import { ProviderSelector, type ProviderOption } from "@/components/common_inference/ProviderSelector";
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
	// Get providers and selection functions from the form context
	const { providers, selectedProvider, setSelectedProvider } = useProviderFormContext();

	const selectedProviderId = selectedProvider?.id ?? null;

	// Convert providers to the format expected by ProviderSelector
	const providerOptions: ProviderOption[] = providers.map((provider) => ({
		label: provider.name,
		value: String(provider.id),
		id: provider.id,
	}));

	const handleProviderChange = (value: string) => {
		if (!value) return;
		
		const id = Number(value);
		const provider = providers.find((p) => p.id === id);
		if (provider) {
			// Call the context's setSelectedProvider function
			// This will update the global context and reset the form
			setSelectedProvider(provider);
		}
	};

	return (
		<ProviderSelector
			options={providerOptions}
			value={selectedProviderId}
			onChange={handleProviderChange}
			placeholder="Select a provider"
			className={className}
		/>
	);
} 