"use client";

import { useNavigate } from "@tanstack/react-router";
// SPDX-License-Identifier: Apache-2.0
import { useCallback } from "react";
import type { TreeItemData } from "../types";

/**
 * Custom hook for dataset navigation.
 *
 * @returns {Object} Navigation functions for datasets.
 */
export function useDatasetNavigation() {
	const navigate = useNavigate();

	/**
	 * Navigate to a dataset in the gallery view.
	 * Sets the current dataset in context and then navigates.
	 *
	 * @param {TreeItemData} item - The dataset item to navigate to.
	 */
	const navigateToDataset = useCallback(
		(item: TreeItemData) => {
			console.debug("[useDatasetNavigation] navigateToDataset called with item:", { 
				id: item.id, 
				name: item.name,
				iconType: item.iconType
			});
			
			// Check if the item is a dataset (based on iconType or other criteria)
			const isDataset = item.iconType === "dataset";

			if (isDataset && item.id) {
				const path = `/gallery/${item.id}`;
				console.debug(`[useDatasetNavigation] Navigating to path: ${path}`);
				navigate({ to: path });
			} else {
				console.debug(`[useDatasetNavigation] Not navigating: isDataset=${isDataset}, hasId=${!!item.id}`);
			}
		},
		[navigate],
	);

	return {
		navigateToDataset,
	};
}
