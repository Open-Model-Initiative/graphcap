import ffmpeg from "fluent-ffmpeg";
import { createHash } from "node:crypto";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import sharp from "sharp"; // Import sharp for thumbnail dimensions

// --- NEW: Define Variant Interfaces ---
export interface VideoVariantMetadata {
	width?: number;
	height?: number;
	format?: string; // e.g., mp4
	size?: number;
	bitrate?: number;
}

export interface VideoVariant {
	label: string;
	tempFilePath: string; // Path to the temporary variant file
	metadata: VideoVariantMetadata;
}
// --- END NEW ---

// Define the structure for the processed video data
export interface ProcessedVideoData {
	hash: string;
	format?: string; // e.g., mp4, webm
	size?: number; // Original size in bytes
	metadata: {
		// Specific metadata for content_video_meta
		width?: number;
		height?: number;
		duration?: number; // in seconds
		codec?: string;
		bitrate?: number; // in bits per second
	};
	thumbnailBuffer?: Buffer; // Buffer for the generated thumbnail image
	tempFilePath: string; // Path to the temporarily saved original file
	variants: VideoVariant[]; // --- NEW: Add variants array ---
	rawMetadata?: ffmpeg.FfprobeData; // Raw ffprobe output
}

/**
 * Processes a video file: saves temporarily, extracts metadata using ffprobe,
 * generates a thumbnail, calculates the hash, AND generates a 480p variant.
 *
 * NOTE: This function saves the uploaded file and generated variant(s) to a temporary location.
 * The caller is responsible for moving these files to permanent storage
 * and cleaning up the temporary directory using the returned tempFilePath values.
 *
 * @param file - The video file to process
 * @param tempDir - Optional: Directory to use for temporary files (defaults to os.tmpdir())
 * @returns Processed video data including metadata, hash, thumbnail buffer, temp paths, and variant data
 * @throws Error if ffprobe fails or thumbnail/variant generation fails
 */
