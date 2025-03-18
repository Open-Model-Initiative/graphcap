// SPDX-License-Identifier: Apache-2.0
import React from "react";

/**
 * Props for the TreeGroup component.
 *
 * @interface TreeGroupProps
 * @property {boolean} isExpanded - Whether the group is expanded.
 * @property {React.ReactNode} children - The children to render when expanded.
 */
export interface TreeGroupProps {
	readonly isExpanded: boolean;
	readonly children: React.ReactNode;
}

/**
 * A component that renders a group of tree nodes with proper indentation and styling.
 *
 * @param {TreeGroupProps} props - The props for the TreeGroup component.
 * @returns {JSX.Element | null} The rendered group of tree nodes or null if not expanded.
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
