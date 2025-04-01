import type { Image } from "@/types";
import { downloadImage } from "@/utils/download";
// SPDX-License-Identifier: Apache-2.0
import type { IconButtonProps } from "@chakra-ui/react";
import { IconButton } from "@chakra-ui/react";
import * as React from "react";
import { LuDownload } from "react-icons/lu";

export interface DownloadButtonProps
	extends Omit<IconButtonProps, "aria-label"> {
	image?: Image;
}

/**
 * DownloadButton component for consistent download actions
 * with built-in download functionality
 */
export const DownloadButton = React.forwardRef<
	HTMLButtonElement,
	DownloadButtonProps
>(function DownloadButton({ image, onClick, ...props }, ref) {
	const handleClick = React.useCallback(
		(event: React.MouseEvent<HTMLButtonElement>) => {
			// If onClick is provided, call it
			if (onClick) {
				onClick(event);
			}

			// If image is provided and the default wasn't prevented, download it
			if (image && !event.defaultPrevented) {
				downloadImage(image).catch((error) => {
					console.error("Failed to download image:", error);
				});
			}
		},
		[image, onClick],
	);

	return (
		<IconButton
			variant="ghost"
			size="sm"
			aria-label="Download"
			colorPalette="gray"
			ref={ref}
			onClick={handleClick}
			{...props}
		>
			{props.children ?? <LuDownload />}
		</IconButton>
	);
});
