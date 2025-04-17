// SPDX-License-Identifier: Apache-2.0
import { memo } from "react";
import { CSS_CLASSES } from "./constants";

interface ErrorMessageProps {
	message: string | null;
}

/**
 * ErrorMessage component for displaying error messages
 *
 * @param message - The error message to display
 */
function ErrorMessageComponent({ message }: Readonly<ErrorMessageProps>) {
	if (!message) return null;

	return (
		<div className={CSS_CLASSES.ERROR.CONTAINER} role="alert">
			{message}
		</div>
	);
}

// Memoize the component to prevent unnecessary re-renders
export const ErrorMessage = memo(ErrorMessageComponent);
