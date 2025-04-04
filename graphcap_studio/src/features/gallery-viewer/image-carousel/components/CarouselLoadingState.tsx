import { LoadingSpinner } from "@/components/ui/status/LoadingSpinner";
// SPDX-License-Identifier: Apache-2.0


interface CarouselLoadingStateProps {
	readonly className?: string;
}

/**
 * Loading state component for the carousel
 *
 * This component displays a centered loading spinner with optional custom styling.
 */
export function CarouselLoadingState({
	className = "",
}: CarouselLoadingStateProps) {
	return (
		<div
			className={`flex items-center justify-center w-full h-full min-h-[320px] ${className}`}
		>
			<LoadingSpinner size="lg" />
		</div>
	);
}
