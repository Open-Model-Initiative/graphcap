// SPDX-License-Identifier: Apache-2.0
/**
 * useModulePerspectives Hook (Compatibility Wrapper)
 *
 * This hook is kept for backward compatibility. It now uses the enhanced
 * usePerspectiveModules hook internally.
 * 
 * @deprecated Use usePerspectiveModules().getModulePerspectives() instead.
 */

import { useMemo } from "react";
import { usePerspectiveModules } from "./usePerspectiveModules";

/**
 * Hook to fetch perspectives for a specific module from the server (compatibility wrapper)
 *
 * @param moduleName - Name of the module to fetch perspectives for
 * @returns A query result with the module and its perspectives
 */
export function useModulePerspectives(moduleName: string) {
	// Use the enhanced hooks to get the module data
	const { getModulePerspectives } = usePerspectiveModules();
	const moduleData = getModulePerspectives(moduleName);
	
	// Map to the expected return shape for backward compatibility
	return useMemo(() => {
		return {
			data: moduleData.module ? {
				module: moduleData.module,
				perspectives: moduleData.perspectives
			} : undefined,
			isLoading: moduleData.isLoading,
			isError: moduleData.isError,
			error: moduleData.error,
			refetch: moduleData.refetch
		};
	}, [moduleData]);
} 