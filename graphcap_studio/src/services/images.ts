// SPDX-License-Identifier: Apache-2.0
import { z } from 'zod';

/**
 * Image service for interacting with the Graphcap Media Server
 * 
 * This service provides functions for listing, viewing, and processing images
 * using the Graphcap Media Server API.
 * 
 * @module ImageService
 */

// Define the base URL for the media server API
// Use localhost instead of container name for browser access
const MEDIA_SERVER_URL = import.meta.env.VITE_MEDIA_SERVER_URL?.replace('graphcap_media_server', 'localhost') ?? 'http://localhost:32400';

// Log the media server URL for debugging
console.log('Media Server URL:', MEDIA_SERVER_URL);

// Define the image schema
export const ImageSchema = z.object({
  path: z.string(),
  name: z.string(),
  directory: z.string(),
  url: z.string(),
});

export type Image = z.infer<typeof ImageSchema>;

// Define the image list response schema
export const ImageListResponseSchema = z.object({
  images: z.array(ImageSchema),
});

export type ImageListResponse = z.infer<typeof ImageListResponseSchema>;

// Define the dataset schema
export const DatasetSchema = z.object({
  name: z.string(),
  images: z.array(ImageSchema),
});

export type Dataset = z.infer<typeof DatasetSchema>;

// Define the dataset list response schema
export const DatasetListResponseSchema = z.object({
  datasets: z.array(DatasetSchema),
});

export type DatasetListResponse = z.infer<typeof DatasetListResponseSchema>;

// Define the image process request schema
export const ImageProcessRequestSchema = z.object({
  imagePath: z.string(),
  operations: z.object({
    crop: z.object({
      left: z.number(),
      top: z.number(),
      width: z.number(),
      height: z.number(),
    }).optional(),
    rotate: z.number().optional(),
    resize: z.object({
      width: z.number(),
      height: z.number(),
    }).optional(),
    flip: z.boolean().optional(),
    flop: z.boolean().optional(),
  }).optional(),
  outputName: z.string().optional(),
  overwrite: z.boolean().optional(),
});

export type ImageProcessRequest = z.infer<typeof ImageProcessRequestSchema>;

// Define the image process response schema
export const ImageProcessResponseSchema = z.object({
  success: z.boolean(),
  path: z.string(),
  url: z.string(),
});

export type ImageProcessResponse = z.infer<typeof ImageProcessResponseSchema>;

// Cache for image URLs to avoid redundant requests
const imageUrlCache = new Map<string, string>();

// Cache for image thumbnails
const thumbnailCache = new Map<string, string>();

// Cache expiration time (30 minutes)
const CACHE_EXPIRATION = 30 * 60 * 1000;

/**
 * List all images in the workspace
 * 
 * @param directory - Optional directory path
 * @returns Promise with the list of images
 */
