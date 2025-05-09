import { EmptyState } from "@/components/ui/status/EmptyState";
import { LoadingSpinner } from "@/components/ui/status/LoadingSpinner";
import { UploadDropzone } from "@/features/datasets/components/image-uploader";
// SPDX-License-Identifier: Apache-2.0
import { useDatasetContext } from "@/features/datasets/context/DatasetContext";
import { LazyImage } from "@/features/gallery-viewer/image-grid/LazyImage";
import { useCallback, useEffect, useRef, useState } from "react";
import { FixedSizeGrid } from "react-window";

/**
 * Props for the image renderer component
 */
interface ImageRendererProps {
	readonly imagePath: string;
	readonly alt?: string;
	readonly className?: string;
	readonly onLoad?: () => void;
	readonly onError?: (error: Error) => void;
}

interface GridViewerProps {
	readonly className?: string;
	readonly containerWidth?: number;
	readonly containerHeight?: number;
	/**
	 * Optional custom component to render individual images
	 * If not provided, a default img element will be used
	 */
	readonly ImageComponent?: React.ComponentType<ImageRendererProps>;
	readonly onUploadComplete?: () => void;
}

/**
 * A grid-based image viewer component with virtualization
 *
 * Relies on DatasetContext for image data and selection.
 *
 * Features:
 * - Virtualized grid for efficient rendering of large image collections
 * - Responsive layout that adapts to container dimensions
 * - Loading and empty states
 * - Selection highlighting (derived from context)
 * - Automatic resizing with ResizeObserver
 * - Customizable image rendering via ImageComponent prop
 * - Optional upload dropzone integration
 *
 * @param className - Additional CSS classes
 * @param containerWidth - Optional explicit container width
 * @param containerHeight - Optional explicit container height
 * @param ImageComponent - Optional custom component to render individual images
 * @param onUploadComplete - Callback when upload is complete
 */
export function GridViewer({
	className = "",
	containerWidth: externalWidth,
	containerHeight: externalHeight,
	ImageComponent,
	onUploadComplete,
}: GridViewerProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
	const [itemSize, setItemSize] = useState(180); // Default item size
	const [columnCount, setColumnCount] = useState(1);

	// Get data from context
	const {
		selectedDataset,
		isLoadingDataset,
		selectedImage,
	} = useDatasetContext();

	// Derive state from context
	const isLoading = isLoadingDataset;
	const images = selectedDataset?.images ?? [];
	const isEmpty = !isLoading && images.length === 0;

	// Update dimensions when container size changes
	useEffect(() => {
		if (!containerRef.current && !externalWidth && !externalHeight) return;

		const updateDimensions = () => {
			// Use external dimensions if provided, otherwise measure container
			const width = externalWidth ?? containerRef.current?.clientWidth ?? 0;
			const height = externalHeight ?? containerRef.current?.clientHeight ?? 0;

			setContainerSize({ width, height });

			// Calculate optimal item size and column count based on container width
			// Aim for items between 120px and 200px
			const minItemSize = 120;
			const maxItemSize = 200;
			const gap = 8;

			// Calculate how many items we can fit at maximum size
			const columnsAtMaxSize = Math.floor((width - gap) / (maxItemSize + gap));

			// Calculate how many items we can fit at minimum size
			const columnsAtMinSize = Math.floor((width - gap) / (minItemSize + gap));

			// Choose column count that gives us closest to target size
			const targetColumns = Math.max(
				1,
				columnsAtMaxSize > 0 ? columnsAtMaxSize : columnsAtMinSize,
			);
			setColumnCount(targetColumns);

			// Calculate item size based on column count
			const calculatedItemSize = Math.floor(
				(width - gap * (targetColumns + 1)) / targetColumns,
			);
			setItemSize(calculatedItemSize);
		};

		updateDimensions();

		// Set up resize observer if using container ref
		if (containerRef.current && !externalWidth && !externalHeight) {
			const resizeObserver = new ResizeObserver(updateDimensions);
			resizeObserver.observe(containerRef.current);
			return () => resizeObserver.disconnect();
		}
	}, [externalWidth, externalHeight]);

	// Calculate row count based on number of images and column count
	const rowCount = Math.ceil(images.length / columnCount);

	// Cell renderer for the virtualized grid
	const Cell = useCallback(
		(props: {
			columnIndex: number;
			rowIndex: number;
			style: React.CSSProperties;
		}) => {
			const { columnIndex, rowIndex, style } = props;

			const index = rowIndex * columnCount + columnIndex;
			if (index >= images.length) return null;

			const image = images[index];
			const isSelected = selectedImage?.path === image.path;

			return (
				<div style={style} className="p-2" key={`${rowIndex}-${columnIndex}`}>
					<LazyImage
						image={image}
						isSelected={isSelected}
						ImageComponent={ImageComponent}
					/>
				</div>
			);
		},
		[
			images,
			columnCount,
			selectedImage,
			ImageComponent,
		],
	);

	// Show loading state
	if (isLoading) {
		return (
			<div
				className={`flex h-full w-full items-center justify-center ${className}`}
			>
				<LoadingSpinner size="lg" />
			</div>
		);
	}

	// Show empty state
	if (isEmpty) {
		return (
			<div
				className={`flex h-full w-full items-center justify-center ${className}`}
			>
				<EmptyState
					title="No images found"
					description="Try selecting a different dataset or uploading new images."
				/>
				<UploadDropzone
					onUploadComplete={onUploadComplete}
				/>
			</div>
		);
	}

	return (
		<div
			ref={containerRef}
			className={`h-full w-full overflow-hidden ${className}`}
		>
			{containerSize.width > 0 && containerSize.height > 0 && (
				<FixedSizeGrid
					columnCount={columnCount}
					columnWidth={itemSize}
					height={containerSize.height}
					rowCount={rowCount}
					rowHeight={itemSize}
					width={containerSize.width}
					itemData={images}
				>
					{Cell}
				</FixedSizeGrid>
			)}
		</div>
	);
}
