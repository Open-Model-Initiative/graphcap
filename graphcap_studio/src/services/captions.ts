// SPDX-License-Identifier: Apache-2.0
import { Image } from './images';

/**
 * Types for caption data
 */
export interface CaptionMetadata {
  captioned_at: string | null;
  provider: string | null;
  model: string | null;
}

export interface PerspectiveData {
  config_name: string;
  version: string;
  model: string;
  provider: string;
  content: Record<string, any>;
}

export interface ImageCaptions {
  image: Image;
  perspectives: Record<string, PerspectiveData>;
  metadata: CaptionMetadata;
}

/**
 * Service for interacting with the captions API
 */
export const captionsService = {
  /**
   * Get captions for an image
   * 
   * @param imagePath - Path to the image
   * @returns Promise with the captions data
   */
  async getCaptions(imagePath: string): Promise<ImageCaptions> {
    console.log('captionsService.getCaptions called with path:', imagePath);
    
    try {
      const url = `/api/images/captions?path=${encodeURIComponent(imagePath)}`;
      console.log('Requesting captions from URL:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        // Check if the response is JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.error('Error response from captions API:', errorData);
          throw new Error(errorData.error || 'Failed to fetch captions');
        } else {
          // Handle non-JSON error response
          const errorText = await response.text();
          console.error('Non-JSON error response from captions API:', errorText);
          throw new Error('Failed to fetch captions: Server returned non-JSON response');
        }
      }
      
      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Unexpected non-JSON response:', responseText);
        throw new Error('Server returned non-JSON response');
      }
      
      const data = await response.json();
      console.log('Captions API response:', data);
      
      return data;
    } catch (error) {
      console.error('Error in captionsService.getCaptions:', error);
      // Return empty data structure if there's an error
      return {
        image: {
          path: imagePath,
          name: imagePath.split('/').pop() || '',
          directory: imagePath.split('/').slice(0, -1).join('/'),
          url: `/api/images/view${imagePath}`
        },
        perspectives: {},
        metadata: {
          captioned_at: null,
          provider: null,
          model: null
        }
      };
    }
  }
}; 