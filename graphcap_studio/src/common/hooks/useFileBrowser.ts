// SPDX-License-Identifier: Apache-2.0
import { useState, useCallback, useEffect } from 'react';
import { FileItem } from '../components/file-browser/FileBrowserPanel';

interface FetchDirectoryResult {
  success: boolean;
  path: string;
  contents: FileItem[];
  error?: string;
}

interface DirectoryCache {
  [path: string]: FileItem[];
}

// Get the Media Server URL from environment variables
const MEDIA_SERVER_URL = import.meta.env.VITE_MEDIA_SERVER_URL?.replace('graphcap_media_server', 'localhost') ?? 'http://localhost:32400';

/**
 * Custom hook for file browser functionality
 * 
 * This hook provides functions to browse the workspace directory.
 */
export function useFileBrowser() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState('/');
  const [rawFiles, setRawFiles] = useState<FileItem[]>([]);
  const [processedFiles, setProcessedFiles] = useState<FileItem[]>([]);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['']));
  const [directoryCache, setDirectoryCache] = useState<DirectoryCache>({});
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  /**
   * Fetch directory contents from the server
   */
  const fetchDirectory = useCallback(async (path: string = '/'): Promise<FetchDirectoryResult> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check cache first
      if (directoryCache[path]) {
        return {
          success: true,
          path,
          contents: directoryCache[path]
        };
      }
      
      const response = await fetch(`${MEDIA_SERVER_URL}/api/files/browse?path=${encodeURIComponent(path)}`);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch directory contents');
      }
      
      // Update cache
      setDirectoryCache(prev => ({
        ...prev,
        [path]: data.contents
      }));
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        path: path,
        contents: [],
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [directoryCache]);

  /**
   * Load directory contents
   */
  const loadDirectory = useCallback(async (path: string = '/') => {
    const result = await fetchDirectory(path);
    
    if (result.success) {
      setCurrentPath(result.path);
      setRawFiles(result.contents);
    }
    
    return result.success;
  }, [fetchDirectory]);

  /**
   * Navigate to a parent directory
   */
  const navigateUp = useCallback(async () => {
    if (currentPath === '/' || currentPath === '') {
      return false;
    }
    
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
    return loadDirectory(parentPath);
  }, [currentPath, loadDirectory]);

  /**
   * Toggle directory expansion and load its contents if needed
   */
  const toggleDirectory = useCallback(async (id: string) => {
    // Check if directory is already expanded
    const isExpanded = expandedDirs.has(id);
    
    // Update expanded directories
    setExpandedDirs(prev => {
      const newSet = new Set(prev);
      if (isExpanded) {
        newSet.delete(id);
      } else {
        newSet.add(id);
        
        // Load directory contents if not already loaded
        if (!directoryCache[id]) {
          fetchDirectory(id);
        }
      }
      return newSet;
    });
  }, [expandedDirs, directoryCache, fetchDirectory]);

  /**
   * Select a file
   */
  const selectFile = useCallback((id: string) => {
    setSelectedFile(id);
  }, []);

  /**
   * Refresh the current directory and clear cache
   */
  const refreshDirectory = useCallback(async () => {
    // Clear cache for current path
    setDirectoryCache(prev => {
      const newCache = { ...prev };
      delete newCache[currentPath];
      return newCache;
    });
    
    return loadDirectory(currentPath);
  }, [loadDirectory, currentPath]);

  /**
   * Build a nested file tree from flat file list
   */
  const buildFileTree = useCallback((fileList: FileItem[]): FileItem[] => {
    // Create a map of directories
    const dirMap: { [id: string]: FileItem } = {};
    
    // Create a copy of the file list to avoid mutating the original
    const result: FileItem[] = [];
    
    // First pass: create all directories and files
    fileList.forEach(item => {
      // Add to the result array
      result.push(item);
      
      // If it's a directory, add to the directory map
      if (item.type === 'directory') {
        dirMap[item.id] = item;
        
        // Initialize children array if not already present
        if (!item.children) {
          item.children = [];
        }
        
        // If this directory is expanded and we have cached contents, add them as children
        if (expandedDirs.has(item.id) && directoryCache[item.id]) {
          item.children = directoryCache[item.id];
        }
      }
    });
    
    return result;
  }, [expandedDirs, directoryCache]);

  // Process files into a tree structure whenever raw files or cache changes
  useEffect(() => {
    const processedFiles = buildFileTree(rawFiles);
    setProcessedFiles(processedFiles);
  }, [rawFiles, directoryCache, expandedDirs, buildFileTree]);

  // Initial load
  useEffect(() => {
    loadDirectory('/');
  }, [loadDirectory]);

  return {
    files: processedFiles,
    isLoading,
    error,
    currentPath,
    expandedDirs,
    selectedFile,
    loadDirectory,
    navigateUp,
    toggleDirectory,
    selectFile,
    refreshDirectory
  };
} 