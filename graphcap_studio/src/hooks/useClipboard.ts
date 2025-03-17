// SPDX-License-Identifier: Apache-2.0
/**
 * useClipboard Hook
 *
 * A hook for managing clipboard operations with feedback.
 * Includes fallback mechanisms for different platforms.
 */

import { useCallback, useState } from "react";

interface UseClipboardOptions {
	/**
	 * Duration in milliseconds to show success state
	 */
	successDuration?: number;
	/**
	 * Enable debug logging
	 */
	debug?: boolean;
}

interface UseClipboardResult {
	/**
	 * Copy text to clipboard
	 */
	copyToClipboard: (text: string) => Promise<void>;
	/**
	 * Whether the last copy operation was successful
	 */
	hasCopied: boolean;
	/**
	 * Any error that occurred during the last copy operation
	 */
	error: Error | null;
}

/**
 * Checks if navigator.clipboard API is available
 */
const isClipboardAPIAvailable = (): boolean => {
	return !!(
		typeof navigator !== "undefined" &&
		navigator.clipboard &&
		typeof navigator.clipboard.writeText === "function"
	);
};

/**
 * Creates a temporary textarea for text selection
 * @param text Text to be copied
 * @returns The created textarea element
 */
const createTemporaryTextArea = (text: string): HTMLTextAreaElement => {
	const textArea = document.createElement("textarea");
	textArea.value = text;

	// Make the textarea out of viewport
	textArea.style.position = "fixed";
	textArea.style.left = "-999999px";
	textArea.style.top = "-999999px";

	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();

	return textArea;
};

/**
 * Alternative clipboard copy method using selection and document.execCommand
 * Note: This is a legacy method but kept for compatibility
 * @param text Text to copy
 */
const copyUsingSelection = (text: string): boolean => {
	const textArea = createTemporaryTextArea(text);

	// Use clipboard write API if available with the current selection
	let success = false;

	try {
		// Use selection-based writing
		const selection = document.getSelection();
		if (selection) {
			const range = document.createRange();
			range.selectNodeContents(textArea);
			selection.removeAllRanges();
			selection.addRange(range);
			success = true;
		}
	} catch (err) {
		success = false;
	}

	// Clean up
	document.body.removeChild(textArea);
	return success;
};

/**
 * Final fallback method using user interaction
 * @param text Text to copy
 * @param onSuccess Success callback
 * @param onError Error callback
 * @param debug Whether to enable debug logging
 */
const attemptUserInteractionCopy = (
	text: string,
	onSuccess: () => void,
	onError: (error: Error) => void,
	debug = false,
): void => {
	if (debug)
		console.log(
			"[useClipboard] Attempting final fallback with user interaction",
		);

	// Create a clickable element to trigger user action
	const button = document.createElement("button");
	button.textContent = "Copy to clipboard";
	button.style.display = "none";
	document.body.appendChild(button);

	button.onclick = async () => {
		try {
			await navigator.clipboard.writeText(text);
			onSuccess();

			if (debug) console.log("[useClipboard] Final fallback successful");
		} catch (finalErr) {
			if (debug)
				console.error("[useClipboard] Final fallback failed:", finalErr);
			onError(
				finalErr instanceof Error
					? finalErr
					: new Error("Final clipboard fallback failed"),
			);
		}

		document.body.removeChild(button);
	};

	// Simulate a click to trigger the copy in user context
	button.click();
};

/**
 * Log debug information
 * @param message Debug message
 * @param data Optional data to log
 * @param isError Whether this is an error log
 * @param debug Whether debugging is enabled
 */
const debugLog = (
	message: string,
	data?: any,
	isError = false,
	debug = false,
): void => {
	if (!debug) return;

	if (isError) {
		console.error(`[useClipboard] ${message}`, data);
	} else {
		console.log(`[useClipboard] ${message}`, data !== undefined ? data : "");
	}
};

export function useClipboard(
	options: UseClipboardOptions = {},
): UseClipboardResult {
	const { successDuration = 2000, debug = false } = options;
	const [hasCopied, setHasCopied] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	/**
	 * Handle successful copy operation
	 */
	const handleCopySuccess = useCallback(() => {
		debugLog("Copy successful", undefined, false, debug);
		setHasCopied(true);
		setError(null);

		// Reset success state after duration
		setTimeout(() => {
			setHasCopied(false);
		}, successDuration);
	}, [successDuration, debug]);

	/**
	 * Handle copy operation error
	 */
	const handleCopyError = useCallback(
		(err: unknown) => {
			debugLog("Copy failed:", err, true, debug);

			if (debug) {
				debugLog("Navigator:", typeof navigator, false, debug);
				debugLog(
					"Clipboard:",
					typeof navigator !== "undefined" ? typeof navigator.clipboard : "N/A",
					false,
					debug,
				);
			}

			setError(
				err instanceof Error ? err : new Error("Failed to copy to clipboard"),
			);
			setHasCopied(false);
		},
		[debug],
	);

	/**
	 * Try to copy using the Clipboard API
	 */
	const copyWithClipboardAPI = useCallback(
		async (text: string): Promise<boolean> => {
			if (!isClipboardAPIAvailable()) return false;

			debugLog("Using Clipboard API", undefined, false, debug);
			await navigator.clipboard.writeText(text);
			return true;
		},
		[debug],
	);

	/**
	 * Main copy function with fallback mechanisms
	 */
	const copyToClipboard = useCallback(
		async (text: string) => {
			debugLog("Starting copy operation", undefined, false, debug);
			debugLog(
				"Clipboard API available:",
				isClipboardAPIAvailable(),
				false,
				debug,
			);

			try {
				// First try the modern Clipboard API
				const clipboardApiSuccess = await copyWithClipboardAPI(text);

				// If that fails or isn't available, try the legacy fallback
				if (!clipboardApiSuccess) {
					debugLog(
						"Falling back to selection-based copy",
						undefined,
						false,
						debug,
					);
					const legacySuccess = copyUsingSelection(text);

					if (!legacySuccess) {
						throw new Error("Selection-based copy failed");
					}
				}

				handleCopySuccess();
			} catch (err) {
				handleCopyError(err);

				// Try one last fallback method using user interaction
				attemptUserInteractionCopy(
					text,
					handleCopySuccess,
					handleCopyError,
					debug,
				);
			}
		},
		[copyWithClipboardAPI, handleCopySuccess, handleCopyError, debug],
	);

	return {
		copyToClipboard,
		hasCopied,
		error,
	};
}
