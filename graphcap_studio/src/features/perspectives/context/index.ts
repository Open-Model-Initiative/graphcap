// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Context Exports
 * 
 * This module exports the consolidated contexts used for perspectives.
 * 
 * BREAKING CHANGE: Previous context structure (PerspectiveContext, PerspectiveInferenceContext, etc.)
 * has been removed in favor of a consolidated architecture with two clear providers:
 * - PerspectivesDataProvider: All data-related concerns
 * - PerspectiveUIProvider: All UI-related concerns
 */

// Export data context
export { 
  PerspectivesDataProvider,
  usePerspectivesData
} from './PerspectivesDataContext';

// Export UI context
export { 
  PerspectiveUIProvider,
  usePerspectiveUI
} from './PerspectiveUIContext';

// Export combined provider for convenience
export { PerspectivesProvider } from './PerspectivesProvider';
