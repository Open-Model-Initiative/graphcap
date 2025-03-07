// SPDX-License-Identifier: Apache-2.0
import React from 'react';

export interface TreeNodeProps {
  /** The label to display for the node */
  readonly label: string;
  /** Whether the node is currently selected */
  readonly isSelected?: boolean;
  /** Whether the node has children */
  readonly hasChildren?: boolean;
  /** Whether the node is expanded (only relevant if hasChildren is true) */
  readonly isExpanded?: boolean;
  /** Icon to display before the label */
  readonly icon?: React.ReactNode;
  /** Called when the node is clicked */
  readonly onClick?: () => void;
  /** Called when the expand/collapse button is clicked */
  readonly onToggleExpand?: () => void;
}

/**
 * A component that renders a single node in a tree view
 */
export function TreeNode({
  label,
  isSelected = false,
  hasChildren = false,
  isExpanded = false,
  icon,
  onClick,
  onToggleExpand
}: TreeNodeProps) {
  return (
    <div 
      className={`flex cursor-pointer items-center rounded-md py-1.5 px-2 transition-colors duration-150 ${
        isSelected 
          ? 'bg-blue-800/60 text-blue-200 border border-blue-600/50' 
          : 'text-gray-300 hover:bg-gray-700/80 hover:text-gray-100'
      }`}
      onClick={onClick}
      role="treeitem"
      aria-selected={isSelected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
          e.preventDefault();
        }
      }}
    >
      {hasChildren ? (
        <button 
          className="mr-1.5 w-5 h-5 flex items-center justify-center bg-transparent border-0 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand?.();
          }}
          aria-label={isExpanded ? "Collapse" : "Expand"}
          aria-expanded={isExpanded}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation();
              onToggleExpand?.();
              e.preventDefault();
            }
          }}
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          >
            <path 
              d="M6 12L10 8L6 4" 
              stroke="#9CA3AF" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : (
        <span className="mr-1.5 h-5 w-5" />
      )}
      
      {icon && <span className="mr-2">{icon}</span>}

      <span className="flex-1 truncate">
        {label}
      </span>
    </div>
  );
} 