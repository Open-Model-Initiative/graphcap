// SPDX-License-Identifier: Apache-2.0
/**
 * Common Clipboard Formatting Utilities
 *
 * Provides functions to format various data types into strings suitable for clipboard operations.
 */

// Helper to check if a value looks like a graph node
export const isNode = (val: any): val is { id: any; label: string } => {
	return typeof val === "object" && val !== null && "id" in val && "label" in val;
};

// Helper to check if a value looks like a graph edge
export const isEdge = (val: any): val is { source: any; target: any } => {
	return (
		typeof val === "object" &&
		val !== null &&
		"source" in val &&
		"target" in val
	);
};

/**
 * Formats an array into a comma-separated string.
 * Handles arrays of strings, numbers, nodes, and edges specifically.
 * Falls back to default formatting for other array types.
 */
export const formatArrayAsList = (arr: any[]): string => {
	if (!Array.isArray(arr)) {
		return defaultFormatter(arr);
	}
	if (arr.length === 0) {
		return "";
	}

	if (arr.every((item) => typeof item === "string" || typeof item === "number")) {
		return arr.join(", ");
	}

	if (arr.every(isNode)) {
		return arr.map((node) => node.label).join(", ");
	}

	if (arr.every(isEdge)) {
		return arr.map((edge) => `${edge.source} → ${edge.target}`).join(", ");
	}

	return arr.map(defaultFormatter).join(", ");
};

/**
 * Formats a graph node-like object to its label.
 */
export const formatNodeLabel = (node: any): string => {
	if (isNode(node)) {
		return String(node.label);
	}
	return defaultFormatter(node);
};

/**
 * Formats a graph edge-like object to "source → target".
 */
export const formatEdge = (edge: any): string => {
	if (isEdge(edge)) {
		return `${edge.source} → ${edge.target}`;
	}
	return defaultFormatter(edge);
};

/**
 * Default formatter:
 * - Returns empty string for null/undefined.
 * - Converts Dates to ISO strings.
 * - Converts primitives to strings.
 * - JSON.stringify for objects and arrays (unless handled by more specific formatters).
 */
export const defaultFormatter = (data: any): string => {
	if (data === null || data === undefined) {
		return "";
	}
	if (data instanceof Date) {
		return data.toISOString();
	}
	if (typeof data === "object") {
		try {
			return JSON.stringify(data, null, 2);
		} catch (e) {
			return "[Object]";
		}
	}
	return String(data);
}; 