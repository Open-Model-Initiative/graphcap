// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { TreeNode } from './TreeNode';
import { TreeGroup } from './TreeGroup';
import { TreeIcon, IconType } from './TreeIcon';

export interface TreeItemData {
  /** Unique identifier for the item */
  id: string;
  /** Display name for the item */
  name: string;
  /** Optional path or other data associated with the item */
  path?: string;
  /** Children items */
  children?: TreeItemData[];
  /** Icon type to display */
  iconType?: IconType;
  /** Whether the item is expanded */
  isExpanded?: boolean;
  /** Custom data associated with the item */
  data?: any;
}

export interface TreeProps {
  /** The items to display in the tree */
  items: TreeItemData[];
  /** The currently selected item ID */
  selectedItemId?: string;
  /** Called when an item is selected */
  onSelectItem?: (item: TreeItemData) => void;
  /** Called when an item's expanded state is toggled */
  onToggleExpand?: (item: TreeItemData) => void;
  /** Optional class name to apply to the tree container */
  className?: string;
}

/**
 * A component that renders a hierarchical tree view
 */
export function Tree({
  items,
  selectedItemId,
  onSelectItem,
  onToggleExpand,
  className = ''
}: TreeProps) {
  const renderTreeItem = (item: TreeItemData) => {
    const hasChildren = item.children && item.children.length > 0;
    const isSelected = item.id === selectedItemId;
    
    // Sort children alphabetically if they exist
    const sortedChildren = item.children 
      ? [...item.children].sort((a, b) => a.name.localeCompare(b.name))
      : [];

    return (
      <div key={item.id} className="group">
        <TreeNode
          label={item.name}
          isSelected={isSelected}
          hasChildren={hasChildren}
          isExpanded={item.isExpanded}
          icon={<TreeIcon type={item.iconType || (hasChildren ? 'folder' : 'file')} />}
          onClick={() => onSelectItem?.(item)}
          onToggleExpand={() => onToggleExpand?.(item)}
        />
        
        {hasChildren && (
          <TreeGroup isExpanded={!!item.isExpanded}>
            {sortedChildren.map(child => renderTreeItem(child))}
          </TreeGroup>
        )}
      </div>
    );
  };

  return (
    <div className={`text-sm text-gray-300 space-y-1.5 p-1 ${className}`}>
      {items.map(item => renderTreeItem(item))}
    </div>
  );
} 