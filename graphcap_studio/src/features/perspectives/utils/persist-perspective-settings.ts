// SPDX-License-Identifier: Apache-2.0
/**
 * Perspective Settings Persistence
 *
 * This module provides utilities for persisting UI settings related to perspectives
 * such as which perspectives are visible/hidden in the UI.
 */

/**
 * Storage key for saving perspective visibility settings
 */
const PERSPECTIVE_VISIBILITY_KEY = "graphcap:perspective-visibility";

/**
 * Save the list of hidden perspective names to localStorage
 *
 * @param hiddenPerspectives - Array of perspective names that should be hidden
 */
export function saveHiddenPerspectives(hiddenPerspectives: string[]): void {
	try {
		const serialized = JSON.stringify(hiddenPerspectives);
		localStorage.setItem(PERSPECTIVE_VISIBILITY_KEY, serialized);
	} catch (error) {
		console.error("Failed to save hidden perspectives to localStorage:", error);
	}
}

/**
 * Load the list of hidden perspective names from localStorage
 *
 * @returns Array of perspective names that should be hidden
 */
export function loadHiddenPerspectives(): string[] {
	try {
		const serialized = localStorage.getItem(PERSPECTIVE_VISIBILITY_KEY);

		if (!serialized) return [];

		return JSON.parse(serialized) as string[];
	} catch (error) {
		console.error(
			"Failed to load hidden perspectives from localStorage:",
			error,
		);
		return [];
	}
}

/**
 * Check if a perspective should be visible
 *
 * @param perspectiveName - The name of the perspective to check
 * @param hiddenPerspectives - Array of hidden perspective names
 * @returns True if the perspective should be visible, false otherwise
 */
export function isPerspectiveVisible(
	perspectiveName: string,
	hiddenPerspectives: string[],
): boolean {
	return !hiddenPerspectives.includes(perspectiveName);
}

/**
 * Toggle the visibility of a perspective
 *
 * @param perspectiveName - The name of the perspective to toggle
 * @param hiddenPerspectives - Current array of hidden perspective names
 * @returns Updated array of hidden perspective names
 */
export function togglePerspectiveVisibility(
	perspectiveName: string,
	hiddenPerspectives: string[],
): string[] {
	const isCurrentlyHidden = hiddenPerspectives.includes(perspectiveName);

	if (isCurrentlyHidden) {
		// Remove from hidden list (make visible)
		return hiddenPerspectives.filter((name) => name !== perspectiveName);
	} else {
		// Add to hidden list (make hidden)
		return [...hiddenPerspectives, perspectiveName];
	}
}

/**
 * Clear all perspective visibility settings
 */
export function clearPerspectiveVisibilitySettings(): void {
	try {
		localStorage.removeItem(PERSPECTIVE_VISIBILITY_KEY);
	} catch (error) {
		console.error("Failed to clear perspective visibility settings:", error);
	}
}
