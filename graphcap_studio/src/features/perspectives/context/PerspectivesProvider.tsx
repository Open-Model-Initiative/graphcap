// SPDX-License-Identifier: Apache-2.0
/**
 * Combined Perspectives Provider
 *
 * This component combines the data and UI contexts for perspectives
 * to simplify usage in component trees.
 */

import { Image } from "@/services/images";
import { ReactNode } from "react";
import { Provider } from "../types";
import { PerspectiveUIProvider } from "./PerspectiveUIContext";
import { PerspectivesDataProvider } from "./PerspectivesDataContext";

interface PerspectivesProviderProps {
	readonly children: ReactNode;
	readonly initialProvider?: string;
	readonly initialProviders?: Provider[];
	readonly image: Image | null;
}

/**
 * Combined provider for all perspective-related contexts
 * Uses a consolidated architecture with just two providers:
 * 1. PerspectivesDataProvider - all data concerns
 * 2. PerspectiveUIProvider - all UI concerns
 */
export function PerspectivesProvider({
	children,
	initialProvider,
	initialProviders = [],
	image,
}: PerspectivesProviderProps) {
	return (
		<PerspectivesDataProvider
			image={image}
			initialProvider={initialProvider}
			initialProviders={initialProviders}
		>
			<PerspectiveUIProvider>{children}</PerspectiveUIProvider>
		</PerspectivesDataProvider>
	);
}
