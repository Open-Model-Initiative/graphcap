// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Service
 *
 * This module provides functions for interacting with the graphcap Server's
 * perspectives API using TanStack Query.
 */

// Export types
export * from "@/features/perspectives/types";

// Export utility functions
export * from "./utils";

// Export API methods
export { perspectivesApi } from "./api";

// Export hooks from the hooks directory
export {
	useGeneratePerspectiveCaption, usePerspectives
} from "@/features/perspectives/hooks";

