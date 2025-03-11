// SPDX-License-Identifier: Apache-2.0
import { useCallback } from 'react';
import { useFileBrowser } from '../../hooks/useFileBrowser';
import { FileIcon } from './FileIcon';

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'directory';
  size?: number;
  lastModified?: string;
  children?: FileItem[];
}

/**
 * File Browser Panel component
 * 
 * This component displays a file browser for the workspace directory.
 */
export function FileBrowserPanel() {
  const {
    files,
    isLoading,
    error,
    currentPath,
    expandedDirs,
    selectedFile,
    toggleDirectory,
    selectFile,
    navigateUp,
    refreshDirectory
  } = useFileBrowser();
  
  const formatSize = useCallback((bytes?: number) => {
    if (bytes === undefined) return '';
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, []);
  
  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }, []);
  
  const handleItemClick = useCallback((item: FileItem) => {
    if (item.type === 'directory') {
      toggleDirectory(item.id);
    } else {
      selectFile(item.id);
    }
  }, [toggleDirectory, selectFile]);
  
  const renderFileTree = useCallback((items: FileItem[], level = 0) => {
    return items.map(item => (
      <div key={item.id} style={{ marginLeft: `${level * 16}px` }}>
        <div 
          className={`flex items-center py-1 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-gray-900 dark:text-gray-100 ${selectedFile === item.id ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
          onClick={() => handleItemClick(item)}
        >
          <span className="mr-1">
            <FileIcon 
              fileName={item.name}
              isDirectory={item.type === 'directory'}
              isExpanded={item.type === 'directory' && expandedDirs.has(item.id)}
            />
          </span>
          <span className="flex-1 truncate">{item.name}</span>
          <div className="flex flex-col items-end text-xs text-gray-500 dark:text-gray-400">
            {item.type === 'file' && (
              <>
                <span>{formatSize(item.size)}</span>
                <span>{formatDate(item.lastModified)}</span>
              </>
            )}
          </div>
        </div>
        
        {item.type === 'directory' && 
         expandedDirs.has(item.id) && 
         item.children && 
         renderFileTree(item.children, level + 1)}
      </div>
    ));
  }, [expandedDirs, formatSize, formatDate, handleItemClick, selectedFile]);
  
  return (
    <div className="text-sm text-gray-900 dark:text-gray-100">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <h3 className="font-medium">Workspace Files</h3>
          {currentPath !== '/' && (
            <button 
              className="ml-2 text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
              onClick={navigateUp}
              disabled={isLoading}
            >
              ⬆️ Up
            </button>
          )}
        </div>
        <button 
          className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
          onClick={refreshDirectory}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : '🔄 Refresh'}
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
          {error}
        </div>
      )}
      
      <div className="mb-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
        <span className="font-medium">Path:</span> {currentPath}
      </div>
      
      <div className="border rounded border-gray-300 dark:border-gray-700 overflow-hidden">
        <div className="p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 text-xs font-medium">
          Files
        </div>
        <div className="p-2 max-h-96 overflow-y-auto bg-white dark:bg-gray-900">
          {isLoading ? (
            <div className="flex justify-center items-center py-4">
              <span className="animate-spin mr-2">⟳</span> Loading...
            </div>
          ) : files.length === 0 ? (
            <div className="py-4 text-center text-gray-500 dark:text-gray-400">
              No files found
            </div>
          ) : (
            renderFileTree(files)
          )}
        </div>
      </div>
    </div>
  );
} 