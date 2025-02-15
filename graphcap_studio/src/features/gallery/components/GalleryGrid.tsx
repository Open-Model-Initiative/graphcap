import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef, useState } from 'react'

interface GalleryImage {
  id: string
  path: string
  annotations?: {
    type: string
    content: string
  }[]
}

interface GalleryGridProps {
  images: GalleryImage[]
}

export function GalleryGrid({ images }: GalleryGridProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [hoveredImage, setHoveredImage] = useState<GalleryImage | null>(null)

  // Create virtualizer instance
  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(images.length / 4), // 4 images per row
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // Row height estimate
    overscan: 5 // Number of rows to render outside viewport
  })

  // Handle empty images array
  if (!images.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No images to display</p>
      </div>
    )
  }

  return (
    <div 
      ref={parentRef}
      className="h-full w-full overflow-auto"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {rowVirtualizer.getVirtualItems().map(virtualRow => {
          const rowStart = virtualRow.index * 4
          const rowImages = images.slice(rowStart, rowStart + 4)

          return (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '200px',
                transform: `translateY(${virtualRow.start}px)`
              }}
              className="grid grid-cols-4 gap-4 p-4"
            >
              {rowImages.map(image => (
                <div
                  key={image.id}
                  className="relative group"
                  onMouseEnter={() => setHoveredImage(image)}
                  onMouseLeave={() => setHoveredImage(null)}
                >
                  <img
                    src={`${import.meta.env.VITE_WORKSPACE_PATH}/${image.path}`}
                    alt={image.id}
                    className="w-full h-full object-cover rounded-lg"
                    loading="lazy"
                  />
                  {hoveredImage?.id === image.id && image.annotations && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 rounded-b-lg">
                      {image.annotations.map(ann => (
                        <div key={ann.type}>
                          <span className="font-bold">{ann.type}:</span> {ann.content}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
} 