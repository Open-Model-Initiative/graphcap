"use client"

// SPDX-License-Identifier: Apache-2.0
import { useRef } from "react"
import { TreeItemData, TreeContextMenuAction } from "./types"
import { MoreVertical, Trash2, Edit, Copy, FileUp, Download, FolderOpen } from "lucide-react"

/**
 * Props for the TreeContextMenu component.
 * 
 * @interface TreeContextMenuProps
 * @property {TreeItemData} item - The tree item data associated with this menu.
 * @property {boolean} isOpen - Whether the menu is open.
 * @property {() => void} onClose - Callback when the menu is closed.
 * @property {React.ReactNode} [children] - Optional children to render in the menu.
 */
export interface TreeContextMenuProps {
  readonly item: TreeItemData
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly children?: React.ReactNode
  readonly actions?: TreeContextMenuAction[]
  readonly menuRef?: React.RefObject<HTMLDivElement | null>
}

/**
 * A component that renders a context menu for tree nodes.
 * 
 * @param {TreeContextMenuProps} props - The props for the TreeContextMenu component.
 * @returns {JSX.Element | null} The rendered context menu or null if not open.
 */
export function TreeContextMenu({ 
  item, 
  isOpen, 
  onClose, 
  children, 
  actions = [],
  menuRef
}: TreeContextMenuProps) {
  const defaultRef = useRef<HTMLDivElement>(null)
  const ref = menuRef || defaultRef
  
  if (!isOpen) return null
  
  return (
    <div 
      ref={ref}
      className="absolute right-0 z-50 min-w-[180px] bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 text-sm transition-all duration-150"
      role="menu"
    >
      {actions.map((action, _index) => (
        <button
          key={action.label}
          className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-gray-700 transition-colors duration-150 ${
            action.variant === "danger" ? "text-red-400 hover:text-red-300" : "text-gray-200"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            action.onClick(item);
            onClose();
          }}
          role="menuitem"
        >
          {action.icon && (
            <span className="w-4 h-4 flex items-center justify-center">
              {action.icon === "delete" && <Trash2 size={16} />}
              {action.icon === "edit" && <Edit size={16} />}
              {action.icon === "duplicate" && <Copy size={16} />}
              {action.icon === "upload" && <FileUp size={16} />}
              {action.icon === "download" && <Download size={16} />}
              {action.icon === "open" && <FolderOpen size={16} />}
            </span>
          )}
          {action.label}
        </button>
      ))}
      {children}
    </div>
  )
}

/**
 * A component that renders a hamburger menu button.
 * 
 * @param {object} props - The props for the HamburgerMenuButton component.
 * @param {(e: React.MouseEvent) => void} props.onClick - Callback when the button is clicked.
 * @returns {JSX.Element} The rendered hamburger menu button.
 */
export function HamburgerMenuButton({ onClick }: { readonly onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      type="button"
      className="menu-button w-6 h-6 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 hover:bg-gray-700 transition-all duration-200 focus:opacity-100 focus:outline-none"
      onClick={(e) => {
        onClick(e);
      }}
      aria-label="Open menu"
    >
      <MoreVertical size={16} />
    </button>
  )
}
