// graphcap_studio/src/features/clipboard/ClipboardCopyInput.tsx
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { copyUsingExecCommand } from "./clipboardUtils";
// Import directly from Chakra UI based on search results
import { Button, Input } from "@chakra-ui/react";
// Import the custom Tooltip wrapper component
import { Tooltip } from "@/components/ui/tooltip"; // Adjust path if necessary
import { defaultFormatter } from "./clipboardFormatters"; // Import default formatter

interface ClipboardCopyInputProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value"> {
	/** The raw data or text to be displayed (after formatting) and copied */
	value: any;
	/** Optional function to format the value for display and copying */
	formatValue?: (data: any) => string;
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
	formatValue,
	copyButtonTooltip = "Copy to clipboard",
	copyButtonLabel = "Copy",
	copiedButtonLabel = "Copied!",
	successDuration = 1500,
	label,
	id,
	containerClassName,
	className,
	size: htmlSize,
	...restInputProps
}) => {
	const [isCopied, setIsCopied] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	const formattedValue = useMemo(() => {
		return formatValue ? formatValue(value) : defaultFormatter(value);
	}, [value, formatValue]);

	const handleCopyClick = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}

		// Attempt copy using the pre-formatted value
		const success = copyUsingExecCommand(formattedValue);

		if (success) {
			setIsCopied(true);
			timeoutRef.current = setTimeout(() => {
				setIsCopied(false);
				timeoutRef.current = null;
			}, successDuration);
			if (inputRef.current) {
				inputRef.current.select();
				inputRef.current.setSelectionRange(0, 99999);
			}
		} else {
			console.error("ClipboardCopyInput: Failed to copy using execCommand.");
			alert("Copy failed. Please copy the text manually.");
		}
	}, [formattedValue, successDuration]);

	// Clear timeout on unmount
	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	return (
		<div className={`flex items-center space-x-2 ${containerClassName ?? ""}`}>
			{label && (
				<label htmlFor={id} className="text-sm font-medium">
					{label}
				</label>
			)}
			<Input
				ref={inputRef}
				id={id}
				type="text"
				value={formattedValue} // Display the formatted value
				readOnly
				onClick={(e: React.MouseEvent<HTMLInputElement>) => e.currentTarget.select()}
				className={`flex-grow ${className ?? ""}`}
				{...restInputProps}
			/>
			<Tooltip content={copyButtonTooltip} showArrow>
				<Button
					variant="outline"
					size="sm"
					onClick={handleCopyClick}
					// Disable button if explicitly disabled or if formatted value is empty
					disabled={restInputProps.disabled || !formattedValue}
					className="flex-shrink-0"
					aria-label={copyButtonTooltip}
				>
					{isCopied ? copiedButtonLabel : copyButtonLabel}
				</Button>
			</Tooltip>
		</div>
	);
}; 