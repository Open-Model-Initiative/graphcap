// SPDX-License-Identifier: Apache-2.0
/**
 * Perspective Hooks Utilities
 *
 * This module provides utility functions for the perspective hooks.
 */

/**
 * Helper function to get a preview of content for logging
 *
 * @param content - The content to preview
 * @param maxLength - Maximum length of the preview
 * @returns A preview of the content
 */
export function getContentPreview(
	content: any,
	maxLength: number = 100,
): string {
	if (!content) return "undefined";

	if (typeof content === "string") {
		const preview =
			content.length > maxLength
				? `${content.substring(0, maxLength)}...`
				: content;
		return preview;
	}

	if (typeof content === "object") {
		try {
			const stringified = JSON.stringify(content);
			const preview =
				stringified.length > maxLength
					? `${stringified.substring(0, maxLength)}...`
					: stringified;
			return preview;
		} catch (e) {
			return "[Complex object]";
		}
	}

	return String(content);
}
