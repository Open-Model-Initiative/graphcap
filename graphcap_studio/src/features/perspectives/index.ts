// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Feature
 *
 * This module exports components and hooks for the perspectives feature.
 */

// Export main components
export { Perspectives } from "./Perspectives";

// Export context providers and hooks
export {
	PerspectivesProvider,
	PerspectivesDataProvider,
	PerspectiveUIProvider,
	usePerspectivesData,
	usePerspectiveUI,
} from "./context";

// Export types
export * from "./types";

// Export hooks
export * from "./hooks";
