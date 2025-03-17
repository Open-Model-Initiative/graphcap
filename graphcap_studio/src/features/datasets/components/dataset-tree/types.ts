// SPDX-License-Identifier: Apache-2.0

/**
 * The type of icon that can be displayed.
 */
export type IconType = "dataset" | "folder" | "file";

/**
 * Represents the data structure for each item in the tree.
 */
export interface TreeItemData {
	/** Unique identifier for the item */
	id: string;
	/** The name of the item */
	name: string;
	/** Optional path for the item */
	path?: string;
	/** Optional array of child items */
	children?: TreeItemData[];
	/** Optional icon type for the item */
	iconType?: IconType;
	/** Indicates if the item is expanded */
	isExpanded?: boolean;
	/** Optional additional data associated with the item */
	data?: any;
}

/**
 * Represents an action in the context menu.
 */
export interface TreeContextMenuAction {
	/** The label for the action */
	readonly label: string;
	/** Optional icon name for the action */
	readonly icon?:
		| "delete"
		| "edit"
		| "duplicate"
		| "upload"
		| "download"
		| "open";
	/** Callback when the action is clicked */
	readonly onClick: (item: TreeItemData) => void;
	/** Optional variant for styling (default, danger) */
	readonly variant?: "default" | "danger";
}

/**
 * Tree state interface for the reducer
 */
export interface TreeState {
	/** The items to be displayed in the tree */
	items: TreeItemData[];
	/** The ID of the currently selected item */
	selectedItemId?: string;
	/** The currently selected item */
	selectedItem?: TreeItemData;
}

/**
 * Tree action types for the reducer
 */
export type TreeActionType =
	| { type: "TOGGLE_EXPAND"; payload: { itemId: string } }
	| { type: "SET_ITEMS"; payload: { items: TreeItemData[] } }
	| { type: "EXPAND_ALL" }
	| { type: "COLLAPSE_ALL" };

/**
 * Tree context interface
 */
export interface TreeContextType {
	/** The current tree state */
	state: TreeState;
	/** Dispatch function to update the tree state */
	dispatch: React.Dispatch<TreeActionType>;
	/** Function to select an item */
	selectItem: (item: TreeItemData) => void;
	/** Function to toggle item expansion */
	toggleExpand: (item: TreeItemData) => void;
	/** Optional function to get a custom wrapper component for each item */
	getWrapperComponent?: (
		item: TreeItemData,
	) =>
		| React.ComponentType<{ children: React.ReactNode; className: string }>
		| undefined;
	/** Optional array of context menu actions for each item */
	contextMenuActions?: TreeContextMenuAction[];
}
