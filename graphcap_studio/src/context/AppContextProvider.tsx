import { DatasetProvider } from "@/features/datasets";
import { GenerationOptionsProvider } from "@/features/inference/generation-options";
import { InferenceProviderProvider } from "@/features/inference/providers/context";
import { PerspectivesProvider } from "@/features/perspectives/context";
// SPDX-License-Identifier: Apache-2.0
import type { ReactNode } from "react";
import { ServerConnectionsProvider } from ".";
import { FeatureFlagProvider } from "../features/app-settings/feature-flags/FeatureFlagProvider";

interface AppContextProviderProps {
	readonly children: ReactNode;
}

/**
 * A composition of context providers that wraps the application
 *
 * This component composes multiple context providers to provide
 * a unified context for the application. The order of providers
 * matters - providers that depend on other providers should be
 * nested inside them.
 *
 * Each feature provides its own initializer component that handles
 * fetching and initializing its own context, which keeps the
 * AppContextProvider decoupled from feature-specific implementation details.
 *
 * @param children - The child components to render
 */
export function AppContextProvider({ children }: AppContextProviderProps) {
	return (
		<FeatureFlagProvider>
			<ServerConnectionsProvider>
				<DatasetProvider>
					<GenerationOptionsProvider>
						<InferenceProviderProvider>
							<PerspectivesProvider image={null}>{children}</PerspectivesProvider>
						</InferenceProviderProvider>
					</GenerationOptionsProvider>
				</DatasetProvider>
			</ServerConnectionsProvider>
		</FeatureFlagProvider>
	);
}
