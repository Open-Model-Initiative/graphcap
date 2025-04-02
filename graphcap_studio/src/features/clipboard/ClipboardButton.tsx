// graphcap_studio/src/features/clipboard/ClipboardButton.tsx
// SPDX-License-Identifier: Apache-2.0
import { Tooltip } from "@/components/ui/tooltip";
import type { ButtonProps } from "@chakra-ui/react";
import { Button, IconButton } from "@chakra-ui/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { defaultFormatter } from "./clipboardFormatters";
import { copyUsingExecCommand } from "./clipboardUtils";

export interface ClipboardButtonProps extends Omit<ButtonProps, "children"> {
	content: any;
	/** Optional function to format the content before copying */
	formatValue?: (data: any) => string;
	label?: string;
	/** Custom text for the button when not iconOnly */
	buttonText?: string;
	size?: "xs" | "sm" | "md" | "lg";
	variant?: "ghost" | "outline" | "solid";
	colorPalette?: string;
	iconOnly?: boolean;
}

/**
 * ClipboardButton component
 *
 * Button that copies potentially complex data to the clipboard,
 * using a fallback method (execCommand) and allowing custom formatting.
 */
export const ClipboardButton = React.forwardRef<
	HTMLButtonElement,
	ClipboardButtonProps
>(function ClipboardButton(
	{
		content,
		formatValue,
		label = "Copy to clipboard",
		buttonText = "Copy",
		size = "xs",
		variant = "ghost",
		colorScheme = "gray",
		iconOnly = false,
		disabled,
		...props
	},
	ref,
) {
	const [isCopied, setIsCopied] = useState(false);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	const handleCopy = useCallback(() => {
		// Use setTimeout to defer the copy operation slightly
		setTimeout(() => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}

			const textToCopy = formatValue
				? formatValue(content)
				: defaultFormatter(content);

			const success = copyUsingExecCommand(textToCopy);

			if (success) {
				setIsCopied(true);
				timeoutRef.current = setTimeout(() => {
					setIsCopied(false);
					timeoutRef.current = null;
				}, 2000); // Success indicator duration
			} else {
				console.error("ClipboardButton: Failed to copy using execCommand.");
				// Consider a less intrusive way to show errors, e.g., tooltip change
				// alert(
				// 	"Copy failed. Browser may not support this action or requires user interaction.",
				// );
			}
		}, 0); // Minimal delay

	}, [content, formatValue]);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	const tooltipContent = isCopied ? "Copied!" : label;
	const currentColorScheme = isCopied ? "green" : colorScheme;

	const copyIcon = <SvgIcon type="copy" />;
	const checkIcon = <SvgIcon type="check" />;

	const effectiveDisabled =
		disabled || !(formatValue ? formatValue(content) : defaultFormatter(content));

	const sharedButtonProps = {
		size,
		variant,
		colorScheme: currentColorScheme,
		onClick: handleCopy,
		"aria-label": label,
		ref,
		isDisabled: effectiveDisabled,
		px: "1",
		py: "0",
		...props,
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
				<span style={{ marginLeft: "4px" }}>
					{isCopied ? "Copied" : buttonText}
				</span>
			</Button>
		</Tooltip>
	);

	return iconOnly ? renderIconButton() : renderButton();
});

const SvgIcon = ({ type }: { type: "copy" | "check" }) => {
	if (type === "check") {
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="12"
				height="12"
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
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="12"
			height="12"
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