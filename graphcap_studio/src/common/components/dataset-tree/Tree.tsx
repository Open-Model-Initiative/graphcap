"use client"

// SPDX-License-Identifier: Apache-2.0
import type React from "react"
import { TreeNode } from "./TreeNode"
import { TreeGroup } from "./TreeGroup"
import { TreeIcon, type IconType } from "./TreeIcon"

/**
 * Represents the data structure for each item in the tree.
 * 
 * @interface TreeItemData
 * @property {string} id - Unique identifier for the item.
 * @property {string} name - The name of the item.
 * @property {string} [path] - Optional path for the item.
 * @property {TreeItemData[]} [children] - Optional array of child items.
 * @property {IconType} [iconType] - Optional icon type for the item.
 * @property {boolean} [isExpanded] - Indicates if the item is expanded.
 * @property {any} [data] - Optional additional data associated with the item.
 */
export interface TreeItemData {
  /** Unique identifier for the item */
  id: string
  name: string
  path?: string
  children?: TreeItemData[]
  iconType?: IconType
  isExpanded?: boolean
  data?: any
}

/**
 * Props for the Tree component.
 * 
 * @interface TreeProps
 * @property {TreeItemData[]} items - The items to be displayed in the tree.
 * @property {string} [selectedItemId] - The ID of the currently selected item.
 * @property {(item: TreeItemData) => void} [onSelectItem] - Callback function when an item is selected.
 * @property {(item: TreeItemData) => void} [onToggleExpand] - Callback function when an item is expanded or collapsed.
 * @property {string} [className] - Optional additional class names for styling.
 * @property {(item: TreeItemData) => React.ComponentType<{ children: React.ReactNode; className: string }> | undefined} [getWrapperComponent] - Function to get a custom wrapper component for each item.
 */
export interface TreeProps {
  readonly items: TreeItemData[]
  readonly selectedItemId?: string
  readonly onSelectItem?: (item: TreeItemData) => void
  readonly onToggleExpand?: (item: TreeItemData) => void
  readonly className?: string
  readonly getWrapperComponent?: (
    item: TreeItemData,
  ) => React.ComponentType<{ children: React.ReactNode; className: string }> | undefined
}

/**
 * A component that renders a hierarchical tree view.
 * 
 * @param {TreeProps} props - The props for the Tree component.
 * @returns {JSX.Element} The rendered tree component.
 */
export function Tree({
  items,
  selectedItemId,
  onSelectItem,
  onToggleExpand,
  className = "",
  getWrapperComponent,
}: TreeProps) {
  const renderTreeItem = (item: TreeItemData) => {
    const hasChildren = item.children && item.children.length > 0
    const isSelected = item.id === selectedItemId

    // Sort children alphabetically
    const sortedChildren =
      hasChildren && item.children ? [...item.children].sort((a, b) => a.name.localeCompare(b.name)) : []

    // Handle item selection - this should only happen when clicking on the node itself, not the chevron
    const handleItemClick = () => {
      onSelectItem?.(item)
    }

    // Handle toggle expand - this should only happen when clicking on the chevron
    const handleToggleExpand = () => {
      onToggleExpand?.(item)
    }

    return (
      <div key={item.id} className="group transition-all duration-200">
        <TreeNode
          label={item.name}
          isSelected={isSelected}
          hasChildren={hasChildren}
          isExpanded={item.isExpanded}
          icon={<TreeIcon type={item.iconType ?? (hasChildren ? "folder" : "file")} />}
          onClick={handleItemClick}
          onToggleExpand={handleToggleExpand}
          wrapperComponent={getWrapperComponent ? getWrapperComponent(item) : undefined}
        />

        {hasChildren && (
          <TreeGroup isExpanded={!!item.isExpanded}>{sortedChildren.map((child) => renderTreeItem(child))}</TreeGroup>
        )}
      </div>
    )
  }

  return (
    <div className={`py-2 space-y-0.5 ${className}`} role="tree">
      {items.map((item) => renderTreeItem(item))}
    </div>
  )
}

