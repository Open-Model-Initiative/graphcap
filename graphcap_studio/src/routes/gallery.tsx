import { createFileRoute } from '@tanstack/react-router'
import { GalleryView } from '../features/gallery/containers/GalleryView'

export const Route = createFileRoute('/gallery')({
  component: GalleryViewWrapper,
})

function GalleryViewWrapper() {
  const { batchId } = Route.useParams()
  return <GalleryView batchId={batchId} />
}
