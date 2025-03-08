"use client"

// SPDX-License-Identifier: Apache-2.0
import type React from "react"
import { useRef, useCallback } from "react"
import { useNavigate } from "@tanstack/react-router"
import { TreeNode } from "./TreeNode"
import { TreeGroup } from "./TreeGroup"
import { TreeIcon } from "./TreeIcon"
import { TreeProvider, useTreeContext } from "./TreeContext"
import { TreeItemData, TreeContextMenuAction, IconType } from "./types"

/**
 * Props for the Tree component.
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
  readonly contextMenuActions?: TreeContextMenuAction[]
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
  contextMenuActions = [],
}: TreeProps) {
  const navigate = useNavigate()
  
  // Handle navigation directly without duplicating selection state
  const handleItemClick = useCallback((item: TreeItemData) => {
    // Call the parent's onSelectItem callback if provided
    if (onSelectItem) {
      onSelectItem(item)
    }
    
    // If it's a dataset, navigate to the gallery view
    // The route will determine the selection state
    if (item.iconType === 'dataset') {
      const path = `/gallery/${item.id}`
      navigate({ to: path })
    }
  }, [navigate, onSelectItem])

  return (
    <TreeProvider
      items={items}
      selectedItemId={selectedItemId}
      onSelectItem={handleItemClick}
      onToggleExpand={onToggleExpand}
      getWrapperComponent={getWrapperComponent}
      contextMenuActions={contextMenuActions}
    >
      <TreeContent className={className} />
    </TreeProvider>
  )
}

/**
 * Props for the TreeContent component.
 */
interface TreeContentProps {
  readonly className?: string
}

/**
 * The inner content of the Tree component that uses the TreeContext.
 * 
 * @param {TreeContentProps} props - The props for the TreeContent component.
 * @returns {JSX.Element} The rendered tree content.
 */
function TreeContent({ className = "" }: TreeContentProps) {
  const { state } = useTreeContext()
  const treeRef = useRef<HTMLDivElement>(null)
  
  return (
    <div 
      ref={treeRef}
      className={`py-2 space-y-0.5 ${className}`} 
      role="tree"
    >
      {state.items.map((item) => (
        <TreeItemRenderer key={item.id} item={item} />
      ))}
    </div>
  )
}

/**
 * Props for the TreeItemRenderer component.
 */
interface TreeItemRendererProps {
  readonly item: TreeItemData
}

/**
 * Component that renders a single tree item and its children.
 * 
 * @param {TreeItemRendererProps} props - The props for the TreeItemRenderer component.
 * @returns {JSX.Element} The rendered tree item.
 */
function TreeItemRenderer({ item }: TreeItemRendererProps) {
  const { state, selectItem, toggleExpand, getWrapperComponent, contextMenuActions } = useTreeContext()
  
  const hasChildren = item.children && item.children.length > 0
  const isSelected = item.id === state.selectedItemId
  
  // Sort children alphabetically
  const sortedChildren =
    hasChildren && item.children ? [...item.children].sort((a, b) => a.name.localeCompare(b.name)) : []
  
  const handleItemClick = useCallback(() => {
    // Let the route determine selection state
    selectItem(item);
  }, [item, selectItem]);
  
  const handleToggleExpand = useCallback(() => {
    toggleExpand(item);
  }, [item, toggleExpand]);
  
  return (
    <div className="group transition-all duration-200">
      <TreeNode
        label={item.name}
        isSelected={isSelected}
        hasChildren={hasChildren}
        isExpanded={item.isExpanded}
        icon={<TreeIcon type={item.iconType ?? (hasChildren ? "folder" : "file")} />}
        onClick={handleItemClick}
        onToggleExpand={handleToggleExpand}
        wrapperComponent={getWrapperComponent ? getWrapperComponent(item) : undefined}
        item={item}
        contextMenuActions={contextMenuActions}
      />
      
      {hasChildren && (
        <TreeGroup isExpanded={!!item.isExpanded}>
          {sortedChildren.map((child) => (
            <TreeItemRenderer key={child.id} item={child} />
          ))}
        </TreeGroup>
      )}
    </div>
  )
}

