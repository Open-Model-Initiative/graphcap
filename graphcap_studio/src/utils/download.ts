// SPDX-License-Identifier: Apache-2.0
import type { Image } from "@/types";

/**
 * Downloads an image from the given URL
 *
 * @param url - URL of the image to download
 * @param filename - Name to save the file as
 */
export async function downloadFromUrl(
	url: string,
	filename: string,
): Promise<void> {
	try {
		const response = await fetch(url);
		const blob = await response.blob();
		const href = URL.createObjectURL(blob);

		const link = document.createElement("a");
		link.href = href;
		link.download = filename;
		document.body.appendChild(link);
		link.click();

		document.body.removeChild(link);
		URL.revokeObjectURL(href);
	} catch (error) {
		console.error("Download failed:", error);
		throw error;
	}
}

/**
 * Downloads an image from the Image object
 *
 * @param image - Image object containing path and name
 */
export function downloadImage(image: Image): Promise<void> {
	return downloadFromUrl(image.path, image.name);
}
