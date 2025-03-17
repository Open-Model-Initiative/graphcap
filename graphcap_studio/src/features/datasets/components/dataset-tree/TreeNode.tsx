"use client";

// SPDX-License-Identifier: Apache-2.0
import type React from "react";
import type { ReactNode } from "react";
import { useRef } from "react";
import { TreeChevron } from "./TreeChevron";
import { HamburgerMenuButton, TreeContextMenu } from "./TreeContextMenu";
import { useContextMenu } from "./hooks/useContextMenu";
import { TreeContextMenuAction, TreeItemData } from "./types";

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
 * @property {React.ComponentType<{ children: ReactNode; className: string; onClick?: (e: React.MouseEvent) => void }>} [wrapperComponent] - Optional custom component to wrap the node content (e.g., a Link).
 * @property {TreeItemData} [item] - The tree item data associated with this node.
 * @property {TreeContextMenuAction[]} [contextMenuActions] - Optional array of context menu actions for this node.
 */
export interface TreeNodeProps {
	readonly label: string;
	readonly isSelected?: boolean;
	readonly hasChildren?: boolean;
	readonly isExpanded?: boolean;
	readonly icon?: React.ReactNode;
	readonly onClick?: () => void;
	readonly onToggleExpand?: () => void;
	readonly wrapperComponent?: React.ComponentType<{
		children: ReactNode;
		className: string;
		onClick?: (e: React.MouseEvent) => void;
	}>;
	readonly item?: TreeItemData;
	readonly contextMenuActions?: TreeContextMenuAction[];
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
	item,
	contextMenuActions = [],
}: TreeNodeProps) {
	const { isOpen, ref, open, close, toggle } = useContextMenu();
	const nodeRef = useRef<HTMLDivElement>(null);

	const nodeClassName = `flex cursor-pointer items-center rounded-md py-1.5 px-2 transition-all duration-150 ${
		isSelected
			? "bg-blue-900/70 text-blue-100 border border-blue-500/60 shadow-sm shadow-blue-900/20"
			: "text-gray-200 hover:bg-gray-800/90 hover:text-gray-50 hover:shadow-sm"
	}`;

	const handleChevronClick = (e: React.MouseEvent | React.KeyboardEvent) => {
		e.stopPropagation();
		onToggleExpand?.();
	};

	const handleContextMenu = (e: React.MouseEvent) => {
		if (contextMenuActions.length > 0 && item) {
			e.preventDefault();
			open();
		}
	};

	const handleMenuButtonClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		toggle();
	};

	const handleNodeClick = (e: React.MouseEvent) => {
		const isChevronClick =
			(e.target as HTMLElement).closest(".tree-chevron") !== null;
		const isMenuButtonClick =
			(e.target as HTMLElement).closest(".menu-button") !== null;

		if (isChevronClick || isMenuButtonClick) {
			return;
		}

		e.stopPropagation();
		onClick?.();
	};

	const nodeContent = (
		<>
			{hasChildren ? (
				<TreeChevron isExpanded={isExpanded} onClick={handleChevronClick} />
			) : (
				<span className="mr-1.5 h-5 w-5" />
			)}

			{icon && <span className="mr-2">{icon}</span>}

			<span className="flex-1 truncate font-medium">{label}</span>

			{contextMenuActions.length > 0 && item && (
				<HamburgerMenuButton onClick={handleMenuButtonClick} />
			)}

			{item && contextMenuActions.length > 0 && (
				<TreeContextMenu
					item={item}
					isOpen={isOpen}
					onClose={close}
					actions={contextMenuActions}
					menuRef={ref}
				/>
			)}
		</>
	);

	if (WrapperComponent) {
		return (
			<div
				ref={nodeRef}
				className="relative"
				onContextMenu={handleContextMenu}
				role="treeitem"
				aria-selected={isSelected}
				tabIndex={0}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						handleNodeClick(e as unknown as React.MouseEvent);
					}
				}}
			>
				<WrapperComponent className={nodeClassName} onClick={handleNodeClick}>
					{nodeContent}
				</WrapperComponent>
			</div>
		);
	}

	return (
		<div
			ref={nodeRef}
			className={`relative ${nodeClassName}`}
			onClick={handleNodeClick}
			onContextMenu={handleContextMenu}
			role="treeitem"
			aria-selected={isSelected}
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					onClick?.();
					e.preventDefault();
				}
			}}
		>
			{nodeContent}
		</div>
	);
}
