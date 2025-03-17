"use client";

import { useNavigate } from "@tanstack/react-router";
// SPDX-License-Identifier: Apache-2.0
import { useCallback } from "react";
import { TreeItemData } from "../types";

/**
 * Custom hook for dataset navigation.
 *
 * @returns {Object} Navigation functions for datasets.
 */
export function useDatasetNavigation() {
	const navigate = useNavigate();

	/**
	 * Navigate to a dataset in the gallery view.
	 * The route will determine the selection state.
	 *
	 * @param {TreeItemData} item - The dataset item to navigate to.
	 */
	const navigateToDataset = useCallback(
		(item: TreeItemData) => {
			// Check if the item is a dataset (based on iconType or other criteria)
			const isDataset = item.iconType === "dataset";

			if (isDataset && item.id) {
				// Navigate to the gallery view with the dataset ID
				// The route will determine the selection state
				const path = `/gallery/${item.id}`;
				navigate({ to: path });
			}
		},
		[navigate],
	);

	return {
		navigateToDataset,
	};
}
