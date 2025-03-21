// SPDX-License-Identifier: Apache-2.0
/**
 * ErrorBoundary Component
 *
 * This component catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */

import { ReactNode } from "react";
import {
	FallbackProps,
	ErrorBoundary as ReactErrorBoundary,
} from "react-error-boundary";

interface ErrorBoundaryProps {
	/**
	 * The UI to display when an error is caught
	 */
	readonly fallback:
		| ReactNode
		| ((error: Error, reset: () => void) => ReactNode);
	/**
	 * Optional callback for when an error is caught
	 */
	readonly onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
	/**
	 * Child components that might throw errors
	 */
	readonly children: ReactNode;
}

/**
 * ErrorBoundary component to catch errors in React components
 *
 * This component uses the react-error-boundary package to provide
 * error boundary functionality with support for functional components.
 */
export function ErrorBoundary({
	fallback,
	onError,
	children,
}: ErrorBoundaryProps) {
	// Handle different types of fallback (ReactNode or function)
	const renderFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
		if (typeof fallback === "function") {
			return fallback(error, resetErrorBoundary);
		}
		return fallback;
	};

	return (
		<ReactErrorBoundary fallbackRender={renderFallback} onError={onError}>
			{children}
		</ReactErrorBoundary>
	);
}
