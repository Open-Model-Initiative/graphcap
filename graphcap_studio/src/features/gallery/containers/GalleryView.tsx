import { useQuery } from '@tanstack/react-query'
import { GalleryGrid } from '../components/GalleryGrid'
import { loadBatchImages } from '../services/galleryService'

interface GalleryViewProps {
  batchId: string
}

export function GalleryView({ batchId }: GalleryViewProps) {
  const { data: batch, isLoading, error, isError } = useQuery({
    queryKey: ['batch', batchId],
    queryFn: () => loadBatchImages(batchId),
    retry: 1, // Only retry once for 404s and other errors
  })

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading gallery...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg">
          <h3 className="text-red-800 font-medium mb-2">Error Loading Gallery</h3>
          <p className="text-red-600">{error instanceof Error ? error.message : 'Unknown error occurred'}</p>
          <p className="text-sm text-red-500 mt-2">Please check your connection and try again</p>
        </div>
      </div>
    )
  }

  if (!batch?.images?.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>No images found in this batch</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full">
      <GalleryGrid images={batch.images} />
    </div>
  )
} 