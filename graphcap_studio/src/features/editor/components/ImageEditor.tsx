import {
	ImageProcessResponse,
	getImageUrl,
	useProcessImage,
} from "@/services/images";
import { useCallback, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { toast } from "sonner";
import { ImageViewer } from "../../gallery-viewer";

interface ImageEditorProps {
	readonly imagePath: string;
	readonly onSave?: (result: ImageProcessResponse) => void;
	readonly onCancel?: () => void;
}

/**
 * A component for editing images
 */
export function ImageEditor({ imagePath, onSave, onCancel }: ImageEditorProps) {
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [rotation, setRotation] = useState(0);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [isEditing, setIsEditing] = useState(false);

	const processImageMutation = useProcessImage();

	const onCropComplete = useCallback(
		(croppedArea: Area, croppedAreaPixels: Area) => {
			setCroppedAreaPixels(croppedAreaPixels);
		},
		[],
	);

	const handleSave = async () => {
		if (!croppedAreaPixels) {
			toast.error("No crop area selected");
			return;
		}

		setIsSaving(true);
		try {
			const result = await processImageMutation.mutateAsync({
				imagePath,
				operations: {
					crop: {
						left: Math.round(croppedAreaPixels.x),
						top: Math.round(croppedAreaPixels.y),
						width: Math.round(croppedAreaPixels.width),
						height: Math.round(croppedAreaPixels.height),
					},
					rotate: rotation,
				},
			});

			toast.success("Image saved successfully");
			onSave?.(result);
		} catch (error) {
			toast.error(
				`Failed to save image: ${error instanceof Error ? error.message : String(error)}`,
			);
		} finally {
			setIsSaving(false);
		}
	};

	const handleRotate = (angle: number) => {
		setRotation((prev) => prev + angle);
	};

	return (
		<div className="flex h-full w-full flex-col overflow-hidden bg-gray-900 text-white">
			<div className="flex-shrink-0 flex items-center justify-between border-b border-gray-700 bg-gray-800/90 px-2 py-0.5">
				<h2 className="text-xs font-medium">Image Editor</h2>
				<div className="flex space-x-1">
					{isEditing ? (
						<>
							<button
								className="rounded bg-gray-700 px-1.5 py-0.5 text-xs text-gray-200 hover:bg-gray-600"
								onClick={() => setIsEditing(false)}
								disabled={isSaving}
								title="Cancel Editing"
							>
								Cancel
							</button>
							<button
								className="rounded bg-blue-600 px-1.5 py-0.5 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
								onClick={handleSave}
								disabled={isSaving}
								title="Save Changes"
							>
								{isSaving ? "Saving..." : "Save"}
							</button>
						</>
					) : (
						<>
							<button
								className="rounded bg-blue-600 px-1.5 py-0.5 text-xs text-white hover:bg-blue-700"
								onClick={() => setIsEditing(true)}
								title="Edit Image"
							>
								Edit
							</button>
							<button
								className="rounded bg-gray-700 px-1.5 py-0.5 text-xs text-gray-200 hover:bg-gray-600"
								onClick={onCancel}
								title="Close Editor"
							>
								Close
							</button>
						</>
					)}
				</div>
			</div>

			<div className="relative flex-1 overflow-hidden">
				{isEditing ? (
					<>
						<Cropper
							image={getImageUrl(imagePath)}
							crop={crop}
							zoom={zoom}
							rotation={rotation}
							aspect={4 / 3}
							onCropChange={setCrop}
							onZoomChange={setZoom}
							onCropComplete={onCropComplete}
						/>
						<div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 space-x-2 rounded-lg bg-gray-800/80 p-1 shadow-lg z-10 border border-gray-700">
							<div className="flex items-center space-x-1">
								<label htmlFor="zoom" className="text-xs text-gray-300">
									Zoom:
								</label>
								<input
									id="zoom"
									type="range"
									min={1}
									max={3}
									step={0.1}
									value={zoom}
									onChange={(e) => setZoom(Number(e.target.value))}
									className="w-24 h-3"
								/>
							</div>
							<div className="flex items-center space-x-1">
								<span className="text-xs text-gray-300">Rotate:</span>
								<div className="flex space-x-1">
									<button
										className="rounded bg-gray-700 px-1 py-0.5 text-xs text-gray-200 hover:bg-gray-600"
										onClick={() => handleRotate(-90)}
									>
										↺
									</button>
									<button
										className="rounded bg-gray-700 px-1 py-0.5 text-xs text-gray-200 hover:bg-gray-600"
										onClick={() => handleRotate(90)}
									>
										↻
									</button>
								</div>
							</div>
						</div>
					</>
				) : (
					<div className="h-full w-full overflow-auto bg-gray-900">
						<ImageViewer imagePath={imagePath} className="h-full w-full" />
					</div>
				)}
			</div>
		</div>
	);
}
