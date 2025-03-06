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
const MEDIA_SERVER_URL = import.meta.env.VITE_MEDIA_SERVER_URL?.replace('graphcap_media_server', 'localhost') || 'http://localhost:32400';

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
  return `${MEDIA_SERVER_URL}/api/images/view${imagePath}`;
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
  return ImageProcessResponseSchema.parse(data);
}

/**
 * Upload an image
 * 
 * @param file - Image file to upload
 * @returns Promise with the uploaded image response
 */
export async function uploadImage(file: File): Promise<ImageProcessResponse> {
  console.log('Uploading image:', file.name);
  const formData = new FormData();
  formData.append('image', file);
  
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