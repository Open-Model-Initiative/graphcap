// SPDX-License-Identifier: Apache-2.0
import { memo, KeyboardEvent } from 'react';
import { FileItem } from './types';
import { FileIcon } from './FileIcon';
import { CSS_CLASSES, INDENTATION_SIZE } from './constants';
import { formatFileSize, formatDate } from './utils';

interface FileTreeItemProps {
  item: FileItem;
  level: number;
  isSelected: boolean;
  isExpanded: boolean;
  onItemClick: (item: FileItem) => void;
}

/**
 * FileTreeItem component for rendering individual file/directory items
 * 
 * @param item - The file or directory item to render
 * @param level - The indentation level
 * @param isSelected - Whether the item is selected
 * @param isExpanded - Whether the directory is expanded (only applicable for directories)
 * @param onItemClick - Callback for when the item is clicked
 */
function FileTreeItemComponent({
  item,
  level,
  isSelected,
  isExpanded,
  onItemClick
}: Readonly<FileTreeItemProps>) {
  const itemClasses = `${CSS_CLASSES.ITEM.BASE} ${isSelected ? CSS_CLASSES.ITEM.SELECTED : ''}`;
  
  // Handle keyboard events for accessibility
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onItemClick(item);
    }
  };
  
  return (
    <button 
      className={itemClasses}
      onClick={() => onItemClick(item)}
      onKeyDown={handleKeyDown}
      style={{ 
        marginLeft: `${level * INDENTATION_SIZE}px`,
        textAlign: 'left',
        width: '100%'
      }}
      aria-expanded={item.type === 'directory' ? isExpanded : undefined}
      role={item.type === 'directory' ? 'treeitem' : undefined}
      aria-selected={isSelected}
    >
      <span className="mr-1">
        <FileIcon 
          fileName={item.name}
          isDirectory={item.type === 'directory'}
          isExpanded={item.type === 'directory' && isExpanded}
        />
      </span>
      <span className="flex-1 truncate">{item.name}</span>
      <div className="flex flex-col items-end text-xs text-gray-500 dark:text-gray-400">
        {item.type === 'file' && (
          <>
            <span>{formatFileSize(item.size)}</span>
            <span>{formatDate(item.lastModified)}</span>
          </>
        )}
      </div>
    </button>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const FileTreeItem = memo(FileTreeItemComponent); 