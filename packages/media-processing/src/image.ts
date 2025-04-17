import { createHash } from "node:crypto";
import sharp, { type FormatEnum } from "sharp";

// Define variant configurations (only width needed now)
const IMAGE_VARIANTS = [
	{ label: "small", width: 320 },
	{ label: "medium", width: 640 },
	{ label: "large", width: 1024 },
];

export interface ImageMetadata {
	width?: number;
	height?: number;
	format?: keyof FormatEnum;
	size?: number;
	details?: sharp.Metadata;
}

// Represents a single image version (original or variant) - Used internally and for variants
export interface ImageVersion {
	buffer: Buffer;
	metadata: ImageMetadata;
}

// Represents a generated variant with its label and format
export interface ImageVariant extends ImageVersion {
	label: string;
}

// Updated return type for processImage
export interface ProcessedImageData {
	buffer: Buffer; // Original buffer
	hash: string;
	format?: keyof FormatEnum | string; // Original format
	size?: number; // Original size
	metadata: {
		// Specific metadata for content_image_meta
		width?: number;
		height?: number;
	};
	variants: ImageVariant[]; // Processed variants
	rawMetadata?: sharp.Metadata; // Optional: Keep raw Sharp metadata
}

/**
 * Processes an image file, extracts metadata, and generates variants in original and WebP formats.
 * Only keeps WebP variant if it's smaller than the original format variant.
 * @param file - The image file to process
 * @returns Processed image data including original buffer/metadata, hash, and variant data
 */
export async function processImage(file: File): Promise<ProcessedImageData> {
	const originalBuffer = Buffer.from(await file.arrayBuffer());
	const hash = createHash("sha256").update(originalBuffer).digest("hex");

	const sharpInstance = sharp(originalBuffer);
	const originalMetadataRaw = await sharpInstance.metadata();

	const basicMetadata: ImageMetadata = {
		width: originalMetadataRaw.width,
		height: originalMetadataRaw.height,
		format: originalMetadataRaw.format as keyof FormatEnum | undefined,
		size: originalMetadataRaw.size,
		details: originalMetadataRaw,
	};

	const variants: ImageVariant[] = [];

	// Generate variants (resizing and converting to WebP)
	for (const variantConfig of IMAGE_VARIANTS) {
		// Only generate if original width exists and is larger than the target variant width
		if (basicMetadata.width && variantConfig.width < basicMetadata.width) {
			try {
				// Clone, resize, and convert to WebP in one go
				const webpBuffer = await sharpInstance
					.clone()
					.resize({ width: variantConfig.width })
					.webp() // Always convert to WebP
					.toBuffer();

				const webpMetadataRaw = await sharp(webpBuffer).metadata();

				const webpVariantBasicMetadata: ImageMetadata = {
					width: webpMetadataRaw.width,
					height: webpMetadataRaw.height,
					format: "webp", // Explicitly set format
					size: webpMetadataRaw.size,
				};

				variants.push({
					label: variantConfig.label, // Keep standard labels (small, medium, large)
					buffer: webpBuffer,
					metadata: webpVariantBasicMetadata,
				});
			} catch (error) {
				console.error(
					`Error generating WebP variant ${variantConfig.label} for ${hash}:`,
					error,
				);
			}
		}
	}

	return {
		buffer: originalBuffer,
		hash: hash,
		format: originalMetadataRaw.format,
		size: originalMetadataRaw.size,
		metadata: {
			width: originalMetadataRaw.width,
			height: originalMetadataRaw.height,
		},
		variants,
		rawMetadata: originalMetadataRaw, // Include the raw metadata
	};
}

/**
 * Validates if a file is an image
 * @param file - The file to validate
 * @returns true if the file is an image, false otherwise
 */
export function isValidImage(file: File): boolean {
	return file.type.startsWith("image/");
}
