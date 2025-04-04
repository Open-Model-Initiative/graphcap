"use client";

import { useNavigate } from "@tanstack/react-router";
// SPDX-License-Identifier: Apache-2.0
import { useCallback } from "react";
import type { TreeContextMenuAction, TreeItemData } from "../types";

/**
 * Custom hook for common tree actions like deletion, navigation, etc.
 *
 * @param {Object} options - Options for the hook
 * @param {(itemId: string) => Promise<boolean>} options.onDeleteItem - Callback when an item is deleted
 * @param {(itemId: string) => Promise<boolean>} [options.onEditItem] - Optional callback when an item is edited
 * @returns {Object} Tree action utilities
 */
export function useTreeActions({
	onDeleteItem,
	onEditItem,
}: {
	onDeleteItem: (itemId: string) => Promise<boolean>;
	onEditItem?: (itemId: string) => Promise<boolean>;
}) {
	const navigate = useNavigate();

	/**
	 * Get context menu actions for a tree item
	 *
	 * @returns {TreeContextMenuAction[]} Array of context menu actions
	 */
	const getContextMenuActions = useCallback((): TreeContextMenuAction[] => {
		const actions: TreeContextMenuAction[] = [];

		// Add delete action
		actions.push({
			label: "Delete",
			icon: "delete",
			variant: "danger",
			onClick: (item: TreeItemData) => {
				void (async () => {
					if (
						window.confirm(`Are you sure you want to delete "${item.name}"?`)
					) {
						const success = await onDeleteItem(item.id);
						if (success) {
							// If we're currently viewing the deleted item, navigate to the parent or home
							if (window.location.pathname.includes(`/gallery/${item.id}`)) {
								navigate({ to: "/" });
							}
						}
					}
				})();
			},
		});

		// Add edit action if provided
		if (onEditItem) {
			actions.push({
				label: "Edit",
				icon: "edit",
				onClick: (item: TreeItemData) => {
					void onEditItem(item.id);
				},
			});
		}

		return actions;
	}, [onDeleteItem, onEditItem, navigate]);

	/**
	 * Handle item selection and navigation
	 *
	 * @param {TreeItemData} item - The selected item
	 */
	const handleSelectItem = useCallback(
		(item: TreeItemData) => {
			// Only navigate to the appropriate route
			// The route will determine the selection state
			if (item.iconType === "dataset") {
				const path = `/gallery/${item.id}`;
				navigate({ to: path });
			}
		},
		[navigate],
	);

	return {
		getContextMenuActions,
		handleSelectItem,
	};
}
