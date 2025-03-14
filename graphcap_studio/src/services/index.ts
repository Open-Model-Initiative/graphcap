// SPDX-License-Identifier: Apache-2.0
/**
 * Services index
 * 
 * This file exports server connection services.
 * 
 * Note: To avoid naming conflicts, we're not re-exporting everything.
 * Import directly from the specific service files when needed:
 * import { specificFunction } from './services/specificService';
 */

// Server connections


// File browser
export {
  useBrowseDirectory,
  useBrowseMultipleDirectories,
  prefetchDirectory,
  invalidateDirectory,
  getFileUrl,
  downloadFile
} from './fileBrowser';

// Providers
export {
  useProviders,
  useProvider,
  useCreateProvider,
  useUpdateProvider,
  useDeleteProvider,
  useUpdateProviderApiKey
} from '../features/inference/services/providers';


