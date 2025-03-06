// SPDX-License-Identifier: Apache-2.0
import React from 'react';

export interface TreeGroupProps {
  /** Whether the group is expanded */
  isExpanded: boolean;
  /** The children to render when expanded */
  children: React.ReactNode;
}

/**
 * A component that renders a group of tree nodes with proper indentation and styling
 */
export function TreeGroup({ isExpanded, children }: TreeGroupProps) {
  if (!isExpanded) {
    return null;
  }

  return (
    <div className="ml-4 border-l border-gray-500 pl-2 mt-1 space-y-1 py-1">
      {children}
    </div>
  );
} 