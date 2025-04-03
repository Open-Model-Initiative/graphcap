import { SERVER_IDS } from "@/features/server-connections/constants";
import { useServerConnections } from "@/features/server-connections/useServerConnections";
import { getImageUrl } from "@/services/images";
// SPDX-License-Identifier: Apache-2.0
import { useEffect, useRef, useState } from "react";
import styles from "./ImageViewer.module.css";
import { useImageViewerSize } from "./hooks";

interface ImageViewerProps {
	readonly imagePath: string;
	readonly alt?: string;
	readonly className?: string;
	readonly aspectRatio?: number;
	readonly padding?: number;
	readonly onLoad?: () => void;
	readonly onError?: (error: Error) => void;
}

/**
 * A component for viewing individual images with loading and error states
 *
 * This component handles:
 * - Loading states with a spinner
 * - Error states with a message
 * - Image rendering with proper sizing
 * - Responsive resizing based on container dimensions
 *
 * @param imagePath - Path to the image file
 * @param alt - Alternative text for the image
 * @param className - Additional CSS classes
 * @param aspectRatio - Optional aspect ratio to maintain (width/height)
 * @param padding - Optional padding to subtract from container dimensions
 * @param onLoad - Callback when image loads successfully
 * @param onError - Callback when image fails to load
 */
export function ImageViewer({
	imagePath,
	alt = "Image",
	className = "",
	aspectRatio,
	padding = 0,
	onLoad,
	onError,
}: Readonly<ImageViewerProps>) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	
	// Get connections state and find media server URL
	const { connections } = useServerConnections();
	const mediaServerConnection = connections.find(
		(conn) => conn.id === SERVER_IDS.MEDIA_SERVER,
	);
	const mediaServerUrl = mediaServerConnection?.url ?? "";

	// Get the image URL using the hook and the media server URL
	const imageUrl = getImageUrl(mediaServerUrl, imagePath);

	const { width, height, isCalculating } = useImageViewerSize({
		containerRef,
		aspectRatio,
		padding,
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: Need to reset loading/error state when imagePath changes
	useEffect(() => {
		setLoading(true);
		setError(null);
	}, [imagePath]);

	const handleLoad = () => {
		setLoading(false);
		onLoad?.();
	};

	const handleError = (_e: React.SyntheticEvent<HTMLImageElement, Event>) => {
		const error = new Error(`Failed to load image: ${imagePath}`);
		setError(error);
		setLoading(false);
		onError?.(error);
		console.error(`Failed to load image: ${imagePath}`);
	};

	return (
		<div ref={containerRef} className={`${styles.container} ${className}`}>
			{loading && (
				<div className={styles.loadingOverlay}>
					<div className={styles.spinner} />
				</div>
			)}
			{error && (
				<div className={styles.errorOverlay}>
					<svg
						className={styles.errorIcon}
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						role="img" aria-label="Error Icon"
					>
						<title>Error loading image</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
					<div className={styles.errorMessage}>{error.message}</div>
				</div>
			)}
			<img
				src={imageUrl}
				alt={alt}
				className={`${styles.image} ${loading ? styles.loading : styles.loaded}`}
				style={{
					width: isCalculating ? "auto" : `${width}px`,
					height: isCalculating ? "auto" : `${height}px`,
				}}
				onLoad={handleLoad}
				onError={handleError}
			/>
		</div>
	);
}
