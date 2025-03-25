// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Service API
 *
 * This module provides direct API methods for interacting with the perspectives service.
 */

import { createInferenceBridgeClient } from "@/features/server-connections/services/apiClients";
import { API_ENDPOINTS } from "../constants/index";
import {
	CaptionRequestSchema,
	CaptionResponseSchema,
	ModuleListResponseSchema,
	ModulePerspectivesResponseSchema,
	PerspectiveListResponseSchema,
} from "../types";
import type {
	CaptionRequest,
	CaptionResponse,
	ModuleListResponse,
	ModulePerspectivesResponse,
	Perspective,
} from "../types";
import { ensureWorkspacePath, getGraphCapServerUrl, getInferenceBridgeApiUrl, handleApiError } from "./utils";

/**
 * Get server connections from local storage
 */
const getConnections = () => {
	// Get the current connections from local storage
	const connectionsStr = localStorage.getItem("inference-bridge-connections");
	let connections = [];
	
	if (connectionsStr) {
		try {
			connections = JSON.parse(connectionsStr);
		} catch (e) {
			console.warn("Could not parse server connections from localStorage");
		}
	}
	
	return connections;
};

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
			// Get connections and create the client
			const connections = getConnections();
			const client = createInferenceBridgeClient(connections);
			
			console.debug("Fetching perspectives using API client");
			
			const response = await client.perspectives.list.$get();

			if (!response.ok) {
				await handleApiError(response, "Failed to fetch perspectives");
			}

			const data = await response.json();
			// Validate the response with Zod
			const validatedData = PerspectiveListResponseSchema.parse(data);
			return validatedData.perspectives;
		} catch (error) {
			console.error("Error in perspectivesApi.listPerspectives:", error);
			throw error;
		}
	},

	/**
	 * Get a list of available perspective modules
	 * 
	 * @returns Promise with the list of modules
	 */
	async listModules(): Promise<ModuleListResponse> {
		try {
			// Get connections and create the client
			const connections = getConnections();
			const client = createInferenceBridgeClient(connections);
			
			console.debug("Fetching modules using API client");
			
			const response = await client.perspectives.modules.$get();

			if (!response.ok) {
				await handleApiError(response, "Failed to fetch perspective modules");
			}

			const data = await response.json();
			// Validate the response with Zod
			const validatedData = ModuleListResponseSchema.parse(data);
			return validatedData;
		} catch (error) {
			console.error("Error in perspectivesApi.listModules:", error);
			throw error;
		}
	},

	/**
	 * Get all perspectives for a specific module
	 * 
	 * @param moduleName - Name of the module to get perspectives for
	 * @returns Promise with the module and its perspectives
	 */
	async getModulePerspectives(moduleName: string): Promise<ModulePerspectivesResponse> {
		try {
			// Get connections and create the client
			const connections = getConnections();
			const client = createInferenceBridgeClient(connections);
			
			console.debug(`Fetching perspectives for module '${moduleName}' using API client`);
			
			const response = await client.perspectives.modules[":moduleName"].$get({
				param: { moduleName }
			});

			if (!response.ok) {
				// Check if we got HTML instead of JSON
				const contentType = response.headers.get("content-type");
				if (contentType?.includes("text/html")) {
					throw new Error(
						`Received HTML response instead of JSON. Status: ${response.status}. This typically indicates a routing issue or server error.`,
					);
				}

				await handleApiError(response, `Failed to fetch perspectives for module '${moduleName}'`);
			}

			// Check content type before parsing
			const contentType = response.headers.get("content-type");
			if (!contentType?.includes("application/json")) {
				console.error(`Unexpected content type: ${contentType}`);
				throw new Error(
					`Expected JSON response but got ${contentType ?? "unknown content type"}`,
				);
			}

			const data = await response.json();

			// Use looser validation to handle the complex fields
			// We'll validate but ignore validation errors to allow the data through
			try {
				// Try normal validation first
				const validatedData = ModulePerspectivesResponseSchema.parse(data);
				return validatedData;
			} catch (validationError: unknown) {
				// Log the validation error but still return the data
				console.warn("Response validation warning:", validationError);
				console.debug("Returning unvalidated response data for module:", moduleName);
				
				// Return the unvalidated data
				return data as ModulePerspectivesResponse;
			}
		} catch (error) {
			console.error(`Error in perspectivesApi.getModulePerspectives(${moduleName}):`, error);
			throw error;
		}
	},

	/**
	 * Generate a caption for an image using a perspective
	 *
	 * @param request - Caption request parameters
	 * @returns Promise with the caption response
	 */
	async generateCaption(
		requestParams: CaptionRequest,
	): Promise<CaptionResponse> {
		try {
			// Get connections and create the client
			const connections = getConnections();
			const client = createInferenceBridgeClient(connections);
			
			// Ensure the image path has the correct workspace prefix
			const normalizedImagePath = ensureWorkspacePath(requestParams.image_path);
			console.log("Generating caption for image path:", normalizedImagePath);
			
			// Create the request body and validate with Zod
			const request: CaptionRequest = {
				...requestParams,
				image_path: normalizedImagePath,
			};

			// Validate the request with Zod
			const validatedRequest = CaptionRequestSchema.parse(request);
			
			console.debug(`Generating caption for perspective '${requestParams.perspective}' using API client`);
			
			// Use the API client to post the request
			const response = await client.perspectives["caption-from-path"].$post({
				json: validatedRequest
			});

			if (!response.ok) {
				await handleApiError(response, "Failed to generate caption");
			}

			const data = await response.json();
			// Validate the response with Zod
			const validatedData = CaptionResponseSchema.parse(data);
			return validatedData;
		} catch (error) {
			console.error("Error in perspectivesApi.generateCaption:", error);
			throw error;
		}
	},
};
