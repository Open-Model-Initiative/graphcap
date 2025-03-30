// SPDX-License-Identifier: Apache-2.0
import type {
	ProviderCreate,
	ProviderUpdate,
} from "@/types/provider-config-types";
import { ProviderFormView } from "./components/ProviderFormView";
import { ProviderFormContainer } from "./containers/ProviderFormContainer";

interface ProviderConnectionProps {
	readonly initialData?: Partial<ProviderCreate | ProviderUpdate>;
	readonly onSubmit?: (data: ProviderCreate | ProviderUpdate) => Promise<void>;
}

/**
 * Main provider connection component that handles form state and submission
 */
export function ProviderConnection({
	initialData,
	onSubmit,
}: ProviderConnectionProps) {
	// Create a default no-op submit handler if none is provided
	const defaultSubmitHandler = async (
		data: ProviderCreate | ProviderUpdate,
	) => {
		console.log("Provider form submitted:", data);
		// Default implementation just logs the data
		// In a real app, this would call an API
	};

	// Use provided onSubmit if available, otherwise use the default handler
	const handleSubmit = onSubmit || defaultSubmitHandler;

	return (
		<ProviderFormContainer initialData={initialData} onSubmit={handleSubmit}>
			<ProviderFormView />
		</ProviderFormContainer>
	);
}
