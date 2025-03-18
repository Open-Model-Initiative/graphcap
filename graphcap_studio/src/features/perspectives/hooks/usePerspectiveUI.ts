// SPDX-License-Identifier: Apache-2.0
/**
 * Perspective UI Hook
 *
 * This hook provides UI-related functionality for the perspectives components.
 */

import { PerspectiveType } from "@/features/perspectives/types";
import { useCallback, useState } from "react";

interface UsePerspectiveUIOptions {
	onGeneratePerspective?: (
		perspective: PerspectiveType,
		provider?: string,
	) => void;
	initialSelectedProvider?: string;
	perspectiveKey?: PerspectiveType;
}

/**
 * Hook for perspective UI functionality
 */
export function usePerspectiveUI(options: UsePerspectiveUIOptions = {}) {
	const { onGeneratePerspective, initialSelectedProvider, perspectiveKey } =
		options;

	// Local state
	const [selectedProvider, setSelectedProvider] = useState<string | undefined>(
		initialSelectedProvider,
	);

	// Provider selection handler
	const handleProviderChange = useCallback(
		(e: React.ChangeEvent<HTMLSelectElement>) => {
			setSelectedProvider(e.target.value);
		},
		[],
	);

	// Generate handler
	const handleGenerate = useCallback(() => {
		if (onGeneratePerspective && perspectiveKey) {
			onGeneratePerspective(perspectiveKey, selectedProvider);
		}
	}, [onGeneratePerspective, perspectiveKey, selectedProvider]);

	return {
		selectedProvider,
		handleProviderChange,
		handleGenerate,
	};
}
