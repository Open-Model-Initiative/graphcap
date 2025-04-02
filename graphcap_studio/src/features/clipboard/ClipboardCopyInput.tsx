// graphcap_studio/src/features/clipboard/ClipboardCopyInput.tsx
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useRef, useState } from "react";
import { copyUsingExecCommand } from "./clipboardUtils";
// Import directly from Chakra UI based on search results
import { Button, Input } from "@chakra-ui/react";
// Import the custom Tooltip wrapper component
import { Tooltip } from "@/components/ui/tooltip"; // Adjust path if necessary

interface ClipboardCopyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	/** The text value to be displayed and copied. */
	value: string;
	/** Tooltip text for the copy button. Defaults to "Copy to clipboard". */
	copyButtonTooltip?: string;
	/** Text for the copy button. Defaults to "Copy". */
	copyButtonLabel?: string;
	/** Text shown on the button after successful copy. Defaults to "Copied!". */
	copiedButtonLabel?: string;
	/** Duration in ms to show the copied state. Defaults to 1500. */
	successDuration?: number;
	/** Optional label for the input field itself. */
	label?: string;
	/** Optional class name to apply to the container div. */
	containerClassName?: string;
}

export const ClipboardCopyInput: React.FC<ClipboardCopyInputProps> = ({
	value,
	copyButtonTooltip = "Copy to clipboard",
	copyButtonLabel = "Copy",
	copiedButtonLabel = "Copied!",
	successDuration = 1500,
	label,
	id, // Ensure id is passed down for accessibility with label
	containerClassName,
	className, // Pass down className to the input element
	// Destructure `size` out to prevent passing it to Chakra Input
	size: htmlSize, // Rename to avoid conflict if needed later
	...restInputProps // Use the rest of the props
}) => {
	const [isCopied, setIsCopied] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	const handleCopyClick = useCallback(() => {
		// Clear any existing timeout
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}

		// Select text and attempt copy
		if (inputRef.current) {
			inputRef.current.select();
			inputRef.current.setSelectionRange(0, 99999); // For mobile devices

			const success = copyUsingExecCommand(value);

			if (success) {
				setIsCopied(true);
				// Set a timeout to revert the copied state
				timeoutRef.current = setTimeout(() => {
					setIsCopied(false);
					timeoutRef.current = null;
				}, successDuration);
				// Optional: Clear selection after copy for better UX
				window.getSelection()?.removeAllRanges();
				// You might want to blur the input or button here too
				// inputRef.current.blur();
			} else {
				// Basic error feedback - consider a more robust notification system
				console.error("ClipboardCopyInput: Failed to copy using execCommand.");
				// Provide user feedback that copy failed
				alert("Copy failed. Please copy the text manually.");
			}
		}
	}, [value, successDuration]);

	// Clear timeout on unmount
	React.useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	// Chakra UI styling typically uses props rather than className for layout
	// Using Flex from Chakra might be more idiomatic here, but basic className works too.
	return (
		<div className={`flex items-center space-x-2 ${containerClassName ?? ""}`}>
			{label && (
				<label htmlFor={id} className="text-sm font-medium"> {/* Consider Chakra Text component */}
					{label}
				</label>
			)}
			<Input
				ref={inputRef}
				id={id}
				type="text"
				value={value}
				readOnly // Correct Chakra prop for Input
				onClick={(e: React.MouseEvent<HTMLInputElement>) => e.currentTarget.select()} // Type event
				className={`flex-grow ${className ?? ""}`} // Basic flex grow class
				{...restInputProps} // Spread the rest of the input props (excluding size)
			/>
      {/* Use the custom Tooltip wrapper */}
			<Tooltip content={copyButtonTooltip} showArrow>
				<Button
					variant="outline" // Standard Chakra prop
					size="sm" // Standard Chakra prop
					onClick={handleCopyClick}
					disabled={restInputProps.disabled || !value} // Correct Chakra prop for Button
					className="flex-shrink-0" // Basic flex shrink class
					aria-label={copyButtonTooltip}
				>
					{isCopied ? copiedButtonLabel : copyButtonLabel}
				</Button>
			</Tooltip>
		</div>
	);
}; 