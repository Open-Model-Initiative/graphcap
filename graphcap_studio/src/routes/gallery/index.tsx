// SPDX-License-Identifier: Apache-2.0
import { createFileRoute } from '@tanstack/react-router'
import { useDatasets } from '@/features/datasets/hooks/useDatasets'
import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/gallery/')({
  component: GalleryIndex
})

function GalleryIndex() {
  const { datasetsData, isLoading } = useDatasets()
  const navigate = useNavigate()
  
  useEffect(() => {
    // If datasets are loaded and there's at least one dataset, redirect to its route
    if (!isLoading && datasetsData?.datasets && datasetsData.datasets.length > 0) {
      const firstDataset = datasetsData.datasets[0]
      const path = `/gallery/${firstDataset.name}`
      navigate({ to: path })
    }
  }, [datasetsData, isLoading, navigate])
  
  // Show loading state while waiting for datasets
  return (
    <div className="flex items-center justify-center h-full">
      <p>Loading datasets...</p>
    </div>
  )
}
