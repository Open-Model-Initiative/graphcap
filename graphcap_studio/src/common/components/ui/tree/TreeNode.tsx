// SPDX-License-Identifier: Apache-2.0
import React from 'react';

export interface TreeNodeProps {
  /** The label to display for the node */
  label: string;
  /** Whether the node is currently selected */
  isSelected?: boolean;
  /** Whether the node has children */
  hasChildren?: boolean;
  /** Whether the node is expanded (only relevant if hasChildren is true) */
  isExpanded?: boolean;
  /** Icon to display before the label */
  icon?: React.ReactNode;
  /** Called when the node is clicked */
  onClick?: () => void;
  /** Called when the expand/collapse button is clicked */
  onToggleExpand?: () => void;
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
    >
      {hasChildren ? (
        <div 
          className="mr-1.5 w-5 h-5 flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand?.();
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
        </div>
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