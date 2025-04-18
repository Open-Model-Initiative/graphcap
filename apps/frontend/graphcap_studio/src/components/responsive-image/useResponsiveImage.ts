import { SERVER_IDS } from "@/features/server-connections/constants";
import { useServerConnections } from "@/features/server-connections/useServerConnections";
import { getThumbnailUrl } from "@/services/images";
import { generateSrcSet } from "@/utils/imageSrcSet";
// SPDX-License-Identifier: Apache-2.0
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface UseResponsiveImageProps {
	readonly imagePath: string;
	readonly aspectRatio?: number;
	readonly onLoad?: () => void;
	readonly onError?: (error: Error) => void;
	readonly maxRetries?: number;
	readonly retryDelay?: number;
	readonly loadingTimeout?: number;
}

interface UseResponsiveImageResult {
	readonly loading: boolean;
	readonly error: Error | null;
	readonly srcSet: string;
	readonly handleLoad: () => void;
	readonly handleError: (
		e: React.SyntheticEvent<HTMLImageElement, Event>,
	) => void;
	readonly retryLoading: () => void;
}

/**
 * Custom hook for managing responsive image loading and optimization
 *
 * Features:
 * - Manages loading and error states
 * - Generates optimal srcset based on image path and aspect ratio
 * - Provides event handlers for load and error events
 * - Implements retry mechanism for failed loads
 * - Handles timeouts for stalled requests
 *
 * @param props - Hook configuration options
 * @returns Object with loading states, srcset, and event handlers
 */
export function useResponsiveImage({
	imagePath,
	aspectRatio,
	onLoad,
	onError,
	maxRetries = 3,
	retryDelay = 1000,
	loadingTimeout = 3500, // 3.5 seconds timeout
}: UseResponsiveImageProps): UseResponsiveImageResult {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [retryCount, setRetryCount] = useState(0);

	// Get connections state and find media server URL
	const { connections } = useServerConnections();
	const mediaServerConnection = connections.find(
		(conn) => conn.id === SERVER_IDS.MEDIA_SERVER,
	);
	const mediaServerUrl = mediaServerConnection?.url ?? "";

	// Use refs to track timeout and abort controller
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const abortControllerRef = useRef<AbortController | null>(null);

	// Reset loading state and error when imagePath changes
	useEffect(() => {
		setLoading(true);
		setError(null);
		setRetryCount(0);

		// Create abort controller for the current request
		abortControllerRef.current = new AbortController();

		// Clear any existing timeout
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		// Set a timeout to handle stalled requests
		timeoutRef.current = setTimeout(() => {
			if (loading) {
				// If still loading after timeout, abort the request and trigger retry or error
				abortControllerRef.current?.abort();

				if (retryCount < maxRetries) {
					// Retry loading
					setRetryCount((prev) => prev + 1);
				} else {
					// Max retries reached, show error
					const timeoutError = new Error(
						`Image load timed out after ${loadingTimeout}ms: ${imagePath}`,
					);
					setError(timeoutError);
					setLoading(false);
					onError?.(timeoutError);
					console.error(timeoutError.message);
				}
			}
		}, loadingTimeout);

		// Cleanup function
		return () => {
			// Clear timeout and abort any in-progress fetch
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			abortControllerRef.current?.abort();
		};
	}, [imagePath, retryCount, maxRetries, loadingTimeout, onError]);

	const handleLoad = useCallback(() => {
		setLoading(false);
		setError(null);

		// Clear timeout on successful load
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}

		onLoad?.();
	}, [onLoad]);

	const handleError = useCallback(
		(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
			// Clear timeout on error
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}

			const err = new Error(`Failed to load image: ${imagePath}`);

			if (retryCount < maxRetries) {
				// Schedule retry with exponential backoff
				console.warn(
					`Retrying image load (${retryCount + 1}/${maxRetries}): ${imagePath}`,
				);
				const backoffDelay = retryDelay * Math.pow(2, retryCount);

				setTimeout(() => {
					setRetryCount((prev) => prev + 1);
					// Force browser to reload the image by updating its src
					if (e.target instanceof HTMLImageElement) {
						const img = e.target;
						const currentSrc = img.src;
						img.src = ""; // Clear the src
						setTimeout(() => {
							img.src = `${currentSrc}${currentSrc.includes("?") ? "&" : "?"}_retry=${Date.now()}`;
						}, 50);
					}
				}, backoffDelay);
			} else {
				// Max retries reached, show error
				setError(err);
				setLoading(false);
				onError?.(err);
				console.error(err.message);
			}
		},
		[imagePath, onError, retryCount, maxRetries, retryDelay],
	);

	// Manually trigger retry
	const retryLoading = useCallback(() => {
		if (error) {
			setError(null);
			setLoading(true);
			setRetryCount(0);
		}
	}, [error]);

	// Memoize the srcset string (default format, e.g., JPEG)
	const srcSet = useMemo(() => {
		// Partially apply getThumbnailUrl with the mediaServerUrl
		const getThumbnailWithUrl = (path: string, width: number, height: number, format?: string) => 
			getThumbnailUrl(mediaServerUrl, path, width, height, format);

		return generateSrcSet(imagePath, getThumbnailWithUrl, undefined, aspectRatio);
	}, [imagePath, aspectRatio, mediaServerUrl]);

	return {
		loading,
		error,
		srcSet,
		handleLoad,
		handleError,
		retryLoading,
	};
}
