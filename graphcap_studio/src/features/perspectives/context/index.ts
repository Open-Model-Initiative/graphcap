// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Context Exports
 * 
 * This module exports the contexts used for perspectives.
 */

// Export UI context
export { 
  PerspectiveUIProvider,
  usePerspectiveUI
} from './PerspectiveUIContext';

// Export data context
export {
  PerspectivesDataProvider,
  usePerspectivesData
} from './PerspectivesDataContext';

// Export combined provider for convenience
export { PerspectivesProvider } from './PerspectivesProvider'; 