// SPDX-License-Identifier: Apache-2.0
/**
 * Metadata Display Component
 *
 * This component displays metadata for the perspectives.
 */

interface MetadataDisplayProps {
	readonly metadata:
		| {
				captioned_at?: string;
				model?: string;
				provider?: string;
		  }
		| null
		| undefined;
	readonly formatDate: (dateString: string) => string;
}

/**
 * Component for displaying perspective metadata
 */
export function MetadataDisplay({
	metadata,
	formatDate,
}: MetadataDisplayProps) {
	if (!metadata?.captioned_at) return null;

	return (
		<div className="mb-4 p-2 bg-gray-700/50 rounded-md">
			<div className="text-xs text-gray-400 flex flex-wrap gap-x-4">
				<span>Generated: {formatDate(metadata.captioned_at)}</span>
				{metadata.model && <span>Model: {metadata.model}</span>}
				{metadata.provider && <span>Provider: {metadata.provider}</span>}
			</div>
		</div>
	);
}
