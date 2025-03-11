// SPDX-License-Identifier: Apache-2.0

/**
 * File browser type definitions
 */

/**
 * Represents a file or directory item in the file browser
 */
export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'directory';
  size?: number;
  lastModified?: string;
  children?: FileItem[];
}

/**
 * Result of a directory fetch operation
 */
export interface FetchDirectoryResult {
  success: boolean;
  path: string;
  contents: FileItem[];
  error?: string;
}

/**
 * Cache for directory contents
 */
export interface DirectoryCache {
  [path: string]: FileItem[];
} 