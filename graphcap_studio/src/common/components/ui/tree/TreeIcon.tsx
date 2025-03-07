// SPDX-License-Identifier: Apache-2.0
import React from 'react';

export type IconType = 'dataset' | 'folder' | 'file';

export interface TreeIconProps {
  /** The type of icon to display */
  readonly type: IconType;
  /** Optional custom color class to apply to the icon */
  readonly colorClass?: string;
}

/**
 * A component that renders different types of icons for tree nodes
 */
export function TreeIcon({ type, colorClass }: TreeIconProps) {
  const getDefaultColorClass = () => {
    switch (type) {
      case 'dataset':
        return 'text-yellow-300';
      case 'folder':
        return 'text-blue-300';
      case 'file':
        return 'text-gray-400';
      default:
        return 'text-gray-300';
    }
  };

  const finalColorClass = colorClass ?? getDefaultColorClass();

  // Determine which path to render based on icon type
  const renderIconPath = () => {
    if (type === 'dataset') {
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
        />
      );
    } else if (type === 'folder') {
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
        />
      );
    } else {
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      );
    }
  };

  return (
    <svg
      className={`h-5 w-5 ${finalColorClass}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      {renderIconPath()}
    </svg>
  );
} 