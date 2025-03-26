// SPDX-License-Identifier: Apache-2.0
import type { ReactNode } from "react";
import { useInferenceProviderContext } from "../context";
import type { ProviderCreate, ProviderUpdate } from "../types";
import { ProviderFormView } from "./components/ProviderFormView";
import { ProviderFormContainer } from "./containers/ProviderFormContainer";

interface ProviderConnectionProps {
	initialData?: Partial<ProviderCreate | ProviderUpdate>;
	onSubmit?: (data: ProviderCreate | ProviderUpdate) => Promise<void>;
}

/**
 * Main provider connection component that handles form state and submission
 */
export function ProviderConnection({
	initialData,
	onSubmit,
}: ProviderConnectionProps) {
	// Get onSubmit from context if not provided as prop
	const context = useInferenceProviderContext();
	
	// Use provided onSubmit if available, otherwise use the one from context
	const handleSubmit = onSubmit || context.onSubmit;
	
	return (
		<ProviderFormContainer initialData={initialData} onSubmit={handleSubmit}>
			<ProviderFormView />
		</ProviderFormContainer>
	);
}
