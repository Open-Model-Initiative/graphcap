// graphcap_studio/src/features/clipboard/ClipboardButton.tsx
// SPDX-License-Identifier: Apache-2.0
import { Tooltip } from "@/components/ui/tooltip"; // Assuming this path is correct
import type { ButtonProps } from "@chakra-ui/react";
import { Button, IconButton } from "@chakra-ui/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { copyUsingExecCommand } from "./clipboardUtils";

// Re-using the props interface from the original component
export interface ClipboardButtonProps extends Omit<ButtonProps, "children"> {
	content: string | Record<string, any>;
	label?: string;
	// className prop is handled by spread props
	size?: "xs" | "sm" | "md" | "lg";
	variant?: "ghost" | "outline" | "solid";
	colorPalette?: string; // Note: Chakra uses colorScheme
	iconOnly?: boolean;
	// Removed debug prop as copyUsingExecCommand handles its own debug logging
}

/**
 * ClipboardButton component (Adapted)
 *
 * A button that copies text to clipboard when clicked using legacy methods,
 * suitable for environments where navigator.clipboard might not be available (e.g., non-HTTPS).
 * Shows feedback on success.
 */
export const ClipboardButton = React.forwardRef<
	HTMLButtonElement,
	ClipboardButtonProps
>(function ClipboardButton(
	{
		content,
		label = "Copy to clipboard",
		size = "sm",
		variant = "ghost",
		colorScheme = "gray", // Use colorScheme for Chakra
		iconOnly = false,
		disabled, // Ensure disabled prop is passed through
		...props // Spread the rest of the props (includes className, etc.)
	},
	ref,
) {
	const [isCopied, setIsCopied] = useState(false);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	const handleCopy = useCallback(() => {
		// Clear any existing timeout
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}

		// Prepare text
		const textToCopy =
			typeof content === "string" ? content : JSON.stringify(content, null, 2);

		// Attempt copy using legacy method
		const success = copyUsingExecCommand(textToCopy);

		if (success) {
			setIsCopied(true);
			// Set a timeout to revert the copied state
			timeoutRef.current = setTimeout(() => {
				setIsCopied(false);
				timeoutRef.current = null;
			}, 2000); // Use a fixed duration like before
		} else {
			// Basic error feedback for legacy method
			console.error("ClipboardButton: Failed to copy using execCommand.");
			// Provide user feedback that copy failed (e.g., alert or notification)
			alert(
				"Copy failed. Browser may not support this action or requires user interaction.",
			);
		}
	}, [content]);

	// Clear timeout on unmount
	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	// Set tooltip content based on state
	const tooltipContent = isCopied ? "Copied!" : label;

	// Determine button color based on state (optional, could simplify)
	const currentColorScheme = isCopied ? "green" : colorScheme;

	// Icon elements (same as before)
	const copyIcon = <SvgIcon type="copy" />;
	const checkIcon = <SvgIcon type="check" />;

	const effectiveDisabled = disabled || !content; // Disable if prop says so or content is empty

	const sharedButtonProps = {
		size,
		variant,
		colorScheme: currentColorScheme, // Use updated color scheme
		onClick: handleCopy,
		"aria-label": label,
		ref,
		isDisabled: effectiveDisabled, // Use isDisabled for Chakra
		...props, // Spread remaining props
	};

	const renderIconButton = () => (
		<Tooltip content={tooltipContent} showArrow>
			<IconButton {...sharedButtonProps}>
				{isCopied ? checkIcon : copyIcon}
			</IconButton>
		</Tooltip>
	);

	const renderButton = () => (
		<Tooltip content={tooltipContent} showArrow>
			<Button {...sharedButtonProps}>
				{isCopied ? checkIcon : copyIcon}
				<span style={{ marginLeft: "8px" }}>
					{isCopied ? "Copied" : "Copy"}
				</span>
			</Button>
		</Tooltip>
	);

	return iconOnly ? renderIconButton() : renderButton();
});

// Helper to minimize SVG code duplication in the main component
const SvgIcon = ({ type }: { type: "copy" | "check" }) => {
	if (type === "check") {
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<polyline points="20 6 9 17 4 12"></polyline>
			</svg>
		);
	}
	// Default to copy icon
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
			<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
		</svg>
	);
}; 