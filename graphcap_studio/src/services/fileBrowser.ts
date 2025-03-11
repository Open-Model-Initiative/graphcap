// SPDX-License-Identifier: Apache-2.0
import { z } from 'zod';
import { useQuery, useQueries } from '@tanstack/react-query';
import { getQueryClient } from '../common/utils/queryClient';
import { FileItem } from '../common/components/file-browser/types';

/**
 * File Browser service for interacting with the Graphcap Media Server
 * 
 * This service provides functions for browsing files and directories
 * using the Graphcap Media Server API.
 * 
 * @module FileBrowserService
 */

// Define the base URL for the media server API
// Use localhost instead of container name for browser access
const MEDIA_SERVER_URL = import.meta.env.VITE_MEDIA_SERVER_URL?.replace('graphcap_media_server', 'localhost') ?? 'http://localhost:32400';

// Define the file item schema
export const FileItemSchema: z.ZodType<FileItem> = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['file', 'directory']),
  size: z.number().optional(),
  lastModified: z.string().optional(),
  children: z.array(z.lazy(() => FileItemSchema)).optional(),
});

// Define the directory contents response schema
export const DirectoryContentsResponseSchema = z.object({
  success: z.boolean(),
  path: z.string(),
  contents: z.array(FileItemSchema),
  error: z.string().optional(),
});

export type DirectoryContentsResponse = z.infer<typeof DirectoryContentsResponseSchema>;

// Query keys for TanStack Query
export const queryKeys = {
  files: ['files'] as const,
  filesByPath: (path: string) => [...queryKeys.files, path] as const,
};

// Helper function to create a query client
const getClient = () => getQueryClient();

/**
 * Fetch directory contents
 * 
 * @param path - Directory path to fetch
 * @returns Promise that resolves with the directory contents
 */
export async function fetchDirectory(path: string): Promise<DirectoryContentsResponse> {
  console.log('Fetching directory:', path);
  
  const url = new URL(`${MEDIA_SERVER_URL}/api/files/browse`);
  url.searchParams.append('path', path);
  
  const response = await fetch(url.toString());
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    throw new Error(`Failed to browse directory: ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('Received directory data:', data);
  return DirectoryContentsResponseSchema.parse(data);
}

/**
 * React hook for browsing directory contents using TanStack Query
 * 
 * @param path - Directory path to browse
 * @returns Query result with the directory contents
 */
export function useBrowseDirectory(path: string = '/') {
  return useQuery({
    queryKey: queryKeys.filesByPath(path),
    queryFn: () => fetchDirectory(path),
    meta: {
      errorMessage: 'Failed to browse directory'
    }
  });
}

/**
 * React hook for browsing multiple directories using TanStack Query
 * 
 * @param paths - Array of directory paths to browse
 * @returns Array of query results with the directory contents
 */
export function useBrowseMultipleDirectories(paths: string[]) {
  return useQueries({
    queries: paths.map(path => ({
      queryKey: queryKeys.filesByPath(path),
      queryFn: () => fetchDirectory(path),
      meta: {
        errorMessage: 'Failed to browse directory'
      }
    }))
  });
}

/**
 * Prefetch directory contents
 * 
 * @param path - Directory path to prefetch
 * @returns Promise that resolves when prefetching is complete
 */
export async function prefetchDirectory(path: string): Promise<void> {
  const queryClient = getClient();
  
  await queryClient.prefetchQuery({
    queryKey: queryKeys.filesByPath(path),
    queryFn: () => fetchDirectory(path)
  });
}

/**
 * Invalidate directory cache
 * 
 * @param path - Directory path to invalidate
 */
export function invalidateDirectory(path: string): void {
  const queryClient = getClient();
  queryClient.invalidateQueries({ queryKey: queryKeys.filesByPath(path) });
}

/**
 * Get file URL
 * 
 * @param filePath - Path to the file
 * @returns URL to access the file
 */
export function getFileUrl(filePath: string): string {
  const encodedPath = encodeURIComponent(filePath);
  return `${MEDIA_SERVER_URL}/api/files/view?path=${encodedPath}`;
}

/**
 * Download file
 * 
 * @param filePath - Path to the file
 */
export function downloadFile(filePath: string): void {
  const fileUrl = getFileUrl(filePath);
  window.open(fileUrl, '_blank');
} 