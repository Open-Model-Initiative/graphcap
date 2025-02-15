interface BatchMetadata {
  images: {
    id: string
    path: string
    annotations: {
      type: string
      content: string
      path: string
    }[]
  }[]
}

export async function loadBatchImages(batchId: string): Promise<BatchMetadata> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_WORKSPACE_PATH}/output/dags/${batchId}/manifest.json`
    )
    
    if (!response.ok) {
      // Check specific error cases
      if (response.status === 404) {
        throw new Error(`Batch ${batchId} not found`)
      }
      
      // Try to get error details from response
      const errorText = await response.text()
      throw new Error(
        `Failed to load batch manifest (${response.status}): ${errorText.slice(0, 100)}`
      )
    }

    // Verify we have JSON content type
    const contentType = response.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      throw new Error(`Expected JSON response but got ${contentType}`)
    }

    return response.json()
  } catch (error) {
    // Add more context to the error
    throw error instanceof Error 
      ? error 
      : new Error('Failed to load batch manifest: Network error')
  }
}

export async function loadAnnotation(path: string): Promise<string> {
  const response = await fetch(
    `${import.meta.env.VITE_WORKSPACE_PATH}/${path}`
  )
  
  if (!response.ok) {
    throw new Error('Failed to load annotation')
  }

  return response.text()
} 