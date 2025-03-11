// SPDX-License-Identifier: Apache-2.0
import { memo, useCallback } from 'react';
import { FileItem } from './types';
import { FileTreeItem } from './FileTreeItem';
import { CSS_CLASSES } from './constants';

interface FileTreeProps {
  files: FileItem[];
  isLoading: boolean;
  expandedDirs: Set<string>;
  selectedFile: string | null;
  onItemClick: (item: FileItem) => void;
}

/**
 * FileTree component for rendering the file tree
 * 
 * @param files - The list of files to render
 * @param isLoading - Whether the file browser is loading
 * @param expandedDirs - Set of expanded directory IDs
 * @param selectedFile - ID of the selected file
 * @param onItemClick - Callback for when an item is clicked
 */
function FileTreeComponent({
  files,
  isLoading,
  expandedDirs,
  selectedFile,
  onItemClick
}: FileTreeProps) {
  const renderFileTree = useCallback((items: FileItem[], level = 0) => {
    return items.map(item => (
      <div key={item.id}>
        <FileTreeItem
          item={item}
          level={level}
          isSelected={selectedFile === item.id}
          isExpanded={expandedDirs.has(item.id)}
          onItemClick={onItemClick}
        />
        
        {item.type === 'directory' && 
         expandedDirs.has(item.id) && 
         item.children && 
         renderFileTree(item.children, level + 1)}
      </div>
    ));
  }, [expandedDirs, selectedFile, onItemClick]);

  return (
    <div className={CSS_CLASSES.CONTAINER.BORDER}>
      <div className={CSS_CLASSES.CONTAINER.HEADER}>
        Files
      </div>
      <div className={CSS_CLASSES.CONTAINER.CONTENT}>
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <span className="animate-spin mr-2" aria-hidden="true">⟳</span> 
            <span>Loading...</span>
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
  );
}

// Memoize the component to prevent unnecessary re-renders
export const FileTree = memo(FileTreeComponent); 