// SPDX-License-Identifier: Apache-2.0
import {
	SelectContent,
	SelectItem,
	SelectRoot,
	SelectTrigger,
	SelectValueText,
} from "@/components/ui/select";
import { createListCollection } from "@chakra-ui/react";
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

	// Convert providers to the format expected by SelectRoot
	const providerItems = providers.map((provider) => ({
		label: provider.name,
		value: String(provider.id),
	}));

	const providerCollection = createListCollection({
		items: providerItems,
	});

	// Convert selectedProviderId to string array format
	const value = selectedProviderId ? [String(selectedProviderId)] : [];

	const handleProviderChange = (details: { value: string[] }) => {
		if (!details.value.length) return;
		
		const id = Number(details.value[0]);
		const provider = providers.find((p) => p.id === id);
		if (provider) {
			// Call the context's setSelectedProvider function
			// This will update the global context and reset the form
			setSelectedProvider(provider);
		}
	};

	return (
		<SelectRoot
			collection={providerCollection}
			value={value}
			onValueChange={handleProviderChange}
			aria-label={ariaLabel}
			className={className}
		>
			<SelectTrigger>
				<SelectValueText placeholder="Select a provider" />
			</SelectTrigger>
			<SelectContent portalled={false}>
				{providerItems.map((item) => (
					<SelectItem key={item.value} item={item}>
						{item.label}
					</SelectItem>
				))}
			</SelectContent>
		</SelectRoot>
	);
} 