export async function listImages(directory?: string): Promise<ImageListResponse> {
  console.log('Listing images from directory:', directory);
  const url = new URL(`${MEDIA_SERVER_URL}/api/images`);
  if (directory) {
    url.searchParams.append('directory', directory);
  }
  
  console.log('Fetching from URL:', url.toString());
  const response = await fetch(url.toString());
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    throw new Error(`Failed to list images: ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('Received data:', data);
  return ImageListResponseSchema.parse(data);
}

/**
 * List all images in the datasets directory, grouped by dataset
 * 
 * @returns Promise with the list of datasets and their images
 */
export async function listDatasetImages(): Promise<DatasetListResponse> {
  console.log('Listing dataset images');
  const url = new URL(`${MEDIA_SERVER_URL}/api/datasets/images`);
  
  console.log('Fetching from URL:', url.toString());
  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to list dataset images: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Received datasets data:', data);
    return DatasetListResponseSchema.parse(data);
  } catch (error) {
    console.error('Error fetching dataset images:', error);
    throw error;
  }
}

/**
 * Get the URL for viewing an image
 * 
 * @param imagePath - Path to the image
 * @returns URL for viewing the image
 */
export function getImageUrl(imagePath: string): string {
  // Check if URL is in cache
  if (imageUrlCache.has(imagePath)) {
    return imageUrlCache.get(imagePath)!;
  }
  
  // Ensure the path starts with a slash and doesn't have duplicate slashes
  let normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  // Check if the path needs the workspace prefix
  // If the path doesn't start with /workspace and doesn't include datasets, add /workspace
  if (!normalizedPath.startsWith('/workspace') && 
      !normalizedPath.includes('/workspace/') && 
      normalizedPath.includes('/datasets')) {
    console.log('Adding workspace prefix to path:', normalizedPath);
    normalizedPath = `/workspace${normalizedPath}`;
  }
  
  // Add a cache-busting parameter to prevent CORS caching issues
  const cacheBuster = `_cb=${Date.now()}`;
  
  // Construct the URL with the media server URL and normalized path
  const url = `${MEDIA_SERVER_URL}/api/images/view${normalizedPath}?${cacheBuster}`;
  
  console.log('Generated image URL:', url, 'from path:', imagePath);
  
  // Cache the URL
  imageUrlCache.set(imagePath, url);
  
  // Set cache expiration
  setTimeout(() => {
    imageUrlCache.delete(imagePath);
  }, CACHE_EXPIRATION);
  
  return url;
}

/**
 * Get the URL for a thumbnail version of an image
 * 
 * @param imagePath - Path to the image
 * @param width - Desired width of the thumbnail
 * @param height - Desired height of the thumbnail
 * @returns URL for the thumbnail
 */
export function getThumbnailUrl(
  imagePath: string,
  width = 200,
  height = 200,
  format?: string
): string {
  const fmt = format ?? 'webp';
  const cacheKey = `${imagePath}_${width}x${height}_${fmt}`;
  
  if (thumbnailCache.has(cacheKey)) {
    return thumbnailCache.get(cacheKey)!;
  }
  
  let normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  if (
    !normalizedPath.startsWith('/workspace') &&
    !normalizedPath.includes('/workspace/') &&
    normalizedPath.includes('/datasets')
  ) {
    console.log('Adding workspace prefix to path for thumbnail:', normalizedPath);
    normalizedPath = `/workspace${normalizedPath}`;
  }
  
  const cacheBuster = `_cb=${Date.now()}`;
  const url = `${MEDIA_SERVER_URL}/api/images/view${normalizedPath}?width=${width}&height=${height}&format=${fmt}&${cacheBuster}`;
  
  console.log('Generated thumbnail URL:', url);
  
  thumbnailCache.set(cacheKey, url);
  setTimeout(() => {
    thumbnailCache.delete(cacheKey);
  }, CACHE_EXPIRATION);
  
  return url;
}


/**
 * Preload an image to cache it in the browser
 * 
 * @param imagePath - Path to the image
 * @param size - Size of the image to preload ('thumbnail' or 'full')
 */
export function preloadImage(imagePath: string, size: 'thumbnail' | 'full' = 'thumbnail'): void {
  const url = size === 'thumbnail' 
    ? getThumbnailUrl(imagePath) 
    : getImageUrl(imagePath);
  
  const img = new Image();
  img.src = url;
}

/**
 * Process an image
 * 
 * @param request - Image process request
 * @returns Promise with the processed image response
 */
export async function processImage(request: ImageProcessRequest): Promise<ImageProcessResponse> {
  console.log('Processing image:', request);
  const response = await fetch(`${MEDIA_SERVER_URL}/api/images/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    throw new Error(`Failed to process image: ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('Processed image result:', data);
  
  // Clear caches for this image path to ensure fresh data
  const imagePath = request.imagePath;
  imageUrlCache.delete(imagePath);
  
  // Clear all thumbnail cache entries for this image
  for (const key of thumbnailCache.keys()) {
    if (key.startsWith(imagePath + '_')) {
      thumbnailCache.delete(key);
    }
  }
  
  return ImageProcessResponseSchema.parse(data);
}

/**
 * Create a new dataset
 * 
 * @param name - Name of the dataset to create
 * @returns Promise that resolves when the dataset is created
 */
export async function createDataset(name: string): Promise<void> {
  console.log('Creating dataset:', name);
  const url = new URL(`${MEDIA_SERVER_URL}/api/datasets/create`);
  
  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      
      // Handle specific error cases
      if (response.status === 409) {
        throw new Error(`Dataset "${name}" already exists (409)`);
      } else {
        throw new Error(`Failed to create dataset: ${response.statusText}`);
      }
    }
    
    console.log('Dataset created successfully:', name);
  } catch (error) {
    console.error('Error creating dataset:', error);
    throw error;
  }
}

/**
 * Upload an image
 * 
 * @param file - The image file to upload
 * @param datasetName - Optional dataset name to upload to
 * @returns Promise with the uploaded image response
 */
export async function uploadImage(file: File, datasetName?: string): Promise<ImageProcessResponse> {
  console.log('Uploading image:', file.name, datasetName ? `to dataset: ${datasetName}` : '');
  
  const formData = new FormData();
  formData.append('image', file);
  
  // If dataset name is provided, add it to the form data
  if (datasetName) {
    formData.append('dataset', datasetName);
  }
  
  const response = await fetch(`${MEDIA_SERVER_URL}/api/images/upload`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    throw new Error(`Failed to upload image: ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('Upload result:', data);
  
  return ImageProcessResponseSchema.parse(data);
}

/**
 * Add an existing image to a dataset
 * 
 * @param imagePath - Path of the image to add
 * @param datasetName - Name of the dataset to add the image to
 * @returns Promise with the result of the operation
 */
export async function addImageToDataset(imagePath: string, datasetName: string): Promise<{ success: boolean; message: string }> {
  console.log('Adding image to dataset:', imagePath, 'to dataset:', datasetName);
  
  try {
    const response = await fetch(`${MEDIA_SERVER_URL}/api/datasets/add-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        imagePath, 
        datasetName 
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to add image to dataset: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Add image to dataset result:', result);
    
    return { 
      success: true, 
      message: `Image added to dataset ${datasetName} successfully` 
    };
  } catch (error) {
    console.error('Error adding image to dataset:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
} 