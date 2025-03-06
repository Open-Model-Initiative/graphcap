import { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { toast } from 'sonner';
import { processImage, ImageProcessResponse, getImageUrl } from '@/services/images';
import { ImageViewer } from './ImageViewer';

interface ImageEditorProps {
  imagePath: string;
  onSave?: (result: ImageProcessResponse) => void;
  onCancel?: () => void;
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

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) {
      toast.error('No crop area selected');
      return;
    }

    setIsSaving(true);
    try {
      const result = await processImage({
        imagePath,
        operations: {
          crop: {
            left: croppedAreaPixels.x,
            top: croppedAreaPixels.y,
            width: croppedAreaPixels.width,
            height: croppedAreaPixels.height,
          },
          rotate: rotation,
        },
      });

      toast.success('Image saved successfully');
      onSave?.(result);
    } catch (error) {
      toast.error(`Failed to save image: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRotate = (angle: number) => {
    setRotation((prev) => prev + angle);
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex-shrink-0 flex items-center justify-between border-b border-gray-200 p-4 bg-gray-50">
        <h2 className="text-xl font-semibold">Image Editor</h2>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <>
              <button
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
              <button
                className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                onClick={onCancel}
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
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-4 rounded-lg bg-white p-2 shadow-lg z-10">
              <div className="flex flex-col items-center">
                <label htmlFor="zoom" className="text-sm text-gray-600">
                  Zoom
                </label>
                <input
                  id="zoom"
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-32"
                />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-600">Rotate</span>
                <div className="flex space-x-2">
                  <button
                    className="rounded bg-gray-200 px-2 py-1 text-gray-700 hover:bg-gray-300"
                    onClick={() => handleRotate(-90)}
                  >
                    ↺
                  </button>
                  <button
                    className="rounded bg-gray-200 px-2 py-1 text-gray-700 hover:bg-gray-300"
                    onClick={() => handleRotate(90)}
                  >
                    ↻
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full w-full overflow-auto">
            <ImageViewer imagePath={imagePath} className="h-full w-full" />
          </div>
        )}
      </div>
    </div>
  );
} 