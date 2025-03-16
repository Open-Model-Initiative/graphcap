// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Service API
 * 
 * This module provides direct API methods for interacting with the perspectives service.
 */

import { 
  CaptionRequest, 
  CaptionResponse, 
  Perspective, 
  PerspectiveListResponseSchema, 
  CaptionResponseSchema,
  CaptionRequestSchema
} from '../types';
import { API_ENDPOINTS } from '../constants/index';
import { ensureWorkspacePath, handleApiError } from './utils';

/**
 * Service for interacting with the perspectives API
 * 
 * Note: This service is provided for compatibility with non-React Query code.
 * For React components, prefer using the hooks.
 */
export const perspectivesApi = {
  /**
   * Get a list of available perspectives
   * 
   * @returns Promise with the list of perspectives
   */
  async listPerspectives(): Promise<Perspective[]> {
    try {
      const response = await fetch(API_ENDPOINTS.REST_LIST_PERSPECTIVES);
      
      if (!response.ok) {
        await handleApiError(response, 'Failed to fetch perspectives');
      }
      
      const data = await response.json();
      // Validate the response with Zod
      const validatedData = PerspectiveListResponseSchema.parse(data);
      return validatedData.perspectives;
    } catch (error) {
      console.error('Error in perspectivesApi.listPerspectives:', error);
      return [];
    }
  },
  
  /**
   * Generate a caption for an image using a perspective
   * 
   * @param request - Caption request parameters
   * @returns Promise with the caption response
   */
  async generateCaption(requestParams: CaptionRequest): Promise<CaptionResponse> {
    try {
      // Ensure the image path has the correct workspace prefix
      const normalizedImagePath = ensureWorkspacePath(requestParams.image_path);
      console.log('Generating caption for image path:', normalizedImagePath);
      console.log('Request params:', requestParams);
      // Create the request body and validate with Zod
      const request: CaptionRequest = {
        ...requestParams,
        image_path: normalizedImagePath,
      };
      
      // Validate the request with Zod
      const validatedRequest = CaptionRequestSchema.parse(request);
      
      // Make the API request
      const response = await fetch(API_ENDPOINTS.REST_GENERATE_CAPTION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedRequest),
      });
      
      if (!response.ok) {
        await handleApiError(response, 'Failed to generate caption');
      }
      
      const data = await response.json();
      // Validate the response with Zod
      const validatedData = CaptionResponseSchema.parse(data);
      return validatedData;
    } catch (error) {
      console.error('Error in perspectivesApi.generateCaption:', error);
      throw error;
    }
  },
};