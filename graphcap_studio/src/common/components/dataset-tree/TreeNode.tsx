"use client"

// SPDX-License-Identifier: Apache-2.0
import type React from "react"
import type { ReactNode } from "react"
import { TreeChevron } from "./TreeChevron"

/**
 * Props for the TreeNode component.
 * 
 * @interface TreeNodeProps
 * @property {string} label - The label to display for the node.
 * @property {boolean} [isSelected] - Whether the node is currently selected.
 * @property {boolean} [hasChildren] - Whether the node has children.
 * @property {boolean} [isExpanded] - Whether the node is expanded (only relevant if hasChildren is true).
 * @property {React.ReactNode} [icon] - Icon to display before the label.
 * @property {() => void} [onClick] - Called when the node is clicked.
 * @property {() => void} [onToggleExpand] - Called when the expand/collapse button is clicked.
 * @property {React.ComponentType<{ children: ReactNode; className: string }>} [wrapperComponent] - Optional custom component to wrap the node content (e.g., a Link).
 */
export interface TreeNodeProps {
  readonly label: string
  readonly isSelected?: boolean
  readonly hasChildren?: boolean
  readonly isExpanded?: boolean
  readonly icon?: React.ReactNode
  readonly onClick?: () => void
  readonly onToggleExpand?: () => void
  readonly wrapperComponent?: React.ComponentType<{ children: ReactNode; className: string }>
}

/**
 * A component that renders a single node in a tree view.
 * 
 * @param {TreeNodeProps} props - The props for the TreeNode component.
 * @returns {JSX.Element} The rendered tree node component.
 */
export function TreeNode({
  label,
  isSelected = false,
  hasChildren = false,
  isExpanded = false,
  icon,
  onClick,
  onToggleExpand,
  wrapperComponent: WrapperComponent,
}: TreeNodeProps) {
  const nodeClassName = `flex cursor-pointer items-center rounded-md py-1.5 px-2 transition-all duration-150 ${
    isSelected
      ? "bg-blue-900/70 text-blue-100 border border-blue-500/60 shadow-sm shadow-blue-900/20"
      : "text-gray-200 hover:bg-gray-800/90 hover:text-gray-50 hover:shadow-sm"
  }`

  const handleChevronClick = () => {
    onToggleExpand?.()
  }

  const nodeContent = (
    <>
      {hasChildren ? (
        <TreeChevron isExpanded={isExpanded} onClick={handleChevronClick} />
      ) : (
        <span className="mr-1.5 h-5 w-5" />
      )}

      {icon && <span className="mr-2">{icon}</span>}

      <span className="flex-1 truncate font-medium">{label}</span>
    </>
  )

  if (WrapperComponent) {
    return <WrapperComponent className={nodeClassName}>{nodeContent}</WrapperComponent>
  }

  return (
    <div
      className={nodeClassName}
      onClick={onClick}
      role="treeitem"
      aria-selected={isSelected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick?.()
          e.preventDefault()
        }
      }}
    >
      {nodeContent}
    </div>
  )
}

