// SPDX-License-Identifier: Apache-2.0
import { useState } from 'react';

interface FileItem {
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
  // Mock file structure for demonstration
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: 'workspace',
      name: 'workspace',
      type: 'directory',
      children: [
        {
          id: 'images',
          name: 'images',
          type: 'directory',
          children: [
            { id: 'image1.jpg', name: 'image1.jpg', type: 'file', size: 1024 * 1024 },
            { id: 'image2.png', name: 'image2.png', type: 'file', size: 2.5 * 1024 * 1024 }
          ]
        },
        {
          id: 'data',
          name: 'data',
          type: 'directory',
          children: [
            { id: 'data.json', name: 'data.json', type: 'file', size: 15 * 1024 }
          ]
        },
        { id: 'README.md', name: 'README.md', type: 'file', size: 2 * 1024 }
      ]
    }
  ]);
  
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['workspace']));
  
  const toggleDirectory = (id: string) => {
    setExpandedDirs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  
  const formatSize = (bytes?: number) => {
    if (bytes === undefined) return '';
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  const renderFileTree = (items: FileItem[], level = 0) => {
    return items.map(item => (
      <div key={item.id} style={{ marginLeft: `${level * 16}px` }}>
        <div 
          className="flex items-center py-1 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-gray-900 dark:text-gray-100"
          onClick={() => item.type === 'directory' && toggleDirectory(item.id)}
        >
          <span className="mr-1">
            {item.type === 'directory' ? 
              (expandedDirs.has(item.id) ? '📂' : '📁') : 
              '📄'}
          </span>
          <span className="flex-1 truncate">{item.name}</span>
          {item.type === 'file' && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatSize(item.size)}
            </span>
          )}
        </div>
        
        {item.type === 'directory' && 
         expandedDirs.has(item.id) && 
         item.children && 
         renderFileTree(item.children, level + 1)}
      </div>
    ));
  };
  
  return (
    <div className="text-sm text-gray-900 dark:text-gray-100">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium">Workspace Files</h3>
        <button className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200">
          Refresh
        </button>
      </div>
      
      <div className="border rounded border-gray-300 dark:border-gray-700 overflow-hidden">
        <div className="p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 text-xs font-medium">
          Files
        </div>
        <div className="p-2 max-h-96 overflow-y-auto bg-white dark:bg-gray-900">
          {renderFileTree(files)}
        </div>
      </div>
    </div>
  );
} 