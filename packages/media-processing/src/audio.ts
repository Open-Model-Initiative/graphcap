import ffmpeg from "fluent-ffmpeg";
import { createHash } from "node:crypto";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

// --- NEW: Define Variant Interfaces ---
export interface AudioVariantMetadata {
	format?: string; // e.g., mp3
	size?: number;
	bitrate?: number;
	channels?: number;
}

export interface AudioVariant {
	label: string;
	tempFilePath: string; // Path to the temporary variant file
	metadata: AudioVariantMetadata;
}
// --- END NEW ---

// Define the structure for the processed audio data
export interface ProcessedAudioData {
	hash: string;
	format?: string; // e.g., mp3, ogg, wav
	size?: number; // Original size in bytes
	metadata: {
		// Specific metadata for content_audio_meta
		duration?: number; // in seconds
		codec?: string;
		bitrate?: number; // in bits per second
		channels?: number;
	};
	tempFilePath: string; // Path to the temporarily saved original file
	variants: AudioVariant[]; // --- NEW: Add variants array ---
	rawMetadata?: ffmpeg.FfprobeData; // Raw ffprobe output
}

/**
 * Processes an audio file: saves temporarily, extracts metadata using ffprobe,
 * calculates the hash, AND generates a lower-bitrate MP3 variant.
 *
 * NOTE: This function saves the uploaded file and generated variant(s) to a temporary location.
 * The caller is responsible for moving these files to permanent storage
 * and cleaning up the temporary directory.
 *
 * @param file - The audio file to process
 * @param tempDir - Optional: Directory to use for temporary files (defaults to os.tmpdir())
 * @returns Processed audio data including metadata, hash, temp paths, and variant data
 * @throws Error if ffprobe fails or variant generation fails
 */
export async function processAudio(
	file: File,
	tempDir: string = os.tmpdir(),
): Promise<ProcessedAudioData> {
	// 1. Save file temporarily
	const tempFileDir = await fs.mkdtemp(path.join(tempDir, "audio-upload-"));
	const originalTempFilePath = path.join(tempFileDir, file.name); // Renamed for clarity
	const fileBuffer = Buffer.from(await file.arrayBuffer());
	await fs.writeFile(originalTempFilePath, fileBuffer);

	const generatedVariants: AudioVariant[] = []; // Initialize variants array

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
		const audioStream = metadata.streams.find((s) => s.codec_type === "audio");

		if (!audioStream) {
			// Clean up before throwing
			await fs.rm(tempFileDir, { recursive: true, force: true });
			throw new Error("No audio stream found in the file.");
		}

		const originalBitrate = format.bit_rate
			? Number.parseInt(format.bit_rate as unknown as string, 10)
			: undefined;

		// --- NEW: 4. Generate Lower Bitrate MP3 Variant ---
		const targetBitrate = 96000; // 96 kbps
		const variantLabel = "96kbps";
		const variantFilename = `${hash}-${variantLabel}.mp3`;
		const variantTempFilePath = path.join(tempFileDir, variantFilename);

		// Only generate if original bitrate is higher (or unknown) and format isn't already mp3@96k or lower
		const shouldGenerateVariant =
			(!originalBitrate || originalBitrate > targetBitrate) &&
			!(
				audioStream.codec_name === "mp3" &&
				originalBitrate &&
				originalBitrate <= targetBitrate
			);

		if (shouldGenerateVariant) {
			try {
				await new Promise<void>((resolve, reject) => {
					ffmpeg(originalTempFilePath)
						.audioCodec("libmp3lame")
						.audioBitrate(targetBitrate / 1000) // Expects kbps
						.outputFormat("mp3")
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
					(resolve) => {
						ffmpeg.ffprobe(variantTempFilePath, (err, data) => {
							if (err) {
								console.error(
									`ffprobe error for variant ${variantLabel}:`,
									err.message,
								);
								resolve({} as ffmpeg.FfprobeData); // Return empty object on error
							} else {
								resolve(data);
							}
						});
					},
				);

				const variantFormat = variantMetadata.format;
				const variantAudioStream = variantMetadata.streams?.find(
					(s) => s.codec_type === "audio",
				);

				// Add variant info if metadata was successfully retrieved
				if (variantFormat && variantAudioStream) {
					generatedVariants.push({
						label: variantLabel,
						tempFilePath: variantTempFilePath,
						metadata: {
							format: variantFormat.format_name?.split(",")[0], // Usually 'mp3'
							size: variantFormat.size
								? Number.parseInt(variantFormat.size as unknown as string, 10)
								: undefined,
							bitrate: variantFormat.bit_rate
								? Number.parseInt(
										variantFormat.bit_rate as unknown as string,
										10,
									)
								: undefined,
							channels: variantAudioStream.channels,
						},
					});
				} else {
					console.warn(
						`Could not get metadata for generated variant ${variantLabel}. Skipping.`,
					);
					// Attempt cleanup
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
				// Ensure variant file doesn't linger
				try {
					if (await fs.stat(variantTempFilePath))
						await fs.unlink(variantTempFilePath);
				} catch (e) {
					/* ignore */
				}
			}
		} else {
			console.log(
				`Skipping ${variantLabel} variant generation for ${file.name} (original bitrate: ${originalBitrate}, format: ${audioStream.codec_name})`,
			);
		}
		// --- END NEW ---

		// 5. Prepare return data (was step 4)
		const processedData: ProcessedAudioData = {
			hash,
			format: format.format_name?.split(",")[0], // Take first format if multiple listed
			size: format.size
				? Number.parseInt(format.size as unknown as string, 10)
				: undefined,
			metadata: {
				duration: format.duration
					? Number.parseFloat(format.duration as unknown as string)
					: undefined,
				codec: audioStream.codec_name,
				bitrate: originalBitrate, // Use parsed original bitrate
				channels: audioStream.channels,
			},
			tempFilePath: originalTempFilePath, // Return path for caller to handle
			variants: generatedVariants, // Add variants
			rawMetadata: metadata,
		};

		// IMPORTANT: Do not clean up tempFileDir here. Caller is responsible.
		return processedData;
	} catch (error) {
		// Clean up the entire temp directory in case of other errors
		console.error(
			"Error during audio processing, cleaning up temp dir:",
			tempFileDir,
			error,
		);
		await fs.rm(tempFileDir, { recursive: true, force: true });
		throw error; // Re-throw the error
	}
}

/**
 * Validates if a file is an audio file based on MIME type.
 * @param file - The file to validate
 * @returns true if the file is potentially an audio file, false otherwise
 */
export function isValidAudio(file: File): boolean {
	return file.type.startsWith("audio/");
}
