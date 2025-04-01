// SPDX-License-Identifier: Apache-2.0
import { useGalleryViewerContext } from "../hooks";

interface ViewModeToggleProps {
	readonly className?: string;
	readonly disabled?: boolean;
}

/**
 * A toggle component for switching between grid and carousel view modes
 *
 * This component provides icon-based buttons for toggling between grid and carousel views.
 * It uses the GalleryViewerContext to access and update the view mode.
 * The currently selected view mode is visually indicated with a subtle shadow box
 * and a slightly different background color.
 * The default view mode is 'carousel' as defined in ImageGallery.tsx.
 *
 * @param className - Additional CSS classes
 * @param disabled - Whether the toggle is disabled
 */
export function ViewModeToggle({
	className = "",
	disabled = false,
}: Readonly<ViewModeToggleProps>) {
	const { viewMode, setViewMode } = useGalleryViewerContext();

	return (
		<div
			className={`flex rounded-md ${className} ${disabled ? "opacity-50" : ""}`}
		>
			{/* Grid View Button */}
			<button
				type="button"
				className={`flex items-center justify-center p-2 text-white transition-colors rounded-l-md ${
					viewMode === "grid"
						? "bg-gray-700 font-medium"
						: "bg-gray-800 hover:bg-gray-700"
				}`}
				onClick={() => setViewMode("grid")}
				title="Grid View"
				disabled={disabled}
				aria-pressed={viewMode === "grid"}
				aria-label="Grid View"
				style={{
					boxShadow:
						viewMode === "grid"
							? "inset 0 0 0 1px rgba(99, 102, 241, 0.6), 0 0 0 1px rgba(99, 102, 241, 0.4)"
							: "none",
				}}
			>
				<svg
					className="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
				>
					<title>Grid View Icon</title>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
					/>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z"
					/>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z"
					/>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
					/>
				</svg>
			</button>
			{/* Carousel View Button */}
			<button
				type="button"
				className={`flex items-center justify-center p-2 text-white transition-colors ${
					viewMode === "carousel"
						? "bg-gray-700 font-medium"
						: "bg-gray-800 hover:bg-gray-700"
				}`}
				onClick={() => setViewMode("carousel")}
				title="Carousel View"
				disabled={disabled}
				aria-pressed={viewMode === "carousel"}
				aria-label="Carousel View"
				style={{
					boxShadow:
						viewMode === "carousel"
							? "inset 0 0 0 1px rgba(99, 102, 241, 0.6), 0 0 0 1px rgba(99, 102, 241, 0.4)"
							: "none",
				}}
			>
				<svg
					className="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
				>
					<title>Carousel View Icon</title>
					<rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M8 21V3"
					/>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M16 21V3"
					/>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M3 12h18"
					/>
				</svg>
			</button>
			{/* Edit View Button */}
			<button
				type="button"
				className={`flex items-center justify-center p-2 text-white transition-colors rounded-r-md ${
					viewMode === "edit"
						? "bg-gray-700 font-medium"
						: "bg-gray-800 hover:bg-gray-700"
				}`}
				onClick={() => setViewMode("edit")}
				title="Edit View"
				disabled={disabled}
				aria-pressed={viewMode === "edit"}
				aria-label="Edit View"
				style={{
					boxShadow:
						viewMode === "edit"
							? "inset 0 0 0 1px rgba(99, 102, 241, 0.6), 0 0 0 1px rgba(99, 102, 241, 0.4)"
							: "none",
				}}
			>
				<svg
					className="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth="2"
					aria-hidden="true"
				>
					<title>Edit View Icon</title>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
					/>
				</svg>
			</button>
		</div>
	);
}
