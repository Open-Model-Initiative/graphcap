"use client";

// SPDX-License-Identifier: Apache-2.0
import { useCallback } from "react";
import { useTreeContext } from "../TreeContext";
import type { TreeItemData } from "../types";

/**
 * Custom hook for tree-specific logic.
 *
 * @returns {Object} Tree-specific functions and utilities.
 */
export function useTree() {
	const { state, dispatch, selectItem, toggleExpand } = useTreeContext();

	/**
	 * Find an item by ID in the tree.
	 *
	 * @param {string} id - The ID of the item to find.
	 * @returns {TreeItemData | undefined} The found item or undefined.
	 */
	const findItemById = useCallback(
		(id: string): TreeItemData | undefined => {
			const findInItems = (items: TreeItemData[]): TreeItemData | undefined => {
				for (const item of items) {
					if (item.id === id) {
						return item;
					}

					if (item.children && item.children.length > 0) {
						const found = findInItems(item.children);
						if (found) {
							return found;
						}
					}
				}

				return undefined;
			};

			return findInItems(state.items);
		},
		[state.items],
	);

	/**
	 * Expand all items in the tree.
	 */
	const expandAll = useCallback(() => {
		dispatch({ type: "EXPAND_ALL" });
	}, [dispatch]);

	/**
	 * Collapse all items in the tree.
	 */
	const collapseAll = useCallback(() => {
		dispatch({ type: "COLLAPSE_ALL" });
	}, [dispatch]);

	/**
	 * Expand the path to a specific item.
	 *
	 * @param {string} itemId - The ID of the item to expand to.
	 */
	const expandToItem = useCallback(
		(itemId: string) => {
			// Helper function to find the path to an item
			const findPathToItem = (
				items: TreeItemData[],
				id: string,
				path: TreeItemData[] = [],
			): TreeItemData[] | null => {
				for (const item of items) {
					// Create a new path including this item
					const newPath = [...path, item];

					// If this is the item we're looking for, return the path
					if (item.id === id) {
						return newPath;
					}

					// If this item has children, search in them
					if (item.children && item.children.length > 0) {
						const foundPath = findPathToItem(item.children, id, newPath);
						if (foundPath) {
							return foundPath;
						}
					}
				}

				// Item not found in this branch
				return null;
			};

			// Find the path to the item
			const path = findPathToItem(state.items, itemId);

			// If we found a path, expand all items in the path except the last one
			if (path) {
				// Expand all parent items (all items in the path except the target item)
				path.slice(0, -1).forEach((item) => {
					if (!item.isExpanded) {
						toggleExpand(item);
					}
				});

				// Let the route determine selection state
				// Just call selectItem to trigger navigation
				if (path.length > 0) {
					selectItem(path[path.length - 1]);
				}
			}
		},
		[state.items, toggleExpand, selectItem],
	);

	return {
		items: state.items,
		selectedItemId: state.selectedItemId,
		selectedItem: state.selectedItem,
		findItemById,
		selectItem,
		toggleExpand,
		expandAll,
		collapseAll,
		expandToItem,
	};
}
