// SPDX-License-Identifier: Apache-2.0
import type {
	ProviderCreate,
	ProviderUpdate,
} from "@/types/provider-config-types";
import { ProviderFormView } from "./components/ProviderFormView";
import { ProviderFormContainer } from "./containers/ProviderFormContainer";

interface ProviderConnectionProps {
	readonly initialData?: Partial<ProviderCreate | ProviderUpdate>;
}

/**
 * Main provider connection component that handles form state and submission
 */
export function ProviderConnection({
	initialData,
}: ProviderConnectionProps) {

	return (
		<ProviderFormContainer initialData={initialData}>
			<ProviderFormView />
		</ProviderFormContainer>
	);
}
