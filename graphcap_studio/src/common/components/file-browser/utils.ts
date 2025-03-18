// SPDX-License-Identifier: Apache-2.0

/**
 * Utility functions for the file browser
 */

/**
 * Format file size in bytes to a human-readable format
 *
 * @param bytes - File size in bytes
 * @returns Formatted file size string (e.g., "1.5 KB")
 */
export function formatFileSize(bytes?: number): string {
	if (bytes === undefined) return "";

	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Format date string to a human-readable format
 *
 * @param dateString - Date string to format
 * @returns Formatted date string (e.g., "Jan 1, 2023")
 */
export function formatDate(dateString?: string): string {
	if (!dateString) return "";

	const date = new Date(dateString);
	return date.toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

/**
 * Get file extension from filename
 *
 * @param fileName - Name of the file
 * @returns File extension (lowercase) or empty string if no extension
 */
export function getFileExtension(fileName: string): string {
	const parts = fileName.split(".");
	return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}
