// SPDX-License-Identifier: Apache-2.0
import { useProviders } from "../services/providers";
import { ProviderFormSelect } from "./ProviderConnection/components/form/ProviderFormSelect";
import { ProviderFormContainer } from "./ProviderConnection/containers/ProviderFormContainer";
import { useInferenceProviderContext } from "./context/InferenceProviderContext";
import type { ProviderCreate, ProviderUpdate } from "./types";

/**
 * Component for displaying a list of providers as a dropdown
 * This component includes the necessary context providers
 */
export default function ProvidersList() {
	const { data: providers = [], isLoading } = useProviders();
	const { setSelectedProvider } = useInferenceProviderContext();

	// No need to check context.providers as we fetch directly here
	if (providers.length === 0 && !isLoading) {
		return (
			<div className="p-4 text-center">
				<p className="text-sm text-gray-500">No providers available</p>
			</div>
		);
	}

	// Create a simple handler for form submission - just updates the global context
	const handleSubmit = async (data: ProviderCreate | ProviderUpdate) => {
		// This is a simple wrapper, so we don't actually need to do anything on submit
		console.log("Provider selected in list:", data);
	};

	return (
		<div className="p-4">
			{/* Wrap in provider form container to provide the necessary context */}
			<ProviderFormContainer initialData={{}} onSubmit={handleSubmit}>
				<ProviderFormSelect className="w-full" />
			</ProviderFormContainer>
		</div>
	);
}
