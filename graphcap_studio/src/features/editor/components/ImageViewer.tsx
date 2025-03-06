import { useState, useEffect } from 'react';
import { getImageUrl } from '@/services/images';

interface ImageViewerProps {
  imagePath: string;
  alt?: string;
  className?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

/**
 * A component for viewing images
 */
export function ImageViewer({
  imagePath,
  alt = 'Image',
  className = '',
  onLoad,
  onError,
}: ImageViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const imageUrl = getImageUrl(imagePath);

  useEffect(() => {
    setLoading(true);
    setError(null);
  }, [imagePath]);

  const handleLoad = () => {
    setLoading(false);
    onLoad?.();
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const error = new Error(`Failed to load image: ${imagePath}`);
    setError(error);
    setLoading(false);
    onError?.(error);
  };

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-50">
          <div className="text-red-600">{error.message}</div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={alt}
        className={`max-h-full max-w-full ${loading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
} 