export async function processVideo(
	file: File,
	tempDir: string = os.tmpdir(),
): Promise<ProcessedVideoData> {
	// 1. Save file temporarily to allow ffmpeg to access it by path
	const tempFileDir = await fs.mkdtemp(path.join(tempDir, "video-upload-"));
	const originalTempFilePath = path.join(tempFileDir, file.name); // Renamed for clarity
	const fileBuffer = Buffer.from(await file.arrayBuffer());
	await fs.writeFile(originalTempFilePath, fileBuffer);

	const generatedVariants: VideoVariant[] = []; // Initialize variants array

	try {
		// 2. Calculate Hash
		const hash = createHash("sha256").update(fileBuffer).digest("hex");

		// 3. Extract metadata using ffprobe
		const metadata: ffmpeg.FfprobeData = await new Promise(
			(resolve, reject) => {
				ffmpeg.ffprobe(originalTempFilePath, (err, data) => {
					if (err) {
						// Clean up before rejecting if ffprobe fails early
						fs.rm(tempFileDir, { recursive: true, force: true }).finally(() =>
							reject(new Error(`ffprobe error: ${err.message}`)),
						);
						return;
					}
					resolve(data);
				});
			},
		);

		const format = metadata.format;
		const videoStream = metadata.streams.find((s) => s.codec_type === "video");

		if (!videoStream || !videoStream.width || !videoStream.height) {
			// Check dimensions exist
			throw new Error("No video stream with dimensions found in the file.");
		}

		// 4. Generate Thumbnail
		const thumbnailFileName = `thumbnail-${hash}.jpg`;
		const thumbnailTempPath = path.join(tempFileDir, thumbnailFileName);
		let thumbnailBuffer: Buffer | undefined; // Define here

		try {
			await new Promise<void>((resolve, reject) => {
				ffmpeg(originalTempFilePath)
					.on("error", (err) => {
						console.error("Thumbnail generation ffmpeg error:", err.message); // Log specific error
						reject(new Error(`Thumbnail generation error: ${err.message}`));
					})
					.on("end", () => resolve())
					.screenshots({
						count: 1,
						timemarks: ["1"], // Attempt to take screenshot at 1 second
						filename: thumbnailFileName,
						folder: tempFileDir,
						size: "?x320", // Example size: 320px height, auto width
					});
			});
			thumbnailBuffer = await fs.readFile(thumbnailTempPath);
			await fs.unlink(thumbnailTempPath); // Clean up the generated thumbnail file
		} catch (thumbError) {
			console.error("Failed to generate or read thumbnail:", thumbError);
			// Decide if this is fatal. For now, we'll continue without a thumbnail.
			thumbnailBuffer = undefined;
		}

		// --- NEW: 5. Generate 480p Variant ---
		const targetHeight = 480;
		const variantLabel = "480p";
		const variantFilename = `${hash}-${variantLabel}.mp4`;
		const variantTempFilePath = path.join(tempFileDir, variantFilename);

		// Only generate if original height is greater than target height
		if (videoStream.height > targetHeight) {
			try {
				await new Promise<void>((resolve, reject) => {
					ffmpeg(originalTempFilePath)
						.outputOptions([
							"-vf",
							`scale=-2:${targetHeight}`, // Scale maintaining aspect ratio, height=480
							"-c:v",
							"libx264", // Video codec
							"-preset",
							"fast", // Encoding speed preset
							"-crf",
							"23", // Constant Rate Factor (quality, lower is better)
							"-c:a",
							"aac", // Audio codec
							"-b:a",
							"128k", // Audio bitrate
							"-movflags",
							"+faststart", // Optimize for web streaming
						])
						.on("error", (err) => {
							console.error(
								`Error generating ${variantLabel} variant:`,
								err.message,
							);
							reject(new Error(`Variant generation error: ${err.message}`));
						})
						.on("end", () => resolve())
						.save(variantTempFilePath);
				});

				// Get metadata for the generated variant file
				const variantMetadata: ffmpeg.FfprobeData = await new Promise(
					(resolve, reject) => {
						ffmpeg.ffprobe(variantTempFilePath, (err, data) => {
							if (err) {
								// Don't reject outer promise, just log error and skip variant
								console.error(
									`ffprobe error for variant ${variantLabel}:`,
									err.message,
								);
								resolve({} as ffmpeg.FfprobeData); // Return empty object
							} else {
								resolve(data);
							}
						});
					},
				);

				const variantFormat = variantMetadata.format;
				const variantVideoStream = variantMetadata.streams?.find(
					(s) => s.codec_type === "video",
				);

				// Add variant info if metadata was successfully retrieved
				if (variantFormat && variantVideoStream) {
					generatedVariants.push({
						label: variantLabel,
						tempFilePath: variantTempFilePath,
						metadata: {
							width: variantVideoStream.width,
							height: variantVideoStream.height,
							format: variantFormat.format_name?.split(",")[0], // Often 'mov,mp4,...' -> take first
							size: variantFormat.size
								? Number.parseInt(variantFormat.size as unknown as string, 10)
								: undefined,
							bitrate: variantFormat.bit_rate
								? Number.parseInt(
										variantFormat.bit_rate as unknown as string,
										10,
									)
								: undefined,
						},
					});
				} else {
					console.warn(
						`Could not get metadata for generated variant ${variantLabel}. Skipping.`,
					);
					// Attempt to clean up the potentially corrupt variant file
					try {
						await fs.unlink(variantTempFilePath);
					} catch (e) {
						console.error(
							`Failed to clean up failed variant ${variantTempFilePath}`,
							e,
						);
					}
				}
			} catch (variantError) {
				console.error(
					`Failed to generate or process ${variantLabel} variant:`,
					variantError,
				);
				// Ensure variant file doesn't linger if generation failed mid-way
				try {
					if (await fs.stat(variantTempFilePath))
						await fs.unlink(variantTempFilePath);
				} catch (e) {
					/* ignore if file doesn't exist */
				}
			}
		} else {
			console.log(
				`Skipping ${variantLabel} variant generation as original height (${videoStream.height}p) is not greater than target (${targetHeight}p).`,
			);
		}
		// --- END NEW ---

		// 6. Prepare return data (was step 5)
		const processedData: ProcessedVideoData = {
			hash,
			format: format.format_name?.split(",")[0], // Take first format if multiple listed
			size: format.size,
			metadata: {
				width: videoStream.width,
				height: videoStream.height,
				duration: format.duration
					? Number.parseFloat(format.duration as unknown as string)
					: undefined,
				codec: videoStream.codec_name,
				bitrate: format.bit_rate
					? Number.parseInt(format.bit_rate as unknown as string, 10)
					: undefined,
			},
			thumbnailBuffer, // Use the potentially undefined buffer
			tempFilePath: originalTempFilePath, // Return path for caller to handle
			variants: generatedVariants, // Add variants
			rawMetadata: metadata,
		};

		// IMPORTANT: Do not clean up tempFileDir here. Caller is responsible.
		return processedData;
	} catch (error) {
		// Clean up the entire temp directory in case of errors during processing
		console.error(
			"Error during video processing, cleaning up temp dir:",
			tempFileDir,
			error,
		);
		await fs.rm(tempFileDir, { recursive: true, force: true });
		throw error; // Re-throw the error
	}
}

/**
 * Validates if a file is a video based on MIME type.
 * @param file - The file to validate
 * @returns true if the file is potentially a video, false otherwise
 */
export function isValidVideo(file: File): boolean {
	return file.type.startsWith("video/");
}
