// SPDX-License-Identifier: Apache-2.0

/**
 * File browser constants
 */

// Layout constants
export const INDENTATION_SIZE = 16; // pixels per level of indentation
export const MAX_FILE_LIST_HEIGHT = 384; // 96 * 4 = 384px

// CSS class names
export const CSS_CLASSES = {
	// Item styling
	ITEM: {
		BASE: "flex items-center py-1 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-gray-900 dark:text-gray-100",
		SELECTED: "bg-blue-100 dark:bg-blue-900",
	},
	// Container styling
	CONTAINER: {
		HEADER:
			"p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 text-xs font-medium",
		CONTENT: "p-2 max-h-96 overflow-y-auto bg-white dark:bg-gray-900",
		BORDER:
			"border rounded border-gray-300 dark:border-gray-700 overflow-hidden",
	},
	// Button styling
	BUTTON: {
		BASE: "text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200",
	},
	// Path display
	PATH: {
		CONTAINER: "mb-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs",
	},
	// Error message
	ERROR: {
		CONTAINER:
			"mb-4 p-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded",
	},
};

// File extensions categorization
export const FILE_EXTENSIONS = {
	IMAGE: ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"],
	DOCUMENT: ["pdf", "doc", "docx", "txt", "rtf", "md", "markdown"],
	DATA: ["json", "csv", "xml", "yaml", "yml"],
	CODE: [
		"js",
		"jsx",
		"ts",
		"tsx",
		"py",
		"java",
		"c",
		"cpp",
		"h",
		"html",
		"css",
		"scss",
	],
	ARCHIVE: ["zip", "rar", "tar", "gz", "7z"],
};

// Icons for file types
export const FILE_ICONS = {
	DIRECTORY: {
		CLOSED: "📁",
		OPEN: "📂",
	},
	FILE: {
		DEFAULT: "📄",
		IMAGE: "🖼️",
		DOCUMENT: "📄",
		DATA: "📊",
		CODE: "📝",
		ARCHIVE: "🗄️",
	},
};
