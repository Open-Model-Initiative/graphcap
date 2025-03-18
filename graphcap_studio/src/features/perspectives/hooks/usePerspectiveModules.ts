// SPDX-License-Identifier: Apache-2.0
/**
 * usePerspectiveModules Hook
 *
 * This hook fetches available perspectives and groups them by module.
 */

import { useMemo } from "react";
import { PerspectiveModule, groupPerspectivesByModule } from "../types";
import { usePerspectives } from "./usePerspectives";

/**
 * Hook to fetch perspectives and organize them into modules
 */
export function usePerspectiveModules() {
  // Fetch perspectives using the existing hook
  const perspectivesQuery = usePerspectives();
  
  // Group perspectives by module
  const modules = useMemo(() => {
    if (perspectivesQuery.data) {
      return groupPerspectivesByModule(perspectivesQuery.data);
    }
    return [];
  }, [perspectivesQuery.data]);
  
  return {
    ...perspectivesQuery,
    modules,
  };
} 