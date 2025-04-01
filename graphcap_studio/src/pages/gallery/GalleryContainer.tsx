// SPDX-License-Identifier: Apache-2.0
import { LoadingSpinner } from "@/components/ui/status/LoadingSpinner";
import { useDatasets } from "@/features/datasets/hooks/useDatasets";

import { useParams } from "@tanstack/react-router";
import type { ReactNode } from "react";



/**
 * Container component for the gallery page.
 * Directly uses useDatasets hook based on route params.
 * Accepts children to render content from nested routes.
 */
export function GalleryContainer({ children }: { children: ReactNode }) {
	const { datasetId } = useParams({ from: "/gallery/$datasetId" });

	const {
		isLoading,
		error,
	} = useDatasets(datasetId);

	if (isLoading) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<LoadingSpinner size="lg" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex h-full w-full items-center justify-center text-destructive">
				Error loading dataset: {error.message}
			</div>
		);
	}

	return (
		<>
			{children}
		</>
	);
}
