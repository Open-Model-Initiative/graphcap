// graphcap_studio/src/features/clipboard/clipboardUtils.ts
// SPDX-License-Identifier: Apache-2.0

/**
 * Simple console logger for clipboard utils.
 * In a real app, this might integrate with a more robust logging system.
 */
const debugLog = (message: string, data?: unknown, isError = false) => {
	// Basic check to avoid logging in production or if debugging isn't explicitly enabled elsewhere
	if (process.env.NODE_ENV === "development") {
		const logFn = isError ? console.error : console.log;
		logFn(`[ClipboardUtils] ${message}`, data !== undefined ? data : "");
	}
};

/**
 * Attempts to copy text using the legacy document.execCommand method.
 * IMPORTANT: This *must* be called directly from a user interaction handler (e.g., onClick).
 * It creates a temporary textarea, selects the text, executes the copy command, and cleans up.
 *
 * @param text The text to copy.
 * @param debug Optional debug logging flag (currently uses NODE_ENV).
 * @returns True if the command was executed successfully, false otherwise.
 */
export const copyUsingExecCommand = (text: string, debug = false): boolean => {
	// Use debug flag passed in or default based on environment
	const enableDebug = debug || process.env.NODE_ENV === "development";

	debugLog("Attempting copy via document.execCommand", undefined, false);
	let success = false;
	const textArea = document.createElement("textarea");
	textArea.value = text;
	// Style to keep it out of view and inaccessible
	textArea.style.position = "fixed";
	textArea.style.top = "-9999px";
	textArea.style.left = "-9999px";
	textArea.style.width = "1px"; // Avoid potential layout shifts
	textArea.style.height = "1px";
	textArea.style.opacity = "0";
	textArea.setAttribute("aria-hidden", "true"); // Hide from assistive tech

	document.body.appendChild(textArea);
	textArea.focus({ preventScroll: true }); // Focus is important, prevent scrolling viewport
	textArea.select(); // Select the text

	try {
		// Attempt the copy command.
		success = document.execCommand("copy");
		debugLog(
			`document.execCommand('copy') executed: ${success}`,
			undefined,
			false,
		);
	} catch (err) {
		debugLog("Error executing document.execCommand('copy')", err, true);
		success = false;
	}

	document.body.removeChild(textArea); // Clean up the temporary element
	return success;
}; 