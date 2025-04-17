// SPDX-License-Identifier: Apache-2.0
import { Tooltip } from "@/components/ui/tooltip";
import type { Image } from "@/types/image-types";
import { toast } from "@/utils/toast";
import { IconButton } from "@chakra-ui/react";
import { Download } from "lucide-react";
import { useCallback } from "react";

interface DownloadActionProps {
	readonly selectedImage: Image | null;
}

export function DownloadAction({ selectedImage }: DownloadActionProps) {
	const handleDownloadClick = useCallback(() => {
		if (selectedImage) {
			console.warn("Download functionality not implemented yet.");
			toast.info({
				title: "Not Implemented",
				description: "Download functionality is not yet available.",
			});
		}
	}, [selectedImage]);

	return (
		<Tooltip content="Download Image">
			<IconButton
				aria-label="Download Image"
				onClick={handleDownloadClick}
				disabled={!selectedImage}
				size="sm"
			>
				<Download size="1em" />
			</IconButton>
		</Tooltip>
	);
